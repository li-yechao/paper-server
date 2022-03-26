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

import { Field, InputType, PartialType, PickType, registerEnumType } from '@nestjs/graphql'
import { GraphQLJSONObject } from 'graphql-type-json'
import { OrderDirection } from '../utils/OrderDirection'

@InputType()
export class CreateObjectInput {
  @Field(() => GraphQLJSONObject, { nullable: true })
  meta?: unknown

  @Field(() => String, { nullable: true })
  data?: string

  @Field(() => ObjectDataEncoding, { nullable: true })
  encoding?: ObjectDataEncoding
}

@InputType()
export class UpdateObjectInput extends PartialType(
  PickType(CreateObjectInput, ['meta', 'data', 'encoding'])
) {}

@InputType()
export class ObjectOrder {
  @Field(() => ObjectOrderField)
  field!: ObjectOrderField

  @Field(() => OrderDirection)
  direction!: OrderDirection
}

export enum ObjectOrderField {
  CREATED_AT,
  UPDATED_AT,
}

registerEnumType(ObjectOrderField, { name: 'ObjectOrderField' })

export enum ObjectDataEncoding {
  BASE64,
}

registerEnumType(ObjectDataEncoding, { name: 'ObjectDataEncoding' })
