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

import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as crypto from 'crypto'
import { $, fs, os, path, sleep } from 'zx'
import { Config } from '../config'

export type IpfsConfig = Pick<
  Config,
  'ipfsPath' | 'ipfsApiPort' | 'ipfsGatewayPort' | 'ipfsSwarmPort' | 'ipfsSwarmWsPort'
>

@Injectable()
export class AccountService {
  static async startIpfs(config: IpfsConfig) {
    if (!fs.existsSync(`${config.ipfsPath}/config`)) {
      await $`IPFS_PATH=${config.ipfsPath} ipfs init`
    }

    const CONFIG_ADDRESSES = {
      API: config.ipfsApiPort ? `/ip4/127.0.0.1/tcp/${config.ipfsApiPort}` : undefined,
      Announce: [],
      Gateway: config.ipfsGatewayPort ? `/ip4/127.0.0.1/tcp/${config.ipfsGatewayPort}` : undefined,
      NoAnnounce: [],
      Swarm: (() => {
        const list: string[] = []
        if (config.ipfsSwarmWsPort) {
          list.push(`/ip4/0.0.0.0/tcp/${config.ipfsSwarmWsPort}/ws`)
        }
        if (config.ipfsSwarmPort) {
          list.push(
            `/ip4/0.0.0.0/tcp/${config.ipfsSwarmPort}`,
            `/ip6/::/tcp/${config.ipfsSwarmPort}`,
            `/ip4/0.0.0.0/udp/${config.ipfsSwarmPort}/quic`,
            `/ip6/::/udp/${config.ipfsSwarmPort}/quic`
          )
        }
        return list.length > 0 ? list : undefined
      })(),
    }

    await $`IPFS_PATH=${config.ipfsPath} ipfs config --json Addresses ${JSON.stringify(
      CONFIG_ADDRESSES
    )}`

    $`IPFS_PATH=${config.ipfsPath} ipfs daemon`.catch(error => {
      console.error(error)
      process.exit(1)
    })

    while (true) {
      await sleep(500)
      if (fs.existsSync(`${config.ipfsPath}/api`)) {
        break
      }
    }
  }

  constructor(private configService: ConfigService) {}

  private get ipfsPath() {
    return this.configService.get<string>('ipfsPath')
  }

  async publish(cid: string, password: string) {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `${cid}-`))
    try {
      await $`IPFS_PATH=${this.ipfsPath} ipfs pin add ${cid}`

      await $`IPFS_PATH=${this.ipfsPath} ipfs get -o ${tmpDir} ${cid}/keystore/main`
      const buffer = fs.readFileSync(`${tmpDir}/main`)

      const rawKey = await crypto.webcrypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(password)
      )
      const rawKeyHex = [...new Uint8Array(rawKey)]
        .map(i => i.toString(16).padStart(2, '0'))
        .join(',')
      const iv = await crypto.webcrypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(rawKeyHex.concat(password))
      )
      const k = await crypto.webcrypto.subtle.importKey('raw', rawKey, 'AES-GCM', true, ['decrypt'])
      const decrypted = new Uint8Array(
        await crypto.webcrypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, k, buffer)
      )
      fs.writeFileSync(`${tmpDir}/key`, decrypted, {})

      try {
        await $`IPFS_PATH=${this.ipfsPath} ipfs key rm ${cid}`
      } catch {}

      await $`IPFS_PATH=${this.ipfsPath} ipfs key import --ipns-base b58mh ${cid} ${tmpDir}/key`
      await $`IPFS_PATH=${this.ipfsPath} ipfs name publish --ipns-base b58mh --key ${cid} ${cid}`
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  }
}
