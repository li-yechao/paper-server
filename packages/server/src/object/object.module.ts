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

import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { Config } from '../config'
import { IpfsService } from './ipfs.service'
import { ObjectResolver } from './object.resolver'
import { Object_, ObjectSchema, ObjectHistory, ObjectHistorySchema } from './object.schema'
import { ObjectService } from './object.service'
import { UserObjectResolver } from './user-object.resolver'

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Object_.name, schema: ObjectSchema },
      { name: ObjectHistory.name, schema: ObjectHistorySchema },
    ]),
  ],
  providers: [Config, ObjectService, UserObjectResolver, ObjectResolver, IpfsService],
})
export class ObjectModule {}
