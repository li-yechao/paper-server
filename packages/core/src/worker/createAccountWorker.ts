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

import * as IPFSFiles from 'ipfs-core-types/src/files'
import { Account, AccountEvents } from '../Account'
import { AccountOptions } from '../createAccount'
import { Object, ObjectFileEvents, ObjectFiles, ObjectId, ObjectInfo } from '../Object'
import { StrictEventEmitter } from '../utils/StrictEventEmitter'
import AccountWorker_ from './AccountWorker_'
import { Client, SERVER_EVENT_TYPES } from './Channel'

export default async function createAccountWorker(
  user: { id: string; password: string } | { key: Uint8Array; password: string },
  options: AccountOptions
): Promise<Account> {
  const { id } = await AccountWorker.client.call('create', { user, options })
  return new AccountWorker({ id, password: user.password })
}

export async function generateKey() {
  return AccountWorker.client.call('generateKey', undefined)
}

export class AccountWorker extends StrictEventEmitter<{}, {}, AccountEvents> implements Account {
  constructor(readonly user: { id: string; password: string }) {
    super()

    SERVER_EVENT_TYPES.forEach(type => {
      const handler = (userId: string, e: any) => {
        userId === this.user.id && this.emitReserved(type, e)
      }
      AccountWorker.client.on(type, handler)
      this.serverEventListeners[type] = handler
    })

    this.on('objectChange', ({ objectId, ...e }) => {
      ;(this.objectsCache.get(objectId)?.files as any).emitReserved('change', e)
    })
  }

  private objectsCache: Map<string, Object> = new Map()

  private serverEventListeners: { [key in keyof AccountEvents]?: Function } = {}

  private static _client: Client
  static get client() {
    if (!this._client) {
      this._client = new Client(new AccountWorker_())
    }
    return this._client
  }

  get cid() {
    return AccountWorker.client.call('cid', { userId: this.user.id })
  }

  async sync(options: { skipDownload?: boolean; debounce?: boolean } = {}) {
    await AccountWorker.client.call('sync', { userId: this.user.id, ...options })
  }

  async stop() {
    await AccountWorker.client.call('stop', { userId: this.user.id })

    SERVER_EVENT_TYPES.forEach(type => {
      const handler = this.serverEventListeners[type]
      if (handler) {
        AccountWorker.client.off(type, handler as any)
        this.serverEventListeners[type] = undefined
      }
    })
  }

  objects({
    before,
    after,
    limit,
  }: {
    before?: string
    after?: string
    limit: number
  }): Promise<string[]> {
    return AccountWorker.client.call('objects', {
      userId: this.user.id,
      before: before,
      after: after,
      limit,
    })
  }

  async object(objectId?: string): Promise<Object> {
    const res = await AccountWorker.client.call('object', { userId: this.user.id, objectId })
    return this.createObject(res.objectId)
  }

  async deleteObject(objectId?: string) {
    await AccountWorker.client.call('deleteObject', { userId: this.user.id, objectId })
  }

  private createObject(objectId: string): Object {
    let object = this.objectsCache.get(objectId)
    if (!object) {
      object = new ObjectWorker(this, objectId)
      this.objectsCache.set(objectId, object)
    }
    return object
  }
}

class ObjectWorker implements Object {
  constructor(private account: AccountWorker, id: string | ObjectId) {
    this.objectId = ObjectId.parse(id)
    this.id = ObjectId.toString(this.objectId)
    this.files = new ObjectFilesImpl(this.account.user.id, this.id)
  }

  readonly files: ObjectFiles

  readonly id: string

  private readonly objectId: ObjectId

  get createdAt() {
    return this.objectId.createdAt
  }

  get updatedAt() {
    return AccountWorker.client.call('object_updatedAt', {
      userId: this.account.user.id,
      objectId: this.id,
    })
  }

  get info(): Promise<ObjectInfo> {
    return AccountWorker.client.call('object_info', {
      userId: this.account.user.id,
      objectId: this.id,
    })
  }

  async setInfo(info: Partial<ObjectInfo> = {}) {
    return AccountWorker.client.call('object_setInfo', {
      userId: this.account.user.id,
      objectId: this.id,
      info,
    })
  }

  async read(path: string, options?: IPFSFiles.ReadOptions): Promise<ArrayBuffer> {
    return AccountWorker.client.call('object_read', {
      userId: this.account.user.id,
      objectId: this.id,
      path,
      options,
    })
  }

  async write(path: string, content: string | ArrayBuffer, options?: IPFSFiles.WriteOptions) {
    return AccountWorker.client.call('object_write', {
      userId: this.account.user.id,
      objectId: this.id,
      path,
      content,
      options,
    })
  }
}

class ObjectFilesImpl extends StrictEventEmitter<{}, {}, ObjectFileEvents> implements ObjectFiles {
  constructor(private userId: string, private objectId: string) {
    super()
  }

  cp(from: string | string[], to: string, options?: IPFSFiles.CpOptions) {
    return AccountWorker.client.call('object_files_cp', {
      userId: this.userId,
      objectId: this.objectId,
      from,
      to,
      options,
    })
  }

  mkdir(path: string, options?: IPFSFiles.MkdirOptions) {
    return AccountWorker.client.call('object_files_mkdir', {
      userId: this.userId,
      objectId: this.objectId,
      path,
      options,
    })
  }

  stat(path: string, options?: IPFSFiles.StatOptions) {
    return AccountWorker.client.call('object_files_stat', {
      userId: this.userId,
      objectId: this.objectId,
      path,
      options,
    })
  }

  touch(path: string, options?: IPFSFiles.TouchOptions) {
    return AccountWorker.client.call('object_files_touch', {
      userId: this.userId,
      objectId: this.objectId,
      path,
      options,
    })
  }

  rm(path: string | string[], options?: IPFSFiles.RmOptions) {
    return AccountWorker.client.call('object_files_rm', {
      userId: this.userId,
      objectId: this.objectId,
      path,
      options,
    })
  }

  async *read(_ipfsPath: string, _options?: IPFSFiles.ReadOptions): AsyncIterable<Uint8Array> {
    throw new Error('Method not implemented.')
  }

  write(
    _ipfsPath: string,
    _content: string | Uint8Array | Blob | AsyncIterable<Uint8Array> | Iterable<Uint8Array>,
    _options?: IPFSFiles.WriteOptions
  ): Promise<void> {
    throw new Error('Method not implemented.')
  }

  mv(from: string | string[], to: string, options?: IPFSFiles.MvOptions) {
    return AccountWorker.client.call('object_files_mv', {
      userId: this.userId,
      objectId: this.objectId,
      from,
      to,
      options,
    })
  }

  async *ls(path: string) {
    const list = await AccountWorker.client.call('object_files_ls', {
      userId: this.userId,
      objectId: this.objectId,
      path,
    })
    for (const item of list) {
      yield item
    }
  }
}
