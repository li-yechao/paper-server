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

import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { createMock } from '../jest.utils'
import { IpfsService } from './ipfs.service'
import { ObjectHistory, Object_ } from './object.schema'
import { ObjectService } from './object.service'

describe('ObjectService', () => {
  let service: ObjectService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObjectService,
        { provide: IpfsService, useFactory: () => createMock() },
        { provide: getModelToken(Object_.name), useFactory: () => createMock() },
        { provide: getModelToken(ObjectHistory.name), useFactory: () => createMock() },
      ],
    }).compile()

    service = module.get<ObjectService>(ObjectService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
