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
import { GraphQLJSONObject } from 'graphql-type-json'
import mongoose from 'mongoose'

@ObjectType()
@Schema({ collection: 'objects' })
export class Object_ {
  @Field()
  id!: string

  @Prop()
  parentId?: string

  @Field()
  @Prop({ required: true })
  userId!: string

  @Field(() => String)
  @Prop({ required: true })
  createdAt!: number

  @Field(() => String)
  @Prop({ required: true })
  updatedAt!: number

  @Prop()
  deletedAt?: number

  @Prop()
  cid?: string

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Prop({ type: mongoose.Schema.Types.Mixed })
  meta?: unknown
}

export const ObjectSchema = SchemaFactory.createForClass(Object_)
