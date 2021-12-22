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

import { Object, ObjectId } from './Object'
import { StrictEventEmitter } from './utils/StrictEventEmitter'

export interface Account extends StrictEventEmitter<{}, {}, ServerEventMap> {
  readonly cid: Promise<string | undefined>

  readonly user: { id: string; password: string }

  stop(): Promise<void>

  sync(options?: { skipDownload?: boolean; debounce?: boolean }): Promise<void>

  object(objectId?: string | ObjectId): Promise<Object>

  deleteObject(objectId?: string | ObjectId): Promise<void>

  objects(query: {
    before?: string | ObjectId
    after?: string | ObjectId
    limit: number
  }): Promise<Object[]>
}

export interface ServerEventMap {
  sync: (e: { syncing: boolean; error?: string; cid?: string }) => void
  error: (e: MessageError['error']) => void
}

export interface MessageError {
  error: { message: string; code?: string }
}

export function isMessageError(e: any): e is MessageError {
  return typeof (e as MessageError)?.error !== 'undefined'
}
