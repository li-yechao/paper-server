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

import { ForbiddenException } from '@nestjs/common'
import { Args, Int, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { CurrentUser, CurrentUserOptional } from '../auth/auth.guard'
import { Config } from '../config'
import { CreateObjectInput, ObjectOrder, UpdateObjectInput } from './object.input'
import { Object_ } from './object.schema'
import { ObjectService } from './object.service'
import { ObjectConnection } from './user-object.resolver'

@Resolver(() => Object_)
export class ObjectResolver {
  constructor(private readonly config: Config, private readonly objectService: ObjectService) {}

  @ResolveField(() => String, { nullable: true })
  async data(
    @CurrentUserOptional() currentUser: CurrentUser | null,
    @Parent() object: Object_
  ): Promise<string | null> {
    if (!object.cid) {
      return null
    }
    if (!object.public && object.userId !== currentUser?.id) {
      throw new ForbiddenException('Forbidden')
    }
    return this.objectService.objectData({ cid: object.cid })
  }

  @Mutation(() => Object_)
  async createObject(
    @CurrentUser() user: CurrentUser,
    @Args('input') input: CreateObjectInput,
    @Args('parentId', { nullable: true }) parentId?: string
  ): Promise<Object_> {
    return this.objectService.create({ parentId, userId: user.id, input })
  }

  @Mutation(() => Object_)
  async updateObject(
    @CurrentUser() user: CurrentUser,
    @Args('objectId') objectId: string,
    @Args('input') input: UpdateObjectInput
  ): Promise<Object_> {
    return this.objectService.update({ userId: user.id, objectId, input })
  }

  @Mutation(() => Object_)
  async deleteObject(
    @CurrentUser() user: CurrentUser,
    @Args('objectId') objectId: string
  ): Promise<Object_> {
    return this.objectService.delete({ userId: user.id, objectId })
  }

  @ResolveField(() => ObjectConnection)
  async objects(
    @CurrentUserOptional() currentUser: CurrentUser | null,
    @Parent() object: Object_,
    @Args('before', { nullable: true }) before?: string,
    @Args('after', { nullable: true }) after?: string,
    @Args('first', { type: () => Int, nullable: true }) first?: number,
    @Args('last', { type: () => Int, nullable: true }) last?: number,
    @Args('orderBy', { nullable: true }) orderBy?: ObjectOrder
  ): Promise<ObjectConnection> {
    if (!object.public && object.userId !== currentUser?.id) {
      throw new ForbiddenException('Forbidden')
    }

    return new ObjectConnection({
      before,
      after,
      first,
      last,
      orderBy,
      find: options =>
        this.objectService.find({ userId: object.userId, parentId: object.id, ...options }),
      count: options =>
        this.objectService.count({ userId: object.userId, parentId: object.id, ...options }),
    })
  }

  @ResolveField(() => String, { nullable: true })
  async uri(
    @CurrentUserOptional() currentUser: CurrentUser | null,
    @Parent() object: Object_
  ): Promise<string | undefined> {
    if (!object.cid) {
      return
    }
    if (!object.public && object.userId !== currentUser?.id) {
      throw new ForbiddenException('Forbidden')
    }
    return `${this.config.ipfs.uri}/${object.cid}`
  }
}
