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

import Object, { ObjectInfo, objectInfoSchema } from '@paper/core/src/object'
import Ajv, { JTDSchemaType } from 'ajv/dist/jtd'

export class Paper {
  constructor(readonly object: Object) {}

  async getInfo(): Promise<PaperInfo> {
    const info = await this.object.getInfo()
    if (!validatePaperInfo(info)) {
      throw new Error(`Invalid paper info`)
    }
    return info
  }
  async setInfo(info: PaperInfo) {
    if (!validatePaperInfo(info)) {
      throw new Error(`Invalid paper info`)
    }
    this.object.setInfo(info)
  }

  get contentPath() {
    return `${this.object.path}/paper.json`
  }
  async setContent(content: string) {
    await this.object.write(this.contentPath, content, {
      parents: true,
      create: true,
      truncate: true,
    })
  }
  async getContent(): Promise<string> {
    try {
      const buffer = await this.object.read(this.contentPath)
      return new TextDecoder().decode(buffer)
    } catch (error: any) {
      if (error.code === 'ERR_NOT_FOUND') {
        return ''
      }
      throw error
    }
  }
}

export interface PaperInfo extends ObjectInfo {}

const paperInfoSchema: JTDSchemaType<PaperInfo> = {
  properties: {
    ...objectInfoSchema.properties,
  },
  optionalProperties: {
    ...objectInfoSchema.optionalProperties,
  },
}

const validatePaperInfo = new Ajv().compile(paperInfoSchema)
