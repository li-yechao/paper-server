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
import { IpfsService } from './ipfs.service'
import { ObjectResolver } from './object.resolver'
import { Object_ } from './object.schema'
import { ObjectService } from './object.service'

describe('ObjectResolver', () => {
  let resolver: ObjectResolver
  let objectModel: { [key in keyof mongoose.Model<Object_>]: jest.Mock<unknown> }
  let ipfsService: { add: jest.Mock; cat: jest.Mock }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ envFilePath: ['.env.local', '.env'] })],
      providers: [
        Config,
        ObjectResolver,
        ObjectService,
        { provide: IpfsService, useFactory: () => ({ add: jest.fn(), cat: jest.fn() }) },
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

    resolver = module.get<ObjectResolver>(ObjectResolver)
    objectModel = module.get(getModelToken(Object_.name))
    ipfsService = module.get(IpfsService)
  })

  it('create object', async () => {
    objectModel.create.mockReturnValue({
      id: '123',
      userId: '456',
      createdAt: 1,
      updatedAt: 2,
      cid: 'cid',
      meta: { title: 'title' },
    })

    ipfsService.add.mockReturnValue({ cid: 'cid' })

    await expect(
      resolver.createObject({ id: '456' }, { meta: { title: 'title' }, data: 'mydata' })
    ).resolves.toEqual(
      expect.objectContaining({
        id: '123',
        userId: '456',
        createdAt: 1,
        updatedAt: 2,
        cid: 'cid',
        meta: { title: 'title' },
      })
    )

    expect(ipfsService.add.mock.calls[0]?.[0]).toEqual(Buffer.from('mydata'))

    expect(objectModel.create.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        userId: '456',
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
        meta: { title: 'title' },
      })
    )
  })

  it('update object', async () => {
    objectModel.findOneAndUpdate.mockReturnValue({
      id: '123',
      userId: '456',
      createdAt: 1,
      updatedAt: 2,
      cid: 'cid',
      meta: { title: 'title' },
    })

    ipfsService.add.mockReturnValue({ cid: 'cid' })

    await expect(
      resolver.updateObject({ id: '456' }, '123', {
        meta: { title: 'title' },
        data: 'mydata',
      })
    ).resolves.toEqual(
      expect.objectContaining({
        id: '123',
        userId: '456',
        createdAt: 1,
        updatedAt: 2,
        cid: 'cid',
        meta: { title: 'title' },
      })
    )

    expect(ipfsService.add.mock.calls[0]?.[0]).toEqual(Buffer.from('mydata'))

    expect(objectModel.findOneAndUpdate.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        _id: '123',
        userId: '456',
        deletedAt: null,
      })
    )

    expect(objectModel.findOneAndUpdate.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({
        $set: expect.objectContaining({
          updatedAt: expect.any(Number),
          meta: { title: 'title' },
        }),
      })
    )
  })

  it('delete object', async () => {
    objectModel.findOneAndUpdate.mockReturnValue({
      id: '123',
      userId: '456',
      deletedAt: Date.now(),
    })

    await expect(resolver.deleteObject({ id: '456' }, '123')).resolves.toEqual(true)

    expect(objectModel.findOneAndUpdate.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        _id: '123',
        userId: '456',
        deletedAt: null,
      })
    )

    expect(objectModel.findOneAndUpdate.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({
        $set: expect.objectContaining({
          deletedAt: expect.any(Number),
        }),
      })
    )
  })

  it('object data', async () => {
    ipfsService.cat.mockReturnValue([Buffer.from('HELLO')])
    await expect(
      resolver.data({
        id: '123',
        userId: '456',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        cid: 'Qm123123123',
      })
    ).resolves.toEqual('HELLO')
  })
})