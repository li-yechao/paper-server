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
import { Model } from 'mongoose'
import { User } from './user.schema'

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async findOne(query: { userId: string } | { thirdType: string; thirdId: string }): Promise<User> {
    function isThirdQuery(q: any): q is { thirdType: string; thirdId: string } {
      return typeof q?.thirdType === 'string'
    }

    const filter = isThirdQuery(query)
      ? { [`thirds.${query.thirdType}.__id`]: query.thirdId }
      : { _id: query.userId }

    const user = await this.userModel.findOne({ ...filter })

    if (!user) {
      throw new Error(`User not found`)
    }

    return user
  }

  async createOrUpdate({
    name,
    thirdType,
    thirdId,
    thirdUser,
  }: {
    name?: string
    thirdType: string
    thirdId: string
    thirdUser: { [key: string]: any }
  }): Promise<User> {
    const user = await this.userModel.findOneAndUpdate(
      { [`thirds.${thirdType}.__id`]: thirdId },
      {
        $set: {
          updatedAt: Date.now(),
          [`thirds.${thirdType}`]: {
            __id: thirdId,
            ...thirdUser,
          },
        },
        $setOnInsert: {
          name,
          createdAt: Date.now(),
        },
      },
      { upsert: true, new: true }
    )

    if (!user) {
      throw new Error(`User not found`)
    }

    return user
  }
}
