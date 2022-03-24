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

import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { keys, PublicKey } from 'libp2p-crypto'
import { identity } from 'multiformats/hashes/identity'
import { toString as uint8arraysToString } from 'uint8arrays'
import { Config } from '../config'
import { GraphqlContext } from '../GraphqlContext'

export interface CurrentUser {
  id: string
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly config: Config) {
    this.expiresIn = this.config.signature.expiresIn
  }

  readonly expiresIn: number

  async canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context).getContext<GraphqlContext>()

    if (!ctx.publickey) {
      throw new UnauthorizedException('Missing required header publickey')
    }
    if (!ctx.timestamp) {
      throw new UnauthorizedException('Missing required header timestamp')
    }
    if (!ctx.signature) {
      throw new UnauthorizedException('Missing required header signature')
    }

    const now = Math.floor(Date.now() / 1000)
    const time = parseInt(ctx.timestamp)
    if (!Number.isSafeInteger(time)) {
      throw new UnauthorizedException('Invalid timestamp')
    }
    if (Math.abs(time - now) > this.expiresIn) {
      throw new UnauthorizedException('Timestamp expired')
    }

    const key = keys.unmarshalPublicKey(Buffer.from(ctx.publickey, 'base64'))
    try {
      if (
        !(await key.verify(
          Buffer.from(new URLSearchParams({ timestamp: ctx.timestamp }).toString()),
          Buffer.from(ctx.signature, 'base64')
        ))
      ) {
        throw new UnauthorizedException(`Invalid signature`)
      }
    } catch {
      throw new UnauthorizedException(`Invalid signature`)
    }

    ctx.user = { id: await this.publicKeyId(key) }

    return true
  }

  private async publicKeyId(publicKey: PublicKey): Promise<string> {
    if (publicKey instanceof keys.supportedKeys.ed25519.Ed25519PublicKey) {
      return uint8arraysToString(identity.digest(publicKey.bytes).bytes, 'base58btc')
    }
    throw new Error(`Unsupported public key`)
  }
}

export const CurrentUser = createParamDecorator((_: unknown, context: ExecutionContext) => {
  const ctx = GqlExecutionContext.create(context).getContext<GraphqlContext>()
  if (!ctx.user?.id) {
    throw new UnauthorizedException('The user is not in context')
  }
  return ctx.user
})
