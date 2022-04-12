// Copyright 2022 LiYechao
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

import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import all from 'it-all'
import mongoose from 'mongoose'
import { Model } from 'mongoose'
import { IpfsService } from './ipfs.service'
import { CreateObjectInput, ObjectDataEncoding, UpdateObjectInput } from './object.input'
import { ObjectHistory, Object_ } from './object.schema'

@Injectable()
export class ObjectService {
  constructor(
    @InjectModel(Object_.name) private readonly objectModel: Model<Object_>,
    @InjectModel(ObjectHistory.name) private readonly objectHistoryModel: Model<ObjectHistory>,
    private readonly ipfsService: IpfsService
  ) {}

  async findOne({ userId, objectId }: { userId?: string; objectId: string }): Promise<Object_> {
    const object = await this.objectModel.findOne({ _id: objectId, userId, deletedAt: null })
    if (!object) {
      throw new Error(`Object ${objectId} not found`)
    }
    return object
  }

  async find({
    userId,
    parentId,
    filter,
    sort,
    limit,
  }: {
    userId: string
    parentId?: string | null
    filter?: mongoose.FilterQuery<Omit<Object_, 'userId' | 'deletedAt'>>
    sort?: { [key in keyof Object_]?: 1 | -1 }
    limit?: number
  }): Promise<Object_[]> {
    return this.objectModel.find({ userId, parentId, deletedAt: null, ...filter }, null, {
      sort,
      limit,
    })
  }

  async count({
    userId,
    parentId,
    filter,
  }: {
    userId: string
    parentId?: string | null
    filter?: mongoose.FilterQuery<Omit<Object_, 'userId' | 'deletedAt'>>
  }): Promise<number> {
    return this.objectModel.count({ userId, parentId, deletedAt: null, ...filter })
  }

  async create({
    parentId,
    userId,
    input,
  }: {
    parentId?: string
    userId: string
    input: CreateObjectInput
  }): Promise<Object_> {
    const now = Date.now()

    const cid = (await this.ipfsAdd(input))?.cid.toString()

    const object = await this.objectModel.create({
      parentId,
      userId,
      createdAt: now,
      updatedAt: now,
      cid,
      meta: input.meta,
    })

    await this.createHistory(object)

    return object
  }

  async update({
    userId,
    objectId,
    input,
  }: {
    userId?: string
    objectId: string
    input: UpdateObjectInput
  }): Promise<Object_> {
    const now = Date.now()

    const cid = (await this.ipfsAdd(input))?.cid.toString()

    const object = await this.objectModel.findOneAndUpdate(
      { _id: objectId, userId, deletedAt: null },
      {
        $set: {
          updatedAt: now,
          cid,
          meta: input.meta,
        },
      },
      { new: true }
    )

    if (!object) {
      throw new Error(`Object ${objectId} not found`)
    }

    await this.createHistory(object)

    return object
  }

  async delete({ userId, objectId }: { userId?: string; objectId: string }): Promise<Object_> {
    const now = Date.now()

    const object = await this.objectModel.findOneAndUpdate(
      { _id: objectId, userId, deletedAt: null },
      { $set: { deletedAt: now } },
      { new: true }
    )

    if (!object) {
      throw new Error(`Object ${objectId} not found`)
    }

    return object
  }

  async objectData({ cid }: { cid: string }): Promise<string> {
    return Buffer.concat(await all(this.ipfsService.cat(cid))).toString()
  }

  private async ipfsAdd(input: Pick<CreateObjectInput, 'data' | 'encoding'>) {
    if (!input.data) {
      return
    }
    return this.ipfsService.add(
      Buffer.from(
        input.data,
        input.encoding !== undefined
          ? ({ [ObjectDataEncoding.BASE64]: 'base64' } as const)[input.encoding]
          : undefined
      )
    )
  }

  private async createHistory(object: Object_) {
    return this.objectHistoryModel.create({
      createdAt: Date.now(),
      objectId: object.id,
      objectUpdatedAt: object.updatedAt,
      cid: object.cid,
      meta: object.meta,
    })
  }
}
