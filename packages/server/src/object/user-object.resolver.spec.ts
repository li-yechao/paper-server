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

import { ConfigModule } from '@nestjs/config'
import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import mongoose from 'mongoose'
import { Config } from '../config'
import { Cursor } from '../utils/Connection'
import { IpfsService } from './ipfs.service'
import { Object_ } from './object.schema'
import { ObjectService } from './object.service'
import { UserObjectResolver } from './user-object.resolver'

describe('UserObjectResolver', () => {
  let resolver: UserObjectResolver
  let objectModel: { [key in keyof mongoose.Model<Object_>]: jest.Mock<unknown> }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ envFilePath: ['.env.local', '.env'] })],
      providers: [
        Config,
        UserObjectResolver,
        ObjectService,
        { provide: IpfsService, useFactory: () => ({ add: jest.fn(), get: jest.fn() }) },
        {
          provide: getModelToken(Object_.name),
          useFactory: () =>
            new Proxy(<{ [key: string | symbol]: jest.Mock<unknown> }>{}, {
              get: (target, p) => {
                if (p === 'then') {
                  return undefined
                }
                if (!target[p]) {
                  target[p] = jest.fn()
                }
                return target[p]
              },
            }),
        },
      ],
    }).compile()

    resolver = module.get(UserObjectResolver)
    objectModel = module.get(getModelToken(Object_.name))
  })

  it('query objects', async () => {
    const userId = new mongoose.mongo.ObjectId().toHexString()
    const objects = [
      { id: '1', userId, createdAt: 1, updatedAt: 1 },
      { id: '2', userId, createdAt: 2, updatedAt: 2 },
    ] as const

    objectModel.find.mockReturnValue(objects)
    objectModel.count.mockReturnValue(5)
    const conn = await resolver.objects(
      { id: userId },
      undefined,
      undefined,
      undefined,
      2,
      undefined,
      undefined
    )

    await expect(conn.nodes).resolves.toEqual(objects)
    await expect(
      conn.edges.then(edges => edges.map(edge => ({ cursor: edge.cursor, node: edge.node })))
    ).resolves.toEqual(objects.map(node => ({ cursor: Cursor.toString(node), node })))

    await expect(conn.totalCount).resolves.toEqual(5)
    expect(objectModel.count.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ userId, deletedAt: null })
    )

    await expect(conn.pageInfo.startCursor).resolves.toBe(Cursor.toString(objects[0]))
    await expect(conn.pageInfo.endCursor).resolves.toBe(Cursor.toString(objects[1]))

    objectModel.count.mockReturnValue(1)
    await expect(conn.pageInfo.hasNextPage).resolves.toBe(true)
    await expect(conn.pageInfo.hasPreviousPage).resolves.toBe(true)
  })

  it('should throw error when query objects without first and last', async () => {
    await expect(
      resolver.objects({ id: '456' }, undefined, undefined, undefined, undefined, undefined)
    ).rejects.toThrow(/(first|last)/)
  })

  it('query object', async () => {
    objectModel.findOne.mockReturnValue({
      id: '123',
      userId: '456',
      createdAt: 1,
      updatedAt: 2,
    })

    await expect(resolver.object({ id: '456' }, '123')).resolves.toEqual(
      expect.objectContaining({
        id: '123',
        userId: '456',
        createdAt: 1,
        updatedAt: 2,
      })
    )

    expect(objectModel.findOne.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        _id: '123',
        userId: '456',
        deletedAt: null,
      })
    )
  })
})
