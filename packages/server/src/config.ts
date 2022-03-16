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

import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class Config {
  constructor(private readonly configService: ConfigService) {}

  get port() {
    return this.getInt('port', 8080)
  }

  get cors() {
    return this.getBoolean('cors', false)
  }

  get signature() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const config = this

    return {
      get expiresIn() {
        return config.getInt('signature.expiresIn', 10)
      },
    }
  }

  get mongo() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const config = this

    return {
      get uri() {
        return config.getString('mongo.uri')
      },
    }
  }

  private get(key: string): string | undefined {
    return this.configService.get<string>(key)?.trim() || undefined
  }

  private getString(key: string, d?: string): string {
    const s = this.get(key)
    if (!s) {
      if (d !== undefined) {
        return d
      }
      throw new Error(`Missing required config \`${key}\``)
    }
    return s
  }

  private getInt(key: string, d?: number): number {
    const s = this.get(key)
    if (!s) {
      if (d !== undefined) {
        return d
      }
      throw new Error(`Missing required config \`${key}\``)
    }
    try {
      if (!/^\d+$/.test(s)) {
        throw new Error('Invalid number')
      }
      const n = parseInt(s)
      if (!Number.isSafeInteger(n)) {
        throw new Error('Invalid int')
      }
      return n
    } catch (error) {
      throw new Error(`Invalid config ${key}, require \`number\``)
    }
  }

  private getBoolean(key: string, d?: boolean): boolean {
    const s = this.get(key)
    if (!s) {
      if (d !== undefined) {
        return d
      }
      throw new Error(`Missing required config \`${key}\``)
    }
    if (s === 'true') {
      return true
    }
    if (s === 'false') {
      return false
    }
    throw new Error(`Invalid config ${key}, require \`true\` or \`false\``)
  }
}
