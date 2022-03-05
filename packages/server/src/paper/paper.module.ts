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
import { PaperController } from './paper.controller'
import { Paper, PaperSchema } from './paper.schema'
import { PaperService } from './paper.service'

@Module({
  imports: [ConfigModule, MongooseModule.forFeature([{ name: Paper.name, schema: PaperSchema }])],
  controllers: [PaperController],
  providers: [Config, PaperService],
})
export class PaperModule {}
