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
import Ajv, { JTDSchemaType } from 'ajv/dist/jtd'
import { ReadOptions, WriteOptions } from 'ipfs-core-types/src/files'
import all from 'it-all'
import { isEqual } from 'lodash'
import { nanoid } from 'nanoid'
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
  async read(ipfsPath: string, options?: ReadOptions): Promise<ArrayBuffer> {
    const key = await this.getPassword()
    const buffer = await Object.readBuffer(this.ipfs.files.read(ipfsPath, options))
    return crypto.aes.decrypt(key, buffer)
  }
  async write(ipfsPath: string, content: string | ArrayBuffer, options?: WriteOptions) {
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

  private get createdAt(): number {
    return this.date.getTime()
  }

  private _info?: ObjectInfo
  async getInfo(): Promise<ObjectInfo & { createdAt: number }> {
    if (!this._info) {
      try {
        const json = JSON.parse(new TextDecoder().decode(await this.read(this.infoPath)))
        if (validateObjectInfo(json)) {
          this._info = json
        }
      } catch {}
      if (!this._info) {
        this._info = {}
      }
    }
    return { ...this._info, createdAt: this.createdAt }
  }
  async setInfo(info: ObjectInfo) {
    if (!validateObjectInfo(info)) {
      throw new Error(`Invalid object info`)
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

  async delete() {
    await this.ipfs.files.rm(this.path, { recursive: true })
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

export interface ObjectInfo {
  updatedAt?: number
  title?: string
  description?: string
}

export const objectInfoSchema: JTDSchemaType<ObjectInfo> = {
  properties: {},
  optionalProperties: {
    updatedAt: { type: 'uint32' },
    title: { type: 'string' },
    description: { type: 'string' },
  },
} as const

const validateObjectInfo = new Ajv().compile(objectInfoSchema)
