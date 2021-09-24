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

import { IPFS } from '@paper/ipfs'
import Ajv, { JSONSchemaType } from 'ajv'
import all from 'it-all'
import { isEqual } from 'lodash'
import { nanoid } from 'nanoid'
import { ReadOptions, WriteOptions } from 'ipfs-core-types/src/files'
import { crypto } from './crypto'

export default class Object {
  constructor(
    private ipfs: IPFS,
    private crypto: crypto.Crypto,
    private dir: string,
    private date: Date,
    private nonce: string
  ) {}

  private get passwordPath() {
    return `${this.path}/password`
  }
  private password?: string
  private async getPassword(): Promise<string> {
    if (!this.password) {
      const textEncoder = new TextEncoder()
      const textDecoder = new TextDecoder()

      try {
        const raw = await Object.readBuffer(this.ipfs.files.read(this.passwordPath))
        this.password = textDecoder.decode(await this.crypto.aes.decrypt(raw))
      } catch (error: any) {
        if (error.code === 'ERR_NOT_FOUND') {
          this.password = nanoid(32)
          const raw = await this.crypto.aes.encrypt(textEncoder.encode(this.password))
          await this.ipfs.files.write(this.passwordPath, new Uint8Array(raw), {
            parents: true,
            create: true,
            truncate: true,
          })
        } else {
          throw error
        }
      }
    }
    return this.password
  }
  private async read(ipfsPath: string, options?: ReadOptions): Promise<ArrayBuffer> {
    const key = await this.getPassword()
    const buffer = await Object.readBuffer(this.ipfs.files.read(ipfsPath, options))
    return crypto.aes.decrypt(key, buffer)
  }
  private async write(ipfsPath: string, content: string | ArrayBuffer, options?: WriteOptions) {
    const key = await this.getPassword()
    if (typeof content === 'string') {
      content = new TextEncoder().encode(content)
    }
    const buffer = await crypto.aes.encrypt(key, content)
    await this.ipfs.files.write(ipfsPath, new Uint8Array(buffer), options)
  }

  get path() {
    const year = this.date.getFullYear().toString()
    const month = (this.date.getMonth() + 1).toString().padStart(2, '0')
    const date = this.date.getDate().toString().padStart(2, '0')
    const folder = `${this.date.getTime()}-${this.nonce}`

    return `${this.dir}/${year}/${month}/${date}/${folder}`
  }

  async init() {
    await this.ipfs.files.mkdir(this.path, { parents: true })
  }

  private get infoPath() {
    return `${this.path}/info.json`
  }

  private _info?: Info
  async getInfo(): Promise<Info> {
    if (!this._info) {
      try {
        const json = JSON.parse(new TextDecoder().decode(await this.read(this.infoPath)))
        if (infoValidate(json)) {
          this._info = json
        }
      } catch {}
      if (!this._info) {
        this._info = {}
      }
    }
    return this._info
  }
  async setInfo(info: Info) {
    if (!infoValidate(info)) {
      throw new Error(`Invalid info schema`)
    }

    const old = await this.getInfo()
    if (isEqual(old, info)) {
      return
    }

    this._info = info
    await this.write(this.infoPath, JSON.stringify(info), {
      parents: true,
      create: true,
      truncate: true,
    })
  }

  private static async readBuffer(source: AsyncIterable<Uint8Array>): Promise<Uint8Array> {
    const chunks = await all(source)
    const buffer = new Uint8Array(chunks.reduce((res, i) => res + i.byteLength, 0))
    let offset = 0
    for (const chunk of chunks) {
      buffer.set(chunk, offset)
      offset += chunk.byteLength
    }
    return buffer
  }
}

export type JsonPrimitive = string | number | boolean | null
export type JsonObject = { [x: string]: JsonValue }
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[]

export interface Info {
  title?: string | null
  description?: string | null
  [key: string]: JsonValue | undefined
}

const infoValidate = new Ajv().compile<JSONSchemaType<Info>>({
  type: 'object',
  properties: {
    title: { type: 'string', nullable: true },
    description: { type: 'string', nullable: true },
  },
})
