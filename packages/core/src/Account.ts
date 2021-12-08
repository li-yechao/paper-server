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

// @ts-ignore
import AccountSharedWorker from './AccountSharedWorker?worker'

import { AccountOptions, Client, SERVER_EVENT_TYPES, ServerEventMap } from './Channel'
import Object from './Object'
import { StrictEventEmitter } from './utils/StrictEventEmitter'

export default class Account extends StrictEventEmitter<{}, {}, ServerEventMap> {
  private constructor(readonly user: { id: string; password: string }) {
    super()

    SERVER_EVENT_TYPES.forEach(type => {
      const handler = (userId: string, e: any) => {
        userId === this.user.id && this.emitReserved(type, e)
      }
      Account.client.on(type, handler)
      this.serverEventListeners[type] = handler
    })
  }

  private serverEventListeners: { [key in keyof ServerEventMap]?: Function } = {}

  private static _client: Client
  static get client() {
    if (!this._client) {
      this._client = new Client(new AccountSharedWorker())
    }
    return this._client
  }

  static async generateKey() {
    return this.client.call('generateKey', undefined)
  }

  static async create(
    user: { id: string; password: string } | { key: Uint8Array; password: string },
    options: AccountOptions
  ) {
    const { id } = await this.client.call('create', { user, options })
    return new Account({ id, password: user.password })
  }

  get cid() {
    return Account.client.call('cid', { userId: this.user.id })
  }

  async sync(options: { skipDownload?: boolean } = {}) {
    await Account.client.call('sync', { userId: this.user.id, ...options })
  }

  async stop() {
    await Account.client.call('stop', { userId: this.user.id })

    SERVER_EVENT_TYPES.forEach(type => {
      const handler = this.serverEventListeners[type]
      if (handler) {
        Account.client.off(type, handler as any)
        this.serverEventListeners[type] = undefined
      }
    })
  }

  async objects({
    before,
    after,
    limit,
  }: {
    before?: string
    after?: string
    limit: number
  }): Promise<Object[]> {
    const ids = await Account.client.call('objects', {
      userId: this.user.id,
      before: before,
      after: after,
      limit,
    })

    return ids.map(id => new Object(this, id))
  }

  async object(objectId?: string): Promise<Object> {
    const res = await Account.client.call('object', { userId: this.user.id, objectId })
    return new Object(this, res.objectId)
  }

  async deleteObject(objectId?: string) {
    await Account.client.call('deleteObject', { userId: this.user.id, objectId })
  }
}
