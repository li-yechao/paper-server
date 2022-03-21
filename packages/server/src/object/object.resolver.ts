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

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { AuthGuard, CurrentUser } from '../auth/auth.guard'
import { CreateObjectInput, UpdateObjectInput } from './object.input'
import { Object_ } from './object.schema'
import { ObjectService } from './object.service'

@Resolver(() => Object_)
@UseGuards(AuthGuard)
export class ObjectResolver {
  constructor(private readonly objectService: ObjectService) {}

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
    @Args('input') input: CreateObjectInput
  ): Promise<Object_> {
    return this.objectService.create({ userId: user.id, input })
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
}
