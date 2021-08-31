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
import { PrivateKey } from 'ipfs-core/src/components/ipns'
import { Base64 } from 'js-base64'
import WebSockets from 'libp2p-websockets'
import filters from 'libp2p-websockets/src/filters'

export interface AccountOptions {
  swarm: string
  libp2pTransportFilter: 'all' | 'dnsWss' | 'dnsWsOrWss'
  ipnsGateway: string
  accountGateway: string
}

export class Account {
  static async signUp(password: string, options: AccountOptions): Promise<Account> {
    const key = await Ipfs.crypto.keys.generateKeyPair('RSA', 2048)
    const id = await key.id()
    const encryptedKey = await this.encryptPrivateKey(password, key)
    const ipfs = await Ipfs.create({
      repo: await key.id(),
      preload: {
        enabled: false,
      },
      config: {
        Bootstrap: [],
        Identity: {
          PeerID: id,
          PrivKey: Base64.fromUint8Array(key.bytes),
        },
      },
      libp2p: {
        config: {
          transport: {
            [WebSockets.prototype[Symbol.toStringTag]]: {
              filter: filters.all,
            },
          },
        },
      },
    })
    await ipfs.swarm.connect(options.swarm)
    await ipfs.files.write(`/${id}/keystore/main`, new Uint8Array(encryptedKey), {
      parents: true,
      create: true,
      truncate: true,
    })
    const { cid } = await ipfs.files.stat(`/${id}`)

    await fetch(
      `${options.accountGateway}/account/publish?cid=${cid.toString()}&password=${password}`,
      { method: 'POST' }
    ).then(res => {
      if (res.status !== 200) {
        throw new Error(`publish account return status: ${res.status}`)
      }
    })

    return new Account(ipfs)
  }

  static async signIn(name: string, password: string, options: AccountOptions): Promise<Account> {
    const url = `${options.ipnsGateway}/ipns/${name}/keystore/main`
    const buffer = await fetch(url).then(res => res.blob().then(blob => blob.arrayBuffer()))
    const key = await this.decryptPrivateKey(password, buffer)

    const ipfs = await Ipfs.create({
      repo: await key.id(),
      preload: {
        enabled: false,
      },
      config: {
        Bootstrap: [],
        Identity: {
          PeerID: await key.id(),
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

    await ipfs.swarm.connect(options.swarm)

    return new Account(ipfs)
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

  constructor(readonly ipfs: Ipfs.IPFS) {}
}
