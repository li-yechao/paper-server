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
import { Config } from '../config'
import { GraphqlContext } from '../GraphqlContext'

export interface CurrentUser {
  id: string
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly config: Config) {}

  async canActivate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context)
    const gqlCtx = ctx.getContext<GraphqlContext>()
    const { authorization } = gqlCtx

    if (!authorization) {
      throw new UnauthorizedException('Missing required header authorization')
    }

    if (!authorization.match(/^Bearer /)) {
      throw new UnauthorizedException('Invalid token type')
    }

    gqlCtx.user = this.config.accessToken.verify(authorization)

    return true
  }
}

export const CurrentUser = createParamDecorator((_: unknown, context: ExecutionContext) => {
  const ctx = GqlExecutionContext.create(context).getContext<GraphqlContext>()
  if (!ctx.user?.id) {
    throw new UnauthorizedException('The user is not in context')
  }
  return ctx.user
})
