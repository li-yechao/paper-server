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
import { Base64 } from 'js-base64'
import WebSockets from 'libp2p-websockets'
import filters from 'libp2p-websockets/src/filters'
import { customAlphabet } from 'nanoid'
import Object from './object'

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
        Identity: {
          PeerID: name,
          PrivKey: Base64.fromUint8Array(key.bytes),
        },
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

    const account = new Account(options, ipfs, key, name, args.password)

    if (isNewKey) {
      const encryptedKey = await Account.encryptPrivateKey(args.password, key)
      await ipfs.files.write(`/${name}/keystore/main`, new Uint8Array(encryptedKey), {
        parents: true,
        create: true,
        truncate: true,
      })

      await account.publish()
    } else {
      const cid = await this.resolveName(options, name)
      await ipfs.swarm.connect(options.swarm)
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
    return this.decryptPrivateKey(password, buffer)
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

  private static async encryptPrivateKey(password: string, key: PrivateKey): Promise<ArrayBuffer> {
    const rawKey = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
    const rawKeyHex = [...new Uint8Array(rawKey)]
      .map(i => i.toString(16).padStart(2, '0'))
      .join(',')
    const iv = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(rawKeyHex.concat(password))
    )
    const k = await crypto.subtle.importKey('raw', rawKey, 'AES-GCM', true, ['encrypt'])
    return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, k, key.bytes)
  }

  private static async decryptPrivateKey(password: string, key: ArrayBuffer): Promise<PrivateKey> {
    const rawKey = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
    const rawKeyHex = [...new Uint8Array(rawKey)]
      .map(i => i.toString(16).padStart(2, '0'))
      .join(',')
    const iv = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(rawKeyHex.concat(password))
    )
    const k = await crypto.subtle.importKey('raw', rawKey, 'AES-GCM', true, ['decrypt'])
    const buffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, k, key)
    return Ipfs.crypto.keys.unmarshalPrivateKey(new Uint8Array(buffer))
  }

  private constructor(
    readonly options: AccountOptions,
    readonly ipfs: IPFS,
    readonly key: PrivateKey,
    readonly name: string,
    readonly password: string
  ) {}

  private nonce = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 5)

  async publish() {
    await this.ipfs.swarm.connect(this.options.swarm)

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

  drafts() {
    return this.iterateObject(`/${this.name}-draft/objects`)
  }

  async createDraft(): Promise<Object> {
    const dir = `/${this.name}-draft/objects`
    const object = new Object(this.ipfs, dir, new Date(), this.nonce())
    await object.init()
    return object
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
            const m = object.name.match(/^(?<date>\d+)-(?<nonce>\S+)$/)
            if (m?.groups?.['date'] && m.groups['nonce']) {
              const d = new Date(parseInt(m.groups['date']))
              const nonce = m.groups['nonce']

              yield new Object(this.ipfs, dir, d, nonce)
            }
          }
        }
      }
    }
  }
}
