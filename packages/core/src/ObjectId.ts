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

import { customAlphabet } from 'nanoid'

export namespace ObjectId {
  const objectNonce = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 5)
  export const objectIdReg = /^(?<createdAt>\d+)-(?<nonce>[0-9|A-Z]{5})$/

  export function create(date?: Date, nonce?: string): ObjectId {
    date ??= new Date()
    nonce ??= objectNonce()
    return { createdAt: date.getTime(), nonce }
  }

  export function parse(id: string | ObjectId): ObjectId {
    if (typeof id !== 'string') {
      return id
    }
    const m = id.match(objectIdReg)
    if (m?.groups) {
      const createdAt = parseInt(m.groups.createdAt)
      const nonce = m.groups.nonce
      return { createdAt, nonce }
    }
    throw new Error(`Invalid object id ${id}`)
  }

  export function toString(id: string | ObjectId): string {
    const oid = typeof id === 'string' ? parse(id) : id
    return `${oid.createdAt}-${oid.nonce}`
  }
}

export interface ObjectId {
  createdAt: number
  nonce: string
}
