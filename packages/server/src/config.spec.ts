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

describe('Config', () => {
  let config: Config
  let configService: { get: jest.Mock }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [Config, { provide: ConfigService, useFactory: () => ({ get: jest.fn() }) }],
    }).compile()
    config = module.get(Config)
    configService = module.get(ConfigService)
  })

  it('int', async () => {
    // default `port`
    expect(config.port).toBe(8080)
    expect(configService.get.mock.calls[0]?.[0]).toBe('port')

    configService.get.mockReturnValue('')
    expect(config.port).toBe(8080)

    configService.get.mockReturnValue('10000')
    expect(config.port).toBe(10000)

    configService.get.mockReturnValue('abc123')
    expect(() => config.port).toThrow()
  })

  it('boolean', () => {
    // default `cors`
    expect(config.cors).toBe(false)
    expect(configService.get.mock.calls[0]?.[0]).toBe('cors')

    configService.get.mockReturnValue('')
    expect(config.cors).toBe(false)

    configService.get.mockReturnValue('true')
    expect(config.cors).toBe(true)

    configService.get.mockReturnValue('false')
    expect(config.cors).toBe(false)

    configService.get.mockReturnValue('1')
    expect(() => config.cors).toThrow()
  })

  it('string', () => {
    configService.get.mockReturnValue('')
    expect(() => config.mongo.uri).toThrow()

    configService.get.mockReturnValue('abc')
    expect(config.mongo.uri).toBe('abc')

    configService.get.mockReturnValue(' ')
    expect(() => config.mongo.uri).toThrow()
  })
})
