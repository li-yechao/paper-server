// Copyright 2021 LiYechao
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import Ajv, { JTDSchemaType } from 'ajv/dist/jtd'
import { MvOptions, ReadOptions, StatOptions, WriteOptions } from 'ipfs-core-types/src/files'
import all from 'it-all'
import { nanoid } from 'nanoid'
import { Account } from '.'
import { crypto } from './crypto'
import { fileUtils } from './utils/files'

export default class Object {
  constructor(account: Account, path: string, draftPath: string, id: string, createdAt: number) {
    this.#_account = account
    this.#path = path
    this.#draftPath = draftPath
    this.id = id
    this.createdAt = createdAt
  }

  get version() {
    return this.#objectInfo?.version
  }

  #_account?: Account

  get #account(): Account {
    if (!this.#_account) {
      throw new Error(`account is undefined, maybe object has been destroy`)
    }
    return this.#_account
  }

  #path: string
  #draftPath: string

  readonly id: string
  readonly createdAt: number

  #_init?: Promise<void>

  get #init(): Promise<void> {
    if (!this.#_init) {
      this.#_init = (async () => {
        this.#objectInfo = await this.#readInfo(`${this.#path}/${this.#infoFilename}`)
        this.#draftInfo = await this.#readInfo(`${this.#draftPath}/${this.#infoFilename}`)

        if (
          this.#objectInfo &&
          (!this.#draftInfo || this.#objectInfo.version > this.#draftInfo.version)
        ) {
          await fileUtils.rmIfExists(this.#account.ipfs, this.#draftPath, { recursive: true })
          await this.#account.files.cp(this.#path, this.#draftPath, { parents: true })

          this.#draftInfo = await this.#readInfo(`${this.#draftPath}/${this.#infoFilename}`)
        }

        if (!this.#draftInfo) {
          this.#draftInfo = { version: 0 }
        }
        if (!this.#objectInfo) {
          this.#objectInfo = { version: 0 }
        }
      })()
    }
    return this.#_init
  }

  readonly #passwordFilename = 'password'

  #_password?: Promise<string>

  get #password(): Promise<string> {
    if (!this.#_password) {
      const getPassword = async (path: string) => {
        try {
          const raw = await Object.#readBuffer(this.#account.files.read(path))
          return new TextDecoder().decode(await this.#account.crypto.aes.decrypt(raw))
        } catch (error) {
          if (!fileUtils.isErrNotFound(error)) {
            throw error
          }
        }
      }

      this.#_password = (async () => {
        return (
          (await getPassword(`${this.#path}/${this.#passwordFilename}`)) ||
          (await getPassword(`${this.#draftPath}/${this.#passwordFilename}`)) ||
          (await (async () => {
            const password = nanoid(32)
            const raw = await this.#account.crypto.aes.encrypt(new TextEncoder().encode(password))
            await this.#account.files.write(
              `${this.#draftPath}/${this.#passwordFilename}`,
              new Uint8Array(raw),
              {
                parents: true,
                create: true,
                truncate: true,
              }
            )
            return password
          })())
        )
      })()
    }
    return this.#_password
  }

  readonly #infoFilename = `info.json`

  #objectInfo?: ObjectInfo

  #draftInfo?: ObjectInfo

  get info(): Promise<ObjectInfo & { isDraft: boolean }> {
    return this.#init.then(() => {
      if (!this.#draftInfo || !this.#objectInfo) {
        throw new Error('object is not initialized')
      }
      const isDraft = this.#draftInfo.version > this.#objectInfo.version
      return { ...this.#draftInfo, isDraft }
    })
  }

  async setInfo(info: Partial<Omit<ObjectInfo, 'version' | 'updatedAt'>> = {}) {
    await this.#init
    if (!this.#draftInfo) {
      throw new Error('object is not initialized')
    }
    for (const i in info) {
      if (i !== 'version' && i !== 'updatedAt' && (info as any)[i] !== undefined) {
        ;(this.#draftInfo as any)[i] = (info as any)[i]
      }
    }
    this.#draftInfo.updatedAt = Date.now()
    this.#draftInfo.version += 1
    await this.write(this.#infoFilename, JSON.stringify(this.#draftInfo), {
      parents: true,
      create: true,
      truncate: true,
    })
  }

  async stat(filename: string, options?: StatOptions) {
    await this.#init
    return this.#account.files.stat(`${this.#draftPath}/${filename}`, options)
  }

  async mv(filename: string, to: string, options?: MvOptions) {
    await this.#init
    return this.#account.files.mv(
      `${this.#draftPath}/${filename}`,
      `${this.#draftPath}/${to}`,
      options
    )
  }

  async #read(path: string, options?: ReadOptions): Promise<ArrayBuffer> {
    const buffer = await Object.#readBuffer(this.#account.files.read(path, options))
    return crypto.aes.decrypt(await this.#password, buffer)
  }

  async #readInfo(path: string) {
    try {
      const json = JSON.parse(new TextDecoder().decode(await this.#read(path)))
      if (validateObjectInfo(json)) {
        return json
      }
    } catch {}
  }

  async read(filename: string, options?: ReadOptions): Promise<ArrayBuffer> {
    await this.#init
    return this.#read(`${this.#draftPath}/${filename}`, options)
  }

  async #write(path: string, content: string | ArrayBuffer, options?: WriteOptions) {
    if (typeof content === 'string') {
      content = new TextEncoder().encode(content)
    }
    const buffer = await crypto.aes.encrypt(await this.#password, content)
    await this.#account.files.write(path, new Uint8Array(buffer), options)
  }

  async write(filename: string, content: string | ArrayBuffer, options?: WriteOptions) {
    await this.#init
    return this.#write(`${this.#draftPath}/${filename}`, content, options)
  }

  async delete() {
    await this.#init
    if (await fileUtils.rmIfExists(this.#account.ipfs, this.#path, { recursive: true })) {
      await this.#account.publish()
    }
    await fileUtils.rmIfExists(this.#account.ipfs, this.#draftPath, { recursive: true })
    this.destroy()
  }

  async publish() {
    await this.#init
    await fileUtils.rmIfExists(this.#account.ipfs, this.#path, { recursive: true })
    await this.#account.files.cp(this.#draftPath, this.#path, { parents: true })
    await this.#account.publish()

    // Update objectInfo
    this.#objectInfo = await this.#readInfo(`${this.#path}/${this.#infoFilename}`)
  }

  static async #readBuffer(source: AsyncIterable<Uint8Array>): Promise<Uint8Array> {
    const chunks = await all(source)
    const buffer = new Uint8Array(chunks.reduce((res, i) => res + i.byteLength, 0))
    let offset = 0
    for (const chunk of chunks) {
      buffer.set(chunk, offset)
      offset += chunk.byteLength
    }
    return buffer
  }

  private destroy() {
    this.#_account = undefined
  }
}

export interface ObjectInfo {
  version: number
  updatedAt?: number
  title?: string
  description?: string
}

export const objectInfoSchema: JTDSchemaType<ObjectInfo> = {
  properties: {
    version: { type: 'uint32' },
  },
  optionalProperties: {
    updatedAt: { type: 'float64' },
    title: { type: 'string' },
    description: { type: 'string' },
  },
  additionalProperties: true,
} as const

const validateObjectInfo = new Ajv().compile(objectInfoSchema)
