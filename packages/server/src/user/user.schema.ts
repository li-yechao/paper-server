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

import { Field, ObjectType } from '@nestjs/graphql'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose from 'mongoose'

@ObjectType()
@Schema()
export class User {
  @Field()
  id!: string

  @Field()
  @Prop({ required: true })
  createdAt!: number

  @Field({ nullable: true })
  @Prop()
  updatedAt?: number

  @Field({ nullable: true })
  @Prop()
  name?: string

  @Prop({ type: mongoose.Schema.Types.Mixed })
  thirds?: { github?: unknown }
}

export const UserSchema = SchemaFactory.createForClass(User)
