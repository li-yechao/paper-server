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

import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createHash, createPublicKey } from 'crypto'
import { Algorithm, JwtPayload, sign, SignOptions, verify } from 'jsonwebtoken'

@Injectable()
export class Config {
  constructor(private readonly configService: ConfigService) {}

  get port() {
    return this.getInt('port', 8080)
  }

  get cors() {
    return this.getBoolean('cors', false)
  }

  get mongo() {
    return {
      uri: this.getString('mongo.uri'),
    }
  }

  get ipfs() {
    return {
      api: this.getString('ipfs.api'),
      uri: this.getString('ipfs.uri'),
    }
  }

  get body() {
    return {
      json: {
        limit: this.get('body.json.limit'),
      },
    }
  }

  get accessToken() {
    return this.createTokenConfig('accessToken')
  }

  get refreshToken() {
    return this.createTokenConfig('refreshToken')
  }

  get github() {
    return {
      clientId: this.getString('github.clientId'),
      clientSecret: this.getString('github.clientSecret'),
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

  private getEnum<T extends string>(key: string, enums: readonly T[], d?: T): T {
    const s = this.get(key)
    if (!s) {
      if (d !== undefined) {
        return d
      }
      throw new Error(`Missing required config \`${key}\``)
    }
    if (enums.includes(s as T)) {
      return s as T
    }
    throw new Error(
      `Invalid config \`${key}=${s}\`, expected: ${enums.map(e => `\`${e}\``).join(' ')}`
    )
  }

  private createTokenConfig(name: string) {
    const privateKey = this.getString(`${name}.privateKey`)
    return {
      get keyId() {
        return createHash('md5').update(this.privateKey).digest('base64')
      },
      issuer: this.get(`${name}.issuer`),
      audience: this.get(`${name}.audience`),
      algorithm: this.getEnum<Algorithm>(`${name}.algorithm`, ALGORITHMS, 'RS256'),
      privateKey,
      publicKey: createPublicKey(privateKey).export({ format: 'pem', type: 'spki' }).toString(),
      expiresIn: this.getInt(`${name}.expiresIn`),
      sign(
        payload: string | Buffer | any,
        options?: Omit<SignOptions, 'algorithm' | 'expiresIn' | 'issuer' | 'audience' | 'keyid'>
      ) {
        return sign(payload, this.privateKey, {
          ...options,
          algorithm: this.algorithm,
          expiresIn: this.expiresIn,
          issuer: this.issuer,
          audience: this.audience,
          keyid: this.keyId,
        })
      },
      verify(token: string): { id: string } & JwtPayload {
        if (token.startsWith('Bearer ')) {
          token = token.substring(7)
        }

        let payload: JwtPayload & { user_id?: string }
        try {
          payload = verify(token, this.publicKey, {
            algorithms: [this.algorithm],
            issuer: this.issuer,
            audience: this.audience,
          }) as JwtPayload
        } catch (error: any) {
          throw new UnauthorizedException(error.message)
        }

        if (typeof payload !== 'object' || typeof payload.sub !== 'string') {
          throw new Error('Invalid token sub')
        }

        return { ...payload, id: payload.sub }
      },
    }
  }
}

const ALGORITHMS = ['RS256', 'RS384', 'RS512'] as const
