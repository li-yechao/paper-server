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

import { BadRequestException } from '@nestjs/common'
import { Field, ObjectType } from '@nestjs/graphql'
import { isNumber, isPositive } from 'class-validator'
import mongoose from 'mongoose'
import { OrderDirection } from './OrderDirection'

export interface ConnectionOptions<T> {
  before?: string
  after?: string
  first?: number
  last?: number
  offset?: number
  orderBy?: { field: keyof T; direction: OrderDirection }
  find: (options: {
    filter?: mongoose.FilterQuery<T>
    sort?: { [key in keyof T | '_id']?: 1 | -1 }
    offset?: number
    limit: number
  }) => Promise<T[]>
  count: (options: { filter?: mongoose.FilterQuery<T> }) => Promise<number>
}

export class Connection<T extends { id: string }> {
  constructor(readonly options: ConnectionOptions<T>) {
    this.limit = checkConnectionLimit(options.first, options.last)
    this.before = options.before ? Cursor.parse(options.before, options.orderBy) : undefined
    this.after = options.after ? Cursor.parse(options.after, options.orderBy) : undefined
  }

  private get isLast() {
    return !!this.options.last
  }

  private before?: Cursor<T>

  private after?: Cursor<T>

  private limit: number

  private get sort(): {
    field: keyof T | '_id'
    direction: 1 | -1
    before?: string
    after?: string
  } {
    const { orderBy } = this.options
    return orderBy
      ? {
          field: orderBy.field,
          direction: orderBy.direction === OrderDirection.ASC ? 1 : -1,
          before: this.before?.sort?.value,
          after: this.after?.sort?.value,
        }
      : { field: '_id', direction: -1, before: this.before?.id, after: this.after?.id }
  }

  private _nodes?: Promise<T[]>

  get nodes(): Promise<T[]> {
    if (!this._nodes) {
      this._nodes = (async () => {
        const { sort } = this

        const filter: mongoose.FilterQuery<T> = {}

        if (sort.before || sort.after) {
          filter[sort.field] = {}

          if (sort.before) {
            if (sort.direction === -1) {
              filter[sort.field].$gt = sort.before
            } else {
              filter[sort.field].$lt = sort.before
            }
          }

          if (sort.after) {
            if (sort.direction === -1) {
              filter[sort.field].$lt = sort.after
            } else {
              filter[sort.field].$gt = sort.after
            }
          }
        }

        const list = await this.options.find({
          filter,
          sort: <{ [key in '_id' | keyof T]: 1 | -1 }>{
            [sort.field]: this.isLast ? (sort.direction === 1 ? -1 : 1) : sort.direction,
          },
          offset: this.options.offset,
          limit: this.limit,
        })

        if (this.isLast) {
          list.reverse()
        }

        return list
      })()
    }
    return this._nodes
  }

  get edges(): Promise<{ cursor: string; node: T }[]> {
    const orderBy = this.options.orderBy

    return this.nodes.then(nodes =>
      nodes.map(node => ({
        get cursor() {
          return Cursor.toString(node, orderBy)
        },
        node,
      }))
    )
  }

  get totalCount(): Promise<number> {
    return this.options.count({})
  }

  get pageInfo(): PageInfo {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const connection = this

    return {
      get startCursor(): Promise<string | undefined> {
        return connection.nodes.then(nodes => {
          const first = nodes.at(0)
          return first && Cursor.toString(first, connection.options.orderBy).toString()
        })
      },

      get endCursor(): Promise<string | undefined> {
        return connection.nodes.then(nodes => {
          const last = nodes.at(-1)
          return last && Cursor.toString(last, connection.options.orderBy).toString()
        })
      },

      get hasNextPage(): Promise<boolean> {
        return connection.nodes
          .then(nodes => nodes.at(-1))
          .then(last => {
            if (!last) {
              return false
            }

            const { sort } = connection
            const value = last[sort.field === '_id' ? 'id' : sort.field]

            const filter: mongoose.FilterQuery<T> = {}

            filter[sort.field] = {}
            if (sort.direction === -1) {
              filter[sort.field].$lt = value
            } else {
              filter[sort.field].$gt = value
            }

            return connection.options.count({ filter }).then(count => count > 0)
          })
      },

      get hasPreviousPage(): Promise<boolean> {
        return connection.nodes
          .then(nodes => nodes.at(0))
          .then(first => {
            if (!first) {
              return false
            }

            const { sort } = connection
            const value = first[sort.field === '_id' ? 'id' : sort.field]

            const filter: mongoose.FilterQuery<T> = {}

            filter[sort.field] = {}
            if (sort.direction === -1) {
              filter[sort.field].$gt = value
            } else {
              filter[sort.field].$lt = value
            }

            return connection.options.count({ filter }).then(count => count > 0)
          })
      },
    }
  }
}

@ObjectType()
export class PageInfo {
  @Field(() => String, { nullable: true })
  startCursor!: Promise<string | undefined>

  @Field(() => String, { nullable: true })
  endCursor!: Promise<string | undefined>

  @Field(() => Boolean)
  hasNextPage!: Promise<boolean>

  @Field(() => Boolean)
  hasPreviousPage!: Promise<boolean>
}

export class Cursor<T> {
  constructor(readonly id: string, readonly sort?: { field: keyof T; value: string }) {}

  static parse<T>(raw: string, orderBy?: { field: keyof T; direction: OrderDirection }): Cursor<T> {
    const s = Buffer.from(raw, 'base64').toString()
    if (!s.startsWith('c:v1:')) {
      throw new Error('Invalid cursor prefix')
    }
    const query = new URLSearchParams(s.slice(5))
    const id = query.get('id')
    if (!id) {
      throw new Error(`Invalid cursor id`)
    }
    const f = query.get('f') as keyof T
    const value = query.get('v')

    const sort =
      f && value
        ? {
            field: f,
            value,
          }
        : undefined

    if (sort?.field !== orderBy?.field) {
      throw new Error(`Invalid cursor sort`)
    }

    return new Cursor(id, sort)
  }

  static toString<T extends { id: string }>(
    obj: T,
    orderBy?: { field: keyof T; direction: OrderDirection }
  ): string {
    const query: { [key: string]: string } = { id: obj.id }
    if (orderBy) {
      query['f'] = orderBy.field.toString()

      const v = obj[orderBy.field]
      if (!v) {
        throw new Error(`Invalid cursor field value`)
      }
      query['v'] = `${v}`
    }
    const qs = new URLSearchParams(query).toString()
    return Buffer.from(`c:v1:${qs}`).toString('base64url')
  }
}

function checkConnectionLimit(first?: number, last?: number): number {
  if (isNumber(first) && !isPositive(first)) {
    throw new BadRequestException('The `first` on the connection cannot be less than zero')
  }
  if (isNumber(last) && !isPositive(last)) {
    throw new BadRequestException('The `last` on the connection cannot be less than zero')
  }
  if (first && last) {
    throw new BadRequestException(
      'Passing both `first` and `last` to paginate the connection is not supported'
    )
  }

  const limit = first || last
  if (!limit) {
    throw new BadRequestException(
      'You must provide a `first` or `last` value to properly paginate the connection'
    )
  }

  return limit
}
