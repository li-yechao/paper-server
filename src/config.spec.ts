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

import { ConfigService } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { Config } from './config'
import { createMock, MockType } from './jest.utils'

describe('Config', () => {
  let config: Config
  let configService: MockType<ConfigService>

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [Config, { provide: ConfigService, useFactory: createMock }],
    }).compile()

    config = module.get(Config)
    configService = module.get(ConfigService)
  })

  describe('port', () => {
    test('should be the default port', () => {
      configService.get.mockReturnValueOnce(undefined)

      expect(config.port).toBe(8080)
    })

    test('should be the specified port', () => {
      configService.get.mockReturnValueOnce('10000')

      expect(config.port).toBe(10000)
    })

    test('should throw an error when invalid port in config', async () => {
      configService.get.mockReturnValueOnce('abc123')

      expect(() => config.port).toThrow()
    })
  })

  describe('cors', () => {
    test('should be the default cors', () => {
      configService.get.mockReturnValueOnce(undefined)

      expect(config.cors).toBe(false)
    })

    test('should be the specified cors', () => {
      configService.get.mockReturnValueOnce('true')
      configService.get.mockReturnValueOnce('false')

      expect(config.cors).toBe(true)
      expect(config.cors).toBe(false)
    })

    test('should throw an error when invalid cors in config', () => {
      configService.get.mockReturnValueOnce('1')

      expect(() => config.cors).toThrow()
    })
  })

  describe('mongo', () => {
    test('should be the specified mongo', () => {
      const uri = 'mongodb://user:pwd@127.0.0.1:27017/paper'

      configService.get.mockReturnValueOnce(uri)

      expect(config.mongo).toMatchObject({ uri })
    })

    test('should throw an error when missing mongo.uri config', () => {
      configService.get.mockReturnValueOnce(undefined)

      expect(() => config.mongo).toThrow()
    })
  })
})
