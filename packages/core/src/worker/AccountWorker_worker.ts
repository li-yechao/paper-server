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

import Ipfs from '@paper/ipfs'
import all from 'it-all'
import { Account } from '../Account'
import createAccount from '../createAccount'
import { Server, SERVER_EVENT_TYPES } from './Channel'

const ACCOUNTS: Map<string, Account> = new Map()

function getAccount(userId: string) {
  const account = ACCOUNTS.get(userId)
  if (!account) {
    throw new Error(`Account is not opened ${userId}`)
  }
  return account
}

function setAccount(userId: string, account: Account) {
  ACCOUNTS.set(userId, account)
}

async function stopAccount(userId: string) {
  await getAccount(userId).stop()
  ACCOUNTS.delete(userId)
}

new Server({
  generateKey: async (_: undefined) => {
    const key = await Ipfs.crypto.keys.generateKeyPair('RSA', 2048)
    return { key: key.bytes, id: await key.id() }
  },
  create: async ({ user, options }, port) => {
    const account = await createAccount(user, options)
    const { id } = account.user
    SERVER_EVENT_TYPES.forEach(type =>
      account.on(type, (data: any) =>
        port.postMessage({ type: 'event', userId: id, eventType: type, data })
      )
    )
    setAccount(id, account)
    return { id }
  },
  cid: async ({ userId }) => {
    return getAccount(userId).cid
  },
  sync: async ({ userId, ...options }) => {
    await getAccount(userId).sync(options)
  },
  stop: async ({ userId }) => {
    await stopAccount(userId)
  },
  object: async ({ userId, objectId }) => {
    const object = await getAccount(userId).object(objectId)
    return { userId, objectId: object.id }
  },
  objects: async ({ userId, before, after, limit }) => {
    return getAccount(userId).objects({ before, after, limit })
  },
  deleteObject: async ({ userId, objectId }) => {
    return getAccount(userId).deleteObject(objectId)
  },
  object_files_cp: async ({ userId, objectId, from, to, options }) => {
    const object = await getAccount(userId).object(objectId)
    return object.files.cp(from, to, options)
  },
  object_files_mkdir: async ({ userId, objectId, path, options }) => {
    const object = await getAccount(userId).object(objectId)
    return object.files.mkdir(path, options)
  },
  object_files_stat: async ({ userId, objectId, path, options }) => {
    const object = await getAccount(userId).object(objectId)
    const stat = await object.files.stat(path, options)
    return { ...stat, cid: stat.cid.toString() }
  },
  object_files_touch: async ({ userId, objectId, path, options }) => {
    const object = await getAccount(userId).object(objectId)
    return object.files.touch(path, options)
  },
  object_files_rm: async ({ userId, objectId, path, options }) => {
    const object = await getAccount(userId).object(objectId)
    return object.files.rm(path, options)
  },
  object_files_mv: async ({ userId, objectId, from, to, options }) => {
    const object = await getAccount(userId).object(objectId)
    return object.files.mv(from, to, options)
  },
  object_files_ls: async ({ userId, objectId, path }) => {
    const object = await getAccount(userId).object(objectId)
    return all(object.files.ls(path))
  },
  object_read: async ({ userId, objectId, path, options }) => {
    const object = await getAccount(userId).object(objectId)
    return object.read(path, options)
  },
  object_write: async ({ userId, objectId, path, content, options }) => {
    const object = await getAccount(userId).object(objectId)
    return object.write(path, content, options)
  },
  object_info: async ({ userId, objectId }) => {
    const object = await getAccount(userId).object(objectId)
    return object.info
  },
  object_updatedAt: async ({ userId, objectId }) => {
    const object = await getAccount(userId).object(objectId)
    return object.updatedAt
  },
  object_setInfo: async ({ userId, objectId, info }) => {
    const object = await getAccount(userId).object(objectId)
    await object.setInfo(info)
    return object.info
  },
})
