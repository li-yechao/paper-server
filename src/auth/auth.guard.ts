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
  createParamDecorator,
  ExecutionContext,
  Injectable,
  PipeTransform,
  UnauthorizedException,
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { Config } from '../config'
import { GraphqlContext } from '../GraphqlContext'

export interface CurrentUser {
  id: string
}

const HttpHeaderAuthorization = createParamDecorator((_: unknown, context: ExecutionContext) => {
  return GqlExecutionContext.create(context).getContext<GraphqlContext>().authorization
})

@Injectable()
export class ParseTokenPipe implements PipeTransform {
  constructor(private readonly config: Config) {}

  async transform(authorization: any) {
    if (!authorization) {
      throw new UnauthorizedException('Missing required header authorization')
    }

    if (!authorization.match(/^Bearer /)) {
      throw new UnauthorizedException('Invalid token type')
    }

    return this.config.accessToken.verify(authorization)
  }
}

export const CurrentUser = () => HttpHeaderAuthorization(undefined, ParseTokenPipe)

@Injectable()
export class ParseTokenPipeOptional implements PipeTransform {
  constructor(private readonly config: Config) {}

  async transform(authorization: any) {
    if (!authorization) {
      return null
    }
    return this.config.accessToken.verify(authorization)
  }
}

export const CurrentUserOptional = () => HttpHeaderAuthorization(undefined, ParseTokenPipeOptional)
