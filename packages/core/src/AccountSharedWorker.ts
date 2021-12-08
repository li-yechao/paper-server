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

import Ipfs, { IPFS } from '@paper/ipfs'
import * as IPFSFiles from 'ipfs-core-types/src/files'
import { IPFSEntry } from 'ipfs-core-types/src/root'
import { PrivateKey } from 'ipfs-core/src/components/ipns'
import all from 'it-all'
import WebSockets from 'libp2p-websockets'
import filters from 'libp2p-websockets/src/filters'
import debounce from 'lodash/debounce'
import { nanoid } from 'nanoid'
import {
  AccountOptions,
  ObjectInfo,
  Server,
  ServerEventMap,
  SERVER_EVENT_TYPES,
  validateObjectInfo,
} from './Channel'
import { ObjectId } from './ObjectId'
import { crypto } from './utils/crypto'
import { fileUtils } from './utils/files'
import sleep from './utils/sleep'
import { StrictEventEmitter } from './utils/StrictEventEmitter'

const keyPath = (id: string) => `/${id}/keystore/main`

new Server({
  generateKey: async (_: undefined) => {
    const key = await Ipfs.crypto.keys.generateKeyPair('RSA', 2048)
    return { key: key.bytes, id: await key.id() }
  },
  create: async ({ user, options }, port) => {
    const account = await Account.create(user, options)
    const { id } = account.user
    SERVER_EVENT_TYPES.forEach(type =>
      account.on(type, (data: any) =>
        port.postMessage({ type: 'event', userId: id, eventType: type, data })
      )
    )
    return { id }
  },
  cid: async ({ userId }) => {
    return Account.account(userId).cid
  },
  sync: async ({ userId, ...options }) => {
    await Account.account(userId).sync(options)
  },
  stop: async ({ userId }) => {
    await Account.stop(userId)
  },
  object: async ({ userId, objectId }) => {
    const object = await Account.account(userId).object(objectId)
    return { userId, objectId: object.id }
  },
  objects: async ({ userId, before, after, limit }) => {
    return Account.account(userId).objects({ before, after, limit })
  },
  deleteObject: async ({ userId, objectId }) => {
    return Account.account(userId).deleteObject(objectId)
  },
  object_files_cp: async ({ userId, objectId, from, to, options }) => {
    const object = await Account.account(userId).object(objectId)
    return object.files.cp(from, to, options)
  },
  object_files_mkdir: async ({ userId, objectId, path, options }) => {
    const object = await Account.account(userId).object(objectId)
    return object.files.mkdir(path, options)
  },
  object_files_stat: async ({ userId, objectId, path, options }) => {
    const object = await Account.account(userId).object(objectId)
    return object.files.stat(path, options)
  },
  object_files_touch: async ({ userId, objectId, path, options }) => {
    const object = await Account.account(userId).object(objectId)
    return object.files.touch(path, options)
  },
  object_files_rm: async ({ userId, objectId, path, options }) => {
    const object = await Account.account(userId).object(objectId)
    return object.files.rm(path, options)
  },
  object_files_mv: async ({ userId, objectId, from, to, options }) => {
    const object = await Account.account(userId).object(objectId)
    return object.files.mv(from, to, options)
  },
  object_files_ls: async ({ userId, objectId, path }) => {
    const object = await Account.account(userId).object(objectId)
    return all(object.files.ls(path))
  },
  object_read: async ({ userId, objectId, path, options }) => {
    const object = await Account.account(userId).object(objectId)
    return object.read(path, options)
  },
  object_write: async ({ userId, objectId, path, content, options }) => {
    const object = await Account.account(userId).object(objectId)
    return object.write(path, content, options)
  },
  object_info: async ({ userId, objectId }) => {
    const object = await Account.account(userId).object(objectId)
    return object.info
  },
  object_updatedAt: async ({ userId, objectId }) => {
    const object = await Account.account(userId).object(objectId)
    return object.updatedAt
  },
  object_setInfo: async ({ userId, objectId, info }) => {
    const object = await Account.account(userId).object(objectId)
    await object.setInfo(info)
    return object.info
  },
})

export default class Account extends StrictEventEmitter<{}, {}, ServerEventMap> {
  private constructor(
    readonly ipfs: IPFS,
    readonly user: { id: string; key: PrivateKey; password: string },
    readonly options: AccountOptions
  ) {
    super()
    this.crypto = new crypto.Crypto(this.user.password)
    setTimeout(() => this.syncDebounced())
  }

  static async create(
    user: { id: string; password: string } | { key: Uint8Array; password: string },
    options: AccountOptions
  ): Promise<Account> {
    function isKey(a: typeof user): a is { key: Uint8Array; password: string } {
      return typeof (a as any).key !== 'undefined'
    }

    let key: PrivateKey, id: string, ipfs: IPFS, account: Account | undefined

    if (isKey(user)) {
      key = await Ipfs.crypto.keys.unmarshalPrivateKey(user.key)
      id = await key.id()
      ipfs = await createIPFS({ repo: id, options, onChangeFile: () => account?.syncDebounced() })

      const encryptedKey = await crypto.aes.encrypt(user.password, key.bytes)
      await ipfs.files.write(keyPath(id), new Uint8Array(encryptedKey), {
        parents: true,
        create: true,
        truncate: true,
      })
    } else {
      id = user.id
      ipfs = await createIPFS({ repo: id, options, onChangeFile: () => account?.syncDebounced() })

      let raw = await fileUtils.ignoreErrNotFound(fileUtils.readAll(ipfs.files.read(keyPath(id))))

      if (!raw) {
        const cid = await resolveName(id, options)
        if (!cid) {
          throw new Error('Load CID from ipns failed')
        }
        raw = await fileUtils.readAll(ipfs.files.read(fileUtils.joinPath('/ipfs', keyPath(cid))))
      }
      const decrypted = await crypto.aes.decrypt(user.password, raw)
      key = await Ipfs.crypto.keys.unmarshalPrivateKey(new Uint8Array(decrypted))
    }

    account = this.accounts.get(id)
    if (!account) {
      account = new Account(ipfs, { id, key, password: user.password }, options)
      this.accounts.set(id, account)
    }
    return account
  }

  static account(userId: string) {
    const account = this.accounts.get(userId)
    if (!account) {
      throw new Error(`Account is not opened ${userId}`)
    }
    return account
  }

  static async stop(userId: string) {
    await this.account(userId).stop()
    this.accounts.delete(userId)
  }

  private static accounts: Map<string, Account> = new Map()

  get cid(): Promise<string | null> {
    return this.ipfs.files.stat(`/${this.user.id}`).then(s => s.cid.toString())
  }

  private get objectPath() {
    return `/${this.user.id}/objects`
  }

  private get objectTrashPath() {
    return `/${this.user.id}/trash/objects`
  }

  readonly crypto: crypto.Crypto

  async stop() {
    await this.ipfs.stop()
    this.removeAllListeners()
  }

  private _sync?: Promise<void>

  private syncDebounced = debounce(
    async () => {
      this.sync()
    },
    10000,
    { leading: true, trailing: true }
  )

  async sync(options: { skipDownload?: boolean } = {}) {
    if (!this._sync) {
      this._sync = (async () => {
        this.emitReserved('sync', { syncing: true })
        const cid = await resolveName(this.user.id, this.options)
        try {
          if (!options.skipDownload) {
            await this.syncIPFSFilesToLocal(cid)
          }

          // publish
          const newCID = (await this.ipfs.files.stat(`/${this.user.id}`)).cid.toString()
          if (newCID !== cid) {
            await withIPFSReconnect(
              this.ipfs,
              this.options,
              publishName(newCID, this.user.password, this.options)
            )
          }
          this.emitReserved('sync', { syncing: false, cid: (await this.cid) ?? undefined })
        } catch (error: any) {
          this.emitReserved('sync', { syncing: false, error: error.message })
          this.emitReserved('error', { message: error.message })
        }
      })()
    }
    await this._sync
    this._sync = undefined
  }

  private async syncIPFSFilesToLocal(cid: string | null) {
    // keystore
    const keystoreIPFS = await this.ipfs.files.stat(`/ipfs/${cid}/keystore`)
    const keystoreLocal = await fileUtils.ignoreErrNotFound(
      this.ipfs.files.stat(`/${this.user.id}/keystore`)
    )
    if (!keystoreLocal) {
      await this.ipfs.files.cp(`/ipfs/${cid}/keystore`, `/${this.user.id}/keystore`, {
        parents: true,
      })
    } else {
      if (!keystoreLocal.cid.equals(keystoreIPFS.cid)) {
        throw new Error(`CID of keystore is invalid`)
      }
    }

    // trash
    const trashIPFS = await fileUtils.ignoreErrNotFound(
      this.ipfs.files.stat(`/ipfs/${cid}/trash/objects`)
    )
    const trashLocal = await fileUtils.ignoreErrNotFound(
      this.ipfs.files.stat(`/${this.user.id}/trash/objects`)
    )
    if (trashIPFS && (!trashLocal || !trashIPFS.cid.equals(trashLocal.cid))) {
      for await (const { name: year } of this.ipfs.files.ls(`/ipfs/${cid}/trash/objects`)) {
        for await (const { name: month } of this.ipfs.files.ls(
          `/ipfs/${cid}/trash/objects/${year}`
        )) {
          for await (const { name: day } of this.ipfs.files.ls(
            `/ipfs/${cid}/trash/objects/${year}/${month}`
          )) {
            for await (const { name: objectId, cid: objectCID } of this.ipfs.files.ls(
              `/ipfs/${cid}/trash/objects/${year}/${month}/${day}`
            )) {
              const localPath = `/${this.user.id}/trash/objects/${year}/${month}/${day}/${objectId}`

              // Compare CID
              const localStat = await fileUtils.ignoreErrNotFound(this.ipfs.files.stat(localPath))
              if (localStat?.cid.equals(objectCID)) {
                continue
              }

              // Compare mtime
              const timeIPFS = await fileUtils.ignoreErrNotFound(
                fileUtils.readString(
                  this.ipfs.files.read(
                    `/ipfs/${cid}/trash/objects/${year}/${month}/${day}/${objectId}/mtime`
                  )
                )
              )
              const timeLocal = await fileUtils.ignoreErrNotFound(
                fileUtils.readString(this.ipfs.files.read(fileUtils.joinPath(localPath, 'mtime')))
              )
              if (timeIPFS && timeLocal) {
                if (timeIPFS <= timeLocal) {
                  continue
                }
              }

              await fileUtils.ignoreErrNotFound(this.ipfs.files.rm(localPath, { recursive: true }))
              await this.ipfs.files.cp(
                `/ipfs/${cid}/trash/objects/${year}/${month}/${day}/${objectId}`,
                localPath,
                { parents: true }
              )
            }
          }
        }
      }
    }

    // objects
    const objectsIPFS = await fileUtils.ignoreErrNotFound(
      this.ipfs.files.stat(`/ipfs/${cid}/objects`)
    )
    const objectsLocal = await fileUtils.ignoreErrNotFound(
      this.ipfs.files.stat(`/${this.user.id}/objects`)
    )
    if (objectsIPFS && (!objectsLocal || !objectsIPFS.cid.equals(objectsLocal.cid))) {
      for await (const { name: year } of this.ipfs.files.ls(`/ipfs/${cid}/objects`)) {
        for await (const { name: month } of this.ipfs.files.ls(`/ipfs/${cid}/objects/${year}`)) {
          for await (const { name: day } of this.ipfs.files.ls(
            `/ipfs/${cid}/objects/${year}/${month}`
          )) {
            for await (const { name: objectId, cid: objectCID } of this.ipfs.files.ls(
              `/ipfs/${cid}/objects/${year}/${month}/${day}`
            )) {
              const localPath = `/${this.user.id}/objects/${year}/${month}/${day}/${objectId}`

              // Compare CID
              const localStat = await fileUtils.ignoreErrNotFound(this.ipfs.files.stat(localPath))
              if (localStat?.cid.equals(objectCID)) {
                continue
              }

              // Compare mtime
              const timeIPFS = await fileUtils.ignoreErrNotFound(
                fileUtils.readString(
                  this.ipfs.files.read(
                    `/ipfs/${cid}/objects/${year}/${month}/${day}/${objectId}/mtime`
                  )
                )
              )
              const timeLocal = await fileUtils.ignoreErrNotFound(
                fileUtils.readString(this.ipfs.files.read(fileUtils.joinPath(localPath, 'mtime')))
              )
              if (timeIPFS && timeLocal) {
                if (timeIPFS <= timeLocal) {
                  continue
                }
              }

              await fileUtils.ignoreErrNotFound(this.ipfs.files.rm(localPath, { recursive: true }))
              await this.ipfs.files.cp(
                `/ipfs/${cid}/objects/${year}/${month}/${day}/${objectId}`,
                localPath,
                { parents: true }
              )

              // Create mtime file if not exist
              if (!timeIPFS) {
                const { createdAt } = ObjectId.parse(objectId)
                await this.ipfs.files.write(
                  fileUtils.joinPath(localPath, 'mtime'),
                  createdAt.toString(),
                  { truncate: true, create: true, parents: true }
                )
              }
            }
          }
        }
      }
    }

    const isDeleted = async (objectId: string) => {
      const deleted = await fileUtils.ignoreErrNotFound(
        this.ipfs.files.stat(this.getObjectTrashPath(ObjectId.parse(objectId)))
      )
      return !!deleted
    }

    for await (const { name: year } of this.ipfs.files.ls(`/${this.user.id}/objects`)) {
      for await (const { name: month } of this.ipfs.files.ls(`/${this.user.id}/objects/${year}`)) {
        for await (const { name: day } of this.ipfs.files.ls(
          `/${this.user.id}/objects/${year}/${month}`
        )) {
          for await (const { name: objectId } of this.ipfs.files.ls(
            `/${this.user.id}/objects/${year}/${month}/${day}`
          )) {
            // Deleted
            const deleted = await isDeleted(objectId)
            if (deleted) {
              const localPath = `/${this.user.id}/objects/${year}/${month}/${day}/${objectId}`
              await fileUtils.ignoreErrNotFound(this.ipfs.files.rm(localPath, { recursive: true }))
              continue
            }
          }
        }
      }
    }
  }

  private objectsCache: Map<string, Object> = new Map()

  private getObjectPathSegments(objectId: ObjectId): { year: string; month: string; day: string } {
    const date = new Date(objectId.createdAt)
    const year = date.getFullYear().toString()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return { year, month, day }
  }

  private getObjectPath(objectId: ObjectId): string {
    const { year, month, day } = this.getObjectPathSegments(objectId)
    return fileUtils.joinPath(this.objectPath, year, month, day, ObjectId.toString(objectId))
  }

  private getObjectTrashPath(objectId: ObjectId): string {
    const { year, month, day } = this.getObjectPathSegments(objectId)
    return fileUtils.joinPath(this.objectTrashPath, year, month, day, ObjectId.toString(objectId))
  }

  async object(objectId?: string | ObjectId): Promise<Object> {
    objectId = ObjectId.parse(objectId ?? ObjectId.create())
    const key = ObjectId.toString(objectId)
    let object = this.objectsCache.get(key)
    if (!object) {
      object = new Object(
        new ObjectFiles(this.ipfs, this.getObjectPath(objectId)),
        this.crypto,
        objectId
      )
      this.objectsCache.set(key, object)
    }
    return object
  }

  async deleteObject(objectId?: string | ObjectId) {
    objectId = ObjectId.parse(objectId ?? ObjectId.create())
    const key = ObjectId.toString(objectId)
    this.objectsCache.delete(key)
    await this.ipfs.files.mv(this.getObjectPath(objectId), this.getObjectTrashPath(objectId), {
      parents: true,
    })
  }

  async objects({
    before,
    after,
    limit,
  }: {
    before?: string | ObjectId
    after?: string | ObjectId
    limit: number
  }): Promise<string[]> {
    before = before ? ObjectId.parse(before) : undefined
    after = after ? ObjectId.parse(after) : undefined

    const localIter = this.iterateObject(path => all(this.ipfs.files.ls(path)), this.objectPath, {
      before,
      after,
    })

    const result: string[] = []

    while (true) {
      const next = await localIter.next()

      if (next.done) {
        break
      }

      result.push(next.value)

      if (result.length >= limit) {
        break
      }
    }

    return after ? result.reverse() : result
  }

  private async *iterateObject(
    ls: (path: string) => Promise<(IPFSFiles.MFSEntry | IPFSEntry)[]>,
    dir: string,
    { before, after }: { before?: ObjectId; after?: ObjectId }
  ) {
    const lsDir = async (path: string) => {
      return ls(path).then(res => res.filter(i => i.type === 'directory' || i.type === 'dir'))
    }

    const beforeFilter = before && {
      ...this.getObjectPathSegments(before),
      objectId: ObjectId.toString(before),
    }
    const afterFilter = after && {
      ...this.getObjectPathSegments(after),
      objectId: ObjectId.toString(after),
    }

    const sorter = beforeFilter
      ? (i: { name: string }, j: { name: string }) => (i.name < j.name ? 1 : -1)
      : afterFilter
      ? (i: { name: string }, j: { name: string }) => (i.name < j.name ? -1 : 1)
      : (i: { name: string }, j: { name: string }) => (i.name < j.name ? 1 : -1)

    type Filter = (y: string, m?: string, d?: string, o?: string) => boolean

    const baseFilter: Filter = (y, m, d, o) => {
      if (!/^\d{4}$/.test(y)) {
        return false
      } else if (m && !/^\d{2}$/.test(m)) {
        return false
      } else if (d && !/^\d{2}$/.test(d)) {
        return false
      } else if (o && !ObjectId.objectIdReg.test(o)) {
        return false
      }
      return true
    }

    const filter: Filter = beforeFilter
      ? (y, m, d, o) => {
          if (!baseFilter(y, m, d, o)) {
            return false
          }

          const { year, month, day, objectId } = beforeFilter
          if (!m) {
            return y <= year
          } else if (!d) {
            return y < year || (y === year && m <= month)
          } else if (!o) {
            return y < year || (y === year && m < month) || (y === year && m === month && d <= day)
          } else {
            return (
              y < year ||
              (y === year && m < month) ||
              (y === year && m === month && d < day) ||
              (y === year && m === month && d === day && o < objectId)
            )
          }
        }
      : afterFilter
      ? (y, m, d, o) => {
          if (!baseFilter(y, m, d, o)) {
            return false
          }

          const { year, month, day, objectId } = afterFilter
          if (!m) {
            return y >= year
          } else if (!d) {
            return y > year || (y === year && m >= month)
          } else if (!o) {
            return y > year || (y === year && m > month) || (y === year && m === month && d >= day)
          } else {
            return (
              y > year ||
              (y === year && m > month) ||
              (y === year && m === month && d > day) ||
              (y === year && m === month && d === day && o > objectId)
            )
          }
        }
      : baseFilter

    const years = await (async () => {
      try {
        return (await lsDir(dir)).filter(({ name: year }) => filter(year)).sort(sorter)
      } catch (error: any) {
        if (fileUtils.isErrNotFound(error)) {
          return []
        }
        throw error
      }
    })()

    for (const { name: year } of years) {
      const months = (await lsDir(`${dir}/${year}`))
        .filter(({ name: month }) => filter(year, month))
        .sort(sorter)

      for (const { name: month } of months) {
        const days = (await lsDir(`${dir}/${year}/${month}`))
          .filter(({ name: day }) => filter(year, month, day))
          .sort(sorter)

        for (const { name: day } of days) {
          const objects = (await lsDir(`${dir}/${year}/${month}/${day}`))
            .filter(({ name: objectId }) => filter(year, month, day, objectId))
            .sort(sorter)

          for (const { name: objectId } of objects) {
            yield objectId
          }
        }
      }
    }
  }
}

class Object {
  constructor(readonly files: ObjectFiles, readonly crypto: crypto.Crypto, id: string | ObjectId) {
    this.objectId = ObjectId.parse(id)
    this.id = ObjectId.toString(this.objectId)
  }

  readonly id: string

  private readonly objectId: ObjectId

  private readonly passwordFilePath = '/password'

  private _password?: Promise<string>

  private get password(): Promise<string> {
    if (!this._password) {
      const getPassword = async (content: AsyncIterable<Uint8Array>) => {
        try {
          const raw = await fileUtils.readAll(content)
          return new TextDecoder().decode(await this.crypto.aes.decrypt(raw))
        } catch (error) {
          if (!fileUtils.isErrNotFound(error)) {
            throw error
          }
        }
      }

      this._password = (async () => {
        return (
          (await getPassword(this.files.read(this.passwordFilePath))) ||
          (await (async () => {
            const password = nanoid(32)
            const raw = await this.crypto.aes.encrypt(new TextEncoder().encode(password))
            await this.files.write(this.passwordFilePath, new Uint8Array(raw), {
              parents: true,
              create: true,
              truncate: true,
            })
            return password
          })())
        )
      })()
    }
    return this._password
  }

  async read(path: string, options?: IPFSFiles.ReadOptions): Promise<ArrayBuffer> {
    const buffer = await fileUtils.readAll(this.files.read(path, options))
    return crypto.aes.decrypt(await this.password, buffer)
  }

  async write(path: string, content: string | ArrayBuffer, options?: IPFSFiles.WriteOptions) {
    if (typeof content === 'string') {
      content = new TextEncoder().encode(content)
    }
    const buffer = await crypto.aes.encrypt(await this.password, content)
    await this.files.write(path, new Uint8Array(buffer), options)
  }

  private readonly infoFilePath = '/info.json'
  private readonly mtimeFilePath = '/mtime'

  private _info?: Promise<ObjectInfo>

  get info(): Promise<ObjectInfo> {
    if (!this._info) {
      this._info = (async () => {
        try {
          const json = JSON.parse(new TextDecoder().decode(await this.read(this.infoFilePath)))
          if (validateObjectInfo(json)) {
            return json
          }
        } catch {}
        return {}
      })()
    }
    return this._info
  }

  private _updatedAt?: Promise<number>

  get updatedAt(): Promise<number> {
    if (!this._updatedAt) {
      this._updatedAt = (async () => {
        const time = await fileUtils.ignoreErrNotFound(
          fileUtils.readString(this.files.read('/mtime'))
        )
        return (time && parseInt(time)) || 0
      })()
    }
    return this._updatedAt
  }

  async setInfo(info: Partial<ObjectInfo> = {}) {
    const old = await this.info

    globalThis.Object.entries(info).forEach(
      ([key, value]) => value !== undefined && ((old as any)[key] = value)
    )

    await this.write(this.infoFilePath, JSON.stringify(old), {
      parents: true,
      create: true,
      truncate: true,
    })

    const updatedAt = Date.now()
    await this.files.write(this.mtimeFilePath, updatedAt.toString(), {
      parents: true,
      create: true,
      truncate: true,
    })

    this._info = Promise.resolve(old)
    this._updatedAt = Promise.resolve(updatedAt)
  }
}

class ObjectFiles {
  constructor(private ipfs: IPFS, private base: string) {
    if (!base.startsWith('/')) {
      throw new Error(`Base must be starts with /, but got "${base}"`)
    }
  }

  cp(from: string | string[], to: string, options?: IPFSFiles.CpOptions) {
    return this.ipfs.files.cp(this.resolvePath(from), this.resolvePath(to), options)
  }

  mkdir(path: string, options?: IPFSFiles.MkdirOptions) {
    return this.ipfs.files.mkdir(this.resolvePath(path), options)
  }

  stat(ipfsPath: string, options?: IPFSFiles.StatOptions) {
    return this.ipfs.files.stat(this.resolvePath(ipfsPath), options)
  }

  touch(ipfsPath: string, options?: IPFSFiles.TouchOptions) {
    return this.ipfs.files.touch(this.resolvePath(ipfsPath), options)
  }

  rm(ipfsPaths: string | string[], options?: IPFSFiles.RmOptions) {
    return this.ipfs.files.rm(this.resolvePath(ipfsPaths), options)
  }

  read(ipfsPath: string, options?: IPFSFiles.ReadOptions) {
    return this.ipfs.files.read(this.resolvePath(ipfsPath), options)
  }

  write(
    ipfsPath: string,
    content: string | Uint8Array | Blob | AsyncIterable<Uint8Array> | Iterable<Uint8Array>,
    options?: IPFSFiles.WriteOptions
  ) {
    return this.ipfs.files.write(this.resolvePath(ipfsPath), content, options)
  }

  mv(from: string | string[], to: string, options?: IPFSFiles.MvOptions) {
    return this.ipfs.files.mv(this.resolvePath(from), this.resolvePath(to), options)
  }

  ls(ipfsPath: string) {
    return this.ipfs.files.ls(this.resolvePath(ipfsPath))
  }

  private resolvePath(path: string[]): string[]
  private resolvePath(path: string): string
  private resolvePath(path: string | string[]): string | string[]
  private resolvePath(path: string | string[]): string | string[] {
    if (Array.isArray(path)) {
      return path.map(i => this.resolvePath(i))
    }
    return fileUtils.joinPath(this.base, path)
  }
}

async function createIPFS({
  repo,
  options,
  onChangeFile,
}: {
  repo: string
  options: Pick<AccountOptions, 'libp2pTransportFilter' | 'swarm'>
  onChangeFile?: () => void
}) {
  const ipfs = await Ipfs.create({
    repo,
    preload: {
      enabled: false,
    },
    config: {
      Bootstrap: [],
    },
    libp2p: {
      config: {
        transport: {
          [WebSockets.prototype[Symbol.toStringTag]]: {
            filter: filters[options.libp2pTransportFilter],
          },
        },
      },
    },
  })

  const { chmod, cp, mkdir, stat, touch, rm, read, write, mv, flush, ls } = ipfs.files

  ipfs.files.chmod = (...args) => {
    return withIPFSReconnect(ipfs, options, chmod.call(ipfs, ...args)).then(res => {
      onChangeFile?.()
      return res
    })
  }

  ipfs.files.cp = (...args) => {
    return withIPFSReconnect(ipfs, options, cp.call(ipfs, ...args)).then(res => {
      onChangeFile?.()
      return res
    })
  }

  ipfs.files.mkdir = (...args) => {
    return withIPFSReconnect(ipfs, options, mkdir.call(ipfs, ...args)).then(res => {
      onChangeFile?.()
      return res
    })
  }

  ipfs.files.stat = (...args) => {
    return withIPFSReconnect(ipfs, options, stat.call(ipfs, ...args))
  }

  ipfs.files.touch = (...args) => {
    return withIPFSReconnect(ipfs, options, touch.call(ipfs, ...args)).then(res => {
      onChangeFile?.()
      return res
    })
  }

  ipfs.files.rm = (...args) => {
    return withIPFSReconnect(ipfs, options, rm.call(ipfs, ...args)).then(res => {
      onChangeFile?.()
      return res
    })
  }

  ipfs.files.read = (...args) => {
    return withIPFSReconnectIterable(ipfs, options, read.call(ipfs, ...args))
  }

  ipfs.files.write = (...args) => {
    return withIPFSReconnect(ipfs, options, write.call(ipfs, ...args)).then(res => {
      onChangeFile?.()
      return res
    })
  }

  ipfs.files.mv = (...args) => {
    return withIPFSReconnect(ipfs, options, mv.call(ipfs, ...args)).then(res => {
      onChangeFile?.()
      return res
    })
  }

  ipfs.files.flush = (...args) => {
    return withIPFSReconnect(ipfs, options, flush.call(ipfs, ...args))
  }

  ipfs.files.ls = (...args) => {
    return withIPFSReconnectIterable(ipfs, options, ls.call(ipfs, ...args))
  }

  return ipfs
}

async function resolveName(
  userId: string,
  options: Pick<AccountOptions, 'accountGateway'>
): Promise<string | null> {
  const url = `${options.accountGateway}/account/resolve?name=${userId}`
  const json = await fetch(url).then(res => res.json())
  if (typeof json.cid === 'string' || json.cid === null) {
    return json.cid
  }
  throw new Error(`Resolve ${userId} failed`)
}

async function publishName(
  cid: string,
  password: string,
  options: Pick<AccountOptions, 'accountGateway'>
): Promise<void> {
  const query = new URLSearchParams({ cid, password }).toString()
  const url = `${options.accountGateway}/account/publish?${query}`
  await fetch(url, { method: 'POST' }).then(res => {
    if (res.status !== 200 && res.status !== 201) {
      throw new Error(`publish account return status: ${res.status}`)
    }
  })
}

const SWARM_CONNECTION_CHECK_LIFETIME = 10000

async function* withIPFSReconnectIterable<T>(
  ipfs: IPFS,
  options: Pick<AccountOptions, 'swarm'>,
  task: AsyncIterable<T>
): AsyncIterable<T> {
  const iter = task[Symbol.asyncIterator]()

  while (true) {
    const res = await withIPFSReconnect(ipfs, options, iter.next())
    if (res.done) {
      return
    }
    yield res.value
  }
}

async function withIPFSReconnect<T>(
  ipfs: IPFS,
  options: Pick<AccountOptions, 'swarm'>,
  task: Promise<T>
): Promise<T> {
  const sleepFlag = '__SLEEP_FLAG__' as const
  while (true) {
    const res = await Promise.race([task, sleep(1000).then(() => sleepFlag)])
    if (res !== sleepFlag) {
      return res
    } else {
      await ensureSwarmConnection(ipfs, options)
    }
  }
}

async function ensureSwarmConnection(
  ipfs: IPFS & { _ensureSwarmConnection?: Promise<void> },
  options: Pick<AccountOptions, 'swarm'>
) {
  if (!ipfs._ensureSwarmConnection) {
    ipfs._ensureSwarmConnection = (async () => {
      const peerId = new Ipfs.multiaddr(options.swarm).getPeerId()
      if (!peerId) {
        throw new Error(`Invalid swarm addrs ${options.swarm}`)
      }
      try {
        for await (const pong of ipfs.ping(peerId, { count: 2, timeout: 1000 })) {
          if (!pong.success) {
            throw new Error(`Ping ${peerId} error`)
          }
        }
      } catch {
        await ipfs.swarm.disconnect(options.swarm)
        await ipfs.swarm.connect(options.swarm)
      }

      setTimeout(() => {
        ipfs._ensureSwarmConnection = undefined
      }, SWARM_CONNECTION_CHECK_LIFETIME)
    })()
  }
  return ipfs._ensureSwarmConnection
}
