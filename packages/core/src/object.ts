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
import { isEqual } from 'lodash'

export default class Object {
  constructor(private ipfs: IPFS, private dir: string, private date: Date, private nonce: string) {}

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
        const json = JSON.parse(await Object.readString(this.ipfs.files.read(this.infoPath)))
        if (infoValidate(json)) {
          return json
        }
      } catch {}
      if (!this._info) {
        this._info = {}
      }
    }
    return this._info
  }
  async setInfo(info: Info) {
    if (this._info && isEqual(info, this._info)) {
      return
    }
    if (!infoValidate(info)) {
      throw new Error(`Invalid info schema`)
    }
    this._info = info
    await this.ipfs.files.write(this.infoPath, JSON.stringify(info), {
      parents: true,
      create: true,
      truncate: true,
    })
  }

  private static async readString(source: AsyncIterable<Uint8Array>): Promise<string> {
    let str = ''
    const decoder = new TextDecoder()
    for await (const chunk of source) {
      str += decoder.decode(chunk, { stream: true })
    }
    return str
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
