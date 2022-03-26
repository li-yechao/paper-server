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

import { Inject, UseGuards } from '@nestjs/common'
import { Args, Int, Mutation, Parent, ResolveField, Resolver, Subscription } from '@nestjs/graphql'
import { PubSub } from 'graphql-subscriptions'
import { AuthGuard, CurrentUser } from '../auth/auth.guard'
import { GraphqlContext } from '../GraphqlContext'
import { CreateObjectInput, ObjectOrder, UpdateObjectInput } from './object.input'
import { Object_ } from './object.schema'
import { ObjectService } from './object.service'
import { ObjectConnection } from './user-object.resolver'

@Resolver(() => Object_)
@UseGuards(AuthGuard)
export class ObjectResolver {
  constructor(
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
    private readonly objectService: ObjectService
  ) {}

  @ResolveField(() => String, { nullable: true })
  async data(@Parent() object: Object_): Promise<string | null> {
    if (!object.cid) {
      return null
    }
    return this.objectService.objectData({ cid: object.cid })
  }

  @Mutation(() => Object_)
  async createObject(
    @CurrentUser() user: CurrentUser,
    @Args('input') input: CreateObjectInput,
    @Args('parentId', { nullable: true }) parentId?: string
  ): Promise<Object_> {
    const object = await this.objectService.create({ parentId, userId: user.id, input })
    this.pubSub.publish('objectCreated', { objectCreated: object })
    return object
  }

  @Mutation(() => Object_)
  async updateObject(
    @CurrentUser() user: CurrentUser,
    @Args('objectId') objectId: string,
    @Args('input') input: UpdateObjectInput
  ): Promise<Object_> {
    return this.objectService.update({ userId: user.id, objectId, input })
  }

  @Mutation(() => Boolean)
  async deleteObject(
    @CurrentUser() user: CurrentUser,
    @Args('objectId') objectId: string
  ): Promise<boolean> {
    await this.objectService.delete({ userId: user.id, objectId })
    return true
  }

  @ResolveField(() => ObjectConnection)
  async objects(
    @Parent() object: Object_,
    @Args('before', { nullable: true }) before?: string,
    @Args('after', { nullable: true }) after?: string,
    @Args('first', { type: () => Int, nullable: true }) first?: number,
    @Args('last', { type: () => Int, nullable: true }) last?: number,
    @Args('orderBy', { nullable: true }) orderBy?: ObjectOrder
  ): Promise<ObjectConnection> {
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

  @Subscription(() => Object_, {
    filter: (payload: { objectCreated?: Object_ }, _, context: GraphqlContext) => {
      return !!context.user && payload.objectCreated?.userId === context.user?.id
    },
  })
  objectCreated() {
    return this.pubSub.asyncIterator('objectCreated')
  }
}
