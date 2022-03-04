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
    return this.getNumber('port')
  }

  get cors() {
    return this.getBoolean('cors')
  }

  private get(key: string): string | undefined {
    return this.configService.get<string>(key) || undefined
  }

  private getString(key: string): string {
    const v = this.get(key)
    if (!v) {
      throw new Error(`Required config ${key} is missing`)
    }
    return v
  }

  private getNumber(key: string): number {
    const v = this.getString(key)
    return Number(v)
  }

  private getBoolean(key: string): boolean {
    return this.getString(key) === 'true'
  }
}
