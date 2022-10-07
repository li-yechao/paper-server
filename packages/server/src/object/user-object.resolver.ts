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

import { Args, Field, Int, ObjectType, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { User } from '../user/user.schema'
import { Connection, ConnectionOptions, PageInfo } from '../utils/Connection'
import { ObjectOrder, ObjectOrderField } from './object.input'
import { Object_ } from './object.schema'
import { ObjectService } from './object.service'

@Resolver(() => User)
export class UserObjectResolver {
  constructor(private readonly objectService: ObjectService) {}

  @ResolveField(() => ObjectConnection)
  async objects(
    @Parent() user: User,
    @Args('parentId', { nullable: true }) parentId?: string,
    @Args('before', { nullable: true }) before?: string,
    @Args('after', { nullable: true }) after?: string,
    @Args('first', { type: () => Int, nullable: true }) first?: number,
    @Args('last', { type: () => Int, nullable: true }) last?: number,
    @Args('orderBy', { nullable: true }) orderBy?: ObjectOrder,
    @Args('public', { type: () => Boolean, nullable: true }) isPublic?: boolean
  ): Promise<ObjectConnection> {
    return new ObjectConnection({
      before,
      after,
      first,
      last,
      orderBy,
      find: options =>
        this.objectService.find({
          ...options,
          userId: user.id,
          parentId: parentId || null,
          filter: { ...options.filter, public: isPublic },
        }),
      count: options =>
        this.objectService.count({
          ...options,
          userId: user.id,
          parentId: parentId || null,
          filter: { ...options.filter, public: isPublic },
        }),
    })
  }

  @ResolveField(() => Object_)
  async object(@Parent() user: User, @Args('objectId') objectId: string): Promise<Object_> {
    return this.objectService.findOne({ objectId, userId: user.id })
  }
}

@ObjectType()
export class ObjectConnection extends Connection<Object_> {
  constructor({
    orderBy,
    ...options
  }: Omit<ConnectionOptions<Object_>, 'orderBy'> & { orderBy?: ObjectOrder }) {
    super({
      ...options,
      orderBy: orderBy && {
        field: (
          {
            [ObjectOrderField.CREATED_AT]: 'createdAt',
            [ObjectOrderField.UPDATED_AT]: 'updatedAt',
          } as const
        )[orderBy.field],
        direction: orderBy.direction,
      },
    })
  }

  @Field(() => [Object_])
  override get nodes(): Promise<Object_[]> {
    return super.nodes
  }

  @Field(() => [ObjectEdge])
  override get edges(): Promise<ObjectEdge[]> {
    return super.edges
  }

  @Field(() => PageInfo)
  override get pageInfo(): PageInfo {
    return super.pageInfo
  }

  @Field(() => Int)
  override get totalCount(): Promise<number> {
    return super.totalCount
  }
}

@ObjectType()
export class ObjectEdge {
  @Field(() => String)
  cursor!: string

  @Field(() => Object_)
  node!: Object_
}
