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
import { PrivateKey } from 'ipfs-core/src/components/ipns'
import { MFSEntry } from 'ipfs-core/src/components/files/ls'
import all from 'it-all'
import WebSockets from 'libp2p-websockets'
import filters from 'libp2p-websockets/src/filters'
import { customAlphabet } from 'nanoid'
import Object from './object'
import { crypto } from './crypto'

export interface AccountOptions {
  swarm: string
  libp2pTransportFilter: 'all' | 'dnsWss' | 'dnsWsOrWss'
  ipnsGateway: string
  accountGateway: string
}

export class Account {
  static async generateKey() {
    return Ipfs.crypto.keys.generateKeyPair('RSA', 2048)
  }

  static async create(
    options: AccountOptions,
    args: { name: string; password: string } | { key: PrivateKey; password: string }
  ): Promise<Account> {
    function isKey(a: typeof args): a is { key: PrivateKey; password: string } {
      return typeof (a as any).key !== 'undefined'
    }

    const isNewKey = isKey(args)
    const key = isKey(args)
      ? args.key
      : await this.getPrivateKeyFromServer(options, args.name, args.password)

    const name = await key.id()
    const ipfs = await Ipfs.create({
      repo: name,
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

    try {
      await ipfs.key.rm(name)
    } catch {}
    await ipfs.key.import(name, await key.export('123456'), '123456')

    const account = new Account(options, ipfs, key, name, args.password)

    if (isNewKey) {
      const encryptedKey = await crypto.aes.encrypt(args.password, key.bytes)
      await ipfs.files.write(`/${name}/keystore/main`, new Uint8Array(encryptedKey), {
        parents: true,
        create: true,
        truncate: true,
      })

      await account.publish()
    } else {
      const cid = await this.resolveName(options, name)
      await ipfs.swarm.connect(options.swarm)
      try {
        await ipfs.files.rm(`/${name}`, { recursive: true })
      } catch {}
      await ipfs.files.cp(`/ipfs/${cid}`, `/${name}`)
    }

    return account
  }

  private static async getPrivateKeyFromServer(
    options: Pick<AccountOptions, 'ipnsGateway'>,
    name: string,
    password: string
  ): Promise<PrivateKey> {
    const url = `${options.ipnsGateway}/ipns/${name}/keystore/main`
    const buffer = await fetch(url).then(res => res.blob().then(blob => blob.arrayBuffer()))
    return Ipfs.crypto.keys.unmarshalPrivateKey(
      new Uint8Array(await crypto.aes.decrypt(password, buffer))
    )
  }

  private static async resolveName(
    options: Pick<AccountOptions, 'accountGateway'>,
    name: string
  ): Promise<string> {
    const url = `${options.accountGateway}/account/resolve?name=${name}`
    const json = await fetch(url).then(res => res.json())
    if (typeof json.cid === 'string') {
      return json.cid
    }
    throw new Error(`Resolve ${name} failed`)
  }

  private constructor(
    readonly options: AccountOptions,
    readonly ipfs: IPFS,
    readonly key: PrivateKey,
    readonly name: string,
    readonly password: string
  ) {
    this.crypto = new crypto.Crypto(this.password)
  }

  private get objectPath() {
    return `/${this.name}/objects`
  }

  private get draftPath() {
    return `/${this.name}-draft/objects`
  }

  private objectsCache: Map<string, Object> = new Map()

  readonly crypto: crypto.Crypto

  private nonce = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 5)

  async publish() {
    const peerId = new Ipfs.multiaddr(this.options.swarm).getPeerId()
    if (!peerId) {
      throw new Error(`Invalid swarm addrs ${this.options.swarm}`)
    }
    try {
      for await (const pong of this.ipfs.ping(peerId, { count: 2, timeout: 1000 })) {
        if (!pong.success) {
          throw new Error(`Ping ${peerId} error`)
        }
      }
    } catch {
      await this.ipfs.swarm.disconnect(this.options.swarm)
      await this.ipfs.swarm.connect(this.options.swarm)
    }

    const { cid } = await this.ipfs.files.stat(`/${this.name}`)
    const query = new URLSearchParams({ cid: cid.toString(), password: this.password }).toString()
    const url = `${this.options.accountGateway}/account/publish?${query}`
    await fetch(url, { method: 'POST' }).then(res => {
      if (res.status !== 200 && res.status !== 201) {
        throw new Error(`publish account return status: ${res.status}`)
      }
    })
  }

  async stop() {
    await this.ipfs.stop()
  }

  async *objects(): AsyncGenerator<Object> {
    const draftIter = this.iterateObject(this.draftPath)
    const objectIter = this.iterateObject(this.objectPath)

    let drafts: string[] = []
    let objects: string[] = []

    while (true) {
      if (!drafts.length) {
        const object = (await draftIter.next()).value
        if (object) {
          drafts.push(object)
        }
      }
      if (!objects.length) {
        const object = (await objectIter.next()).value
        if (object) {
          objects.push(object)
        }
      }
      const draftId = drafts.shift()
      const objectId = objects.shift()

      let id: string

      if (draftId && objectId) {
        if (draftId === objectId) {
          id = draftId
        } else if (draftId > objectId) {
          objects.unshift(objectId)
          id = draftId
        } else {
          drafts.unshift(draftId)
          id = objectId
        }
      } else if (draftId) {
        id = draftId
      } else if (objectId) {
        id = objectId
      } else {
        break
      }

      yield this.object(id)
    }
  }

  async object(objectId: string): Promise<Object> {
    const { createdAt, nonce } = this.checkObjectId(objectId)
    let object = this.objectsCache.get(objectId)
    if (!object) {
      const { draftPath, objectPath } = this.getObjectPath(createdAt, nonce)
      object = new Object(this, objectPath, draftPath, objectId, createdAt)
      this.objectsCache.set(objectId, object)
    }
    return object
  }

  async createObject(): Promise<Object> {
    const createdAt = Date.now()
    const { objectId, draftPath, objectPath } = this.getObjectPath(createdAt, this.nonce())
    const object = new Object(this, objectPath, draftPath, objectId, createdAt)
    return object
  }

  private getObjectPath(
    createdAt: number,
    nonce: string
  ): { objectId: string; draftPath: string; objectPath: string } {
    const date = new Date(createdAt)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return {
      objectId: `${createdAt}-${nonce}`,
      draftPath: `${this.draftPath}/${year}/${month}/${day}/${createdAt}-${nonce}`,
      objectPath: `${this.objectPath}/${year}/${month}/${day}/${createdAt}-${nonce}`,
    }
  }

  private checkObjectId(objectId: string): { createdAt: number; nonce: string } {
    const m = objectId.match(/^(?<time>\d+)-(?<nonce>[A-Z|0-9]{5})$/)
    if (m?.groups) {
      const { time, nonce } = m.groups
      const date = new Date(parseInt(time))
      const createdAt = date.getTime()
      if (!isNaN(createdAt)) {
        return { createdAt, nonce }
      }
    }
    throw new Error(`Invalid object path: ${objectId}`)
  }

  private async *iterateObject(dir: string) {
    let years: MFSEntry[]
    try {
      years = (await all(this.ipfs.files.ls(dir)))
        .filter(i => i.type === 'directory' && /^\d{4}$/.test(i.name))
        .sort((a, b) => (a.name < b.name ? 1 : -1))
    } catch (error: any) {
      if (error.code === 'ERR_NOT_FOUND') {
        return
      }
      throw error
    }

    for (const year of years) {
      const months = (await all(this.ipfs.files.ls(`${dir}/${year.name}`)))
        .filter(i => i.type === 'directory' && /^\d{2}$/.test(i.name))
        .sort((a, b) => (a.name < b.name ? 1 : -1))

      for (const month of months) {
        const dates = (await all(this.ipfs.files.ls(`${dir}/${year.name}/${month.name}`)))
          .filter(i => i.type === 'directory' && /^\d{2}$/.test(i.name))
          .sort((a, b) => (a.name < b.name ? 1 : -1))

        for (const date of dates) {
          const objects = (
            await all(this.ipfs.files.ls(`${dir}/${year.name}/${month.name}/${date.name}`))
          )
            .filter(i => i.type === 'directory' && /^(\d+)-(\S+)$/.test(i.name))
            .sort((a, b) => (a.name < b.name ? 1 : -1))

          for (const object of objects) {
            yield object.name
          }
        }
      }
    }
  }
}
