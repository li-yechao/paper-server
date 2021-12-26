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

import { Account, Object, ObjectInfo, objectInfoSchema } from '@paper/core'
import { DocJson } from '@paper/editor'
import Ajv, { JTDSchemaType } from 'ajv/dist/jtd'
import { memoize } from 'lodash'
import { customAlphabet } from 'nanoid'
import { atom, useRecoilValue } from 'recoil'

export class Paper {
  constructor(readonly object: Object) {}

  private _info?: Promise<PaperInfo>

  get info() {
    if (!this._info) {
      this._info = this.object.info.then(info => {
        if (!validatePaperInfo(info)) {
          throw new Error(`Invalid paper info`)
        }
        return info
      })
    }
    return this._info
  }

  async setInfo(info: Partial<PaperInfo> = {}) {
    this._info = this.object.setInfo(info)
    await this._info
  }

  private readonly contentFilePath = '/paper.json'

  async setContent(content: DocJson) {
    await this.object.write(this.contentFilePath, JSON.stringify(content), {
      parents: true,
      create: true,
      truncate: true,
    })
  }

  async getContent(): Promise<DocJson | undefined> {
    try {
      const buffer = await this.object.read(this.contentFilePath)
      const str = new TextDecoder().decode(buffer)
      return upgradeSchema(JSON.parse(str))
    } catch (error: any) {
      if (error.code === 'ERR_NOT_FOUND') {
        return
      }
      throw error
    }
  }

  static fileId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 32)

  async addResource(files: File[]): Promise<string> {
    const tmp = `files/${Paper.fileId()}`
    for (const file of files) {
      const buffer = await file.arrayBuffer()
      await this.object.write(`${tmp}/${file.name}`, buffer, {
        parents: true,
        create: true,
        truncate: true,
      })
    }
    const cid = (await this.object.files.stat(tmp)).cid
    await this.object.files.mv(tmp, `files/${cid}`)
    return cid
  }

  async getResource(cid: string, filename: string): Promise<File> {
    const buffer = await this.object.read(`files/${cid}/${filename}`)
    return new File([new Blob([buffer])], filename)
  }
}

const paperState = memoize(
  (account: Account, objectId: string) => {
    return atom({
      key: `paperState-${account.user.id}-${objectId}`,
      default: account.object(objectId).then(object => new Paper(object)),
      dangerouslyAllowMutability: true,
    })
  },
  (account, objectId) => `paperState-${account.user.id}-${objectId}`
)

export function usePaper({ account, objectId }: { account: Account; objectId: string }) {
  const state = paperState(account, objectId)
  return useRecoilValue(state)
}

export interface PaperInfo extends ObjectInfo {}

const paperInfoSchema: JTDSchemaType<PaperInfo> = {
  properties: {
    ...objectInfoSchema.properties,
  },
  optionalProperties: {
    ...objectInfoSchema.optionalProperties,
  },
  additionalProperties: true,
} as const

const validatePaperInfo = new Ajv().compile(paperInfoSchema)

function upgradeSchema(node: DocJson): DocJson | undefined {
  if (!node) {
    return node
  }
  const n = {
    ...node,
  }

  if (n.type === 'ordered_item' || n.type === 'bullet_item') {
    n.type = 'list_item'
  }

  if (n.type === 'image_block_caption') {
    n.type = 'text'
    n.text = n.content?.[0]?.text ?? ''
    n.content = []
  }

  if (n.type === 'title') {
    n.type = 'heading'
    n.attrs = { level: 1 }
  }

  if (n.type === 'tag_list' || n.type === 'tag_item') {
    return
  }

  n.content = n.content?.map(upgradeSchema).filter((i: any) => !!i)

  return n
}
