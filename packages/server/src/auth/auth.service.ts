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

import { Inject, Injectable } from '@nestjs/common'
import { Config } from '../config'
import { UserService } from '../user/user.service'
import { AuthResult } from './auth.schema'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly config: Config,
    @Inject('FETCH') private readonly fetch: typeof globalThis.fetch
  ) {}

  async authCustom(thirdType: string, query: { [key: string]: string }): Promise<AuthResult> {
    if (thirdType === 'refreshToken') {
      const refreshToken = query['refreshToken']
      if (!refreshToken) {
        throw new Error(`Missing required parameter \`refreshToken\``)
      }

      return this.refreshToken(refreshToken)
    }

    if (thirdType === 'github') {
      const { id: thirdId, name, user: thirdUser } = await this.authGithub(query)

      console.log(thirdUser)

      const user = await this.userService.createOrUpdate({ name, thirdType, thirdId, thirdUser })

      return this.createToken(user.id)
    }

    throw new Error(`Unsupported auth type ${thirdType}`)
  }

  private async refreshToken(refreshToken: string): Promise<AuthResult> {
    const payload = this.config.refreshToken.verify(refreshToken)
    if (typeof payload.sub !== 'string' || !payload.sub) {
      throw new Error(`Invalid jwt token`)
    }

    const user = await this.userService.findOne({ userId: payload.sub })

    return this.createToken(user.id)
  }

  private async authGithub(query: { [key: string]: string }) {
    const code = query?.['code']
    if (!code) {
      throw new Error(`Missing required parameter dingtalk \`code\``)
    }

    const token = await this.fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: this.config.github.clientId,
        client_secret: this.config.github.clientSecret,
        code,
      }),
    }).then(res => res.json())

    if (!token?.access_token) {
      throw new Error(
        token?.error_description ||
          `Missing required access_token in response of github api oauth/access_token`
      )
    }

    const user = await this.fetch('https://api.github.com/user', {
      method: 'GET',
      headers: { Authorization: `token ${token.access_token}` },
    }).then(res => res.json())

    return {
      id: user.id,
      name: user.name,
      user,
    }
  }

  private createToken(userId: string): AuthResult {
    return {
      accessToken: this.config.accessToken.sign({}, { subject: userId }),
      refreshToken: this.config.refreshToken.sign({}, { subject: userId }),
      expiresIn: this.config.accessToken.expiresIn,
      tokenType: 'Bearer',
    }
  }
}
