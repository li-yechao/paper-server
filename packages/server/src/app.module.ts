// Copyright 2021 LiYechao
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

import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { MongooseModule } from '@nestjs/mongoose'
import { PubSub } from 'graphql-subscriptions'
import { AuthModule } from './auth/auth.module'
import { Config } from './config'
import { ObjectModule } from './object/object.module'
import { UserModule } from './user/user.module'

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ['.env.local', '.env'] }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: new Config(configService).mongo.uri,
        ignoreUndefined: true,
      }),
      inject: [ConfigService],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      cors: false,
      subscriptions: {
        'graphql-ws': {
          onConnect: ({ connectionParams, extra }) => {
            Object.assign(extra, connectionParams)
          },
        },
      },
      context: ({ extra, req }) => {
        return {
          authorization: req?.get('authorization') ?? extra?.authorization,
        }
      },
    }),
    AuthModule,
    UserModule,
    ObjectModule,
  ],
  providers: [Config, { provide: 'PUB_SUB', useValue: new PubSub() }],
  exports: ['PUB_SUB'],
})
export class AppModule {}
