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
import { nanoid } from 'nanoid'
import { isMessageError, AccountError, AccountEvents } from '../Account'
import { AccountOptions } from '../createAccount'
import { ObjectInfo } from '../Object'
import { StrictEventEmitter } from '../utils/StrictEventEmitter'

export const SERVER_EVENT_TYPES: (keyof AccountEvents)[] = ['error', 'sync', 'objectChange']

export type ServerEvent<K extends keyof AccountEvents = keyof AccountEvents> = {
  [k in keyof AccountEvents]: {
    type: 'event'
    userId: string
    eventType: k
    data: Parameters<AccountEvents[k]>[0]
  }
}[K]

function isServerEvent(e: any): e is { type: 'event' } {
  return e?.type === 'event'
}

export interface MessageMap {
  generateKey: () => Promise<{ key: Uint8Array; id: string }>
  create: (payload: {
    user: { id: string; password: string } | { key: Uint8Array; password: string }
    options: AccountOptions
  }) => Promise<{ id: string }>
  cid: (payload: { userId: string }) => Promise<string | undefined>
  sync: (payload: { userId: string; skipDownload?: boolean }) => Promise<void>
  stop: (payload: { userId: string }) => Promise<void>
  object: (payload: {
    userId: string
    objectId?: string
  }) => Promise<{ userId: string; objectId: string }>
  objects: (payload: {
    userId: string
    before?: string
    after?: string
    limit: number
  }) => Promise<string[]>
  deleteObject: (payload: { userId: string; objectId?: string }) => Promise<void>
  object_files_cp: (payload: {
    userId: string
    objectId: string
    from: string | string[]
    to: string
    options?: IPFSFiles.CpOptions
  }) => Promise<void>
  object_files_mkdir: (payload: {
    userId: string
    objectId: string
    path: string
    options?: IPFSFiles.MkdirOptions
  }) => Promise<void>
  object_files_stat: (payload: {
    userId: string
    objectId: string
    path: string
    options?: IPFSFiles.StatOptions
  }) => Promise<Omit<IPFSFiles.StatResult, 'cid'> & { cid: string }>
  object_files_touch: (payload: {
    userId: string
    objectId: string
    path: string
    options?: IPFSFiles.TouchOptions
  }) => Promise<void>
  object_files_rm: (payload: {
    userId: string
    objectId: string
    path: string | string[]
    options?: IPFSFiles.RmOptions
  }) => Promise<void>
  object_files_mv: (payload: {
    userId: string
    objectId: string
    from: string | string[]
    to: string
    options?: IPFSFiles.MvOptions
  }) => Promise<void>
  object_files_ls: (payload: {
    userId: string
    objectId: string
    path: string
  }) => Promise<IPFSFiles.MFSEntry[]>
  object_read: (payload: {
    userId: string
    objectId: string
    path: string
    options?: IPFSFiles.ReadOptions
  }) => Promise<ArrayBuffer>
  object_write: (payload: {
    userId: string
    objectId: string
    path: string
    content: string | ArrayBuffer
    options?: IPFSFiles.WriteOptions
  }) => Promise<void>
  object_info: (payload: { userId: string; objectId: string }) => Promise<ObjectInfo>
  object_updatedAt: (payload: { userId: string; objectId: string }) => Promise<number>
  object_setInfo: (payload: {
    userId: string
    objectId: string
    info?: Partial<ObjectInfo>
  }) => Promise<ObjectInfo>
}

export type MessageData<T extends keyof MessageMap = keyof MessageMap> = {
  [key in keyof MessageMap]: {
    req: {
      id: string
      type: key
      payload: Parameters<MessageMap[key]>[0]
    }
    res: {
      id: string
      type: key
      response: Awaited<ReturnType<MessageMap[key]>> | AccountError
    }
  }
}[T]

export class Client extends StrictEventEmitter<
  {},
  {},
  {
    [k in keyof AccountEvents]: (userId: string, data: Parameters<AccountEvents[k]>[0]) => void
  }
> {
  constructor(private worker: Worker) {
    super()
    this.worker.onmessage = <T extends MessageData['res']>(
      ev: MessageEvent<Pick<T, 'id' | 'response'> | ServerEvent>
    ) => {
      if (isServerEvent(ev.data)) {
        this.emitReserved(ev.data.eventType, ev.data.userId, ev.data.data as any)
        return
      }

      const { id, response } = ev.data
      const task = this.tasks.get(id)
      if (task) {
        this.tasks.delete(id)
        if (isMessageError(response)) {
          const error: Error & { code?: string } = new Error(response.error.message)
          error.code = response.error.code
          task.reject(error)
        } else {
          task.resolve(response)
        }
      }
    }
  }

  private tasks: Map<string, { resolve: (res: any) => void; reject: (error: Error) => void }> =
    new Map()

  async call<T extends keyof MessageMap>(
    type: T,
    payload: Parameters<MessageMap[T]>[0]
  ): Promise<Awaited<ReturnType<MessageMap[T]>>> {
    return new Promise<any>((resolve, reject) => {
      const id = nanoid()
      this.tasks.set(id, { resolve, reject })
      this.worker.postMessage({ id, type, payload })
    })
  }
}

export class Server {
  constructor(handlers: {
    [key in keyof MessageMap]: (
      payload: Parameters<MessageMap[key]>[0],
      port: MessagePort
    ) => Promise<Awaited<ReturnType<MessageMap[key]>>>
  }) {
    self.onmessage = async (ev: MessageEvent<MessageData['req']>) => {
      try {
        const handler = handlers[ev.data.type] as Function
        const response = await handler(ev.data.payload, self)
        self.postMessage({ id: ev.data.id, type: ev.data.type, response })
      } catch (error: any) {
        self.postMessage({
          id: ev.data.id,
          type: ev.data.type,
          response: { error: { message: error.message, code: error.code } },
        })
        throw error
      }
    }
  }
}
