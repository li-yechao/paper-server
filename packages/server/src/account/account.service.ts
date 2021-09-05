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

export type IpfsConfig = Config['ipfs']

@Injectable()
export class AccountService {
  static async startIpfs(config: IpfsConfig) {
    if (!fs.existsSync(`${config.repo}/config`)) {
      await $`IPFS_PATH=${config.repo} ipfs init`
    }

    const CONFIG_ADDRESSES = {
      API: config.api,
      Announce: [],
      Gateway: config.gateway,
      NoAnnounce: [],
      Swarm: config.swarm,
    }

    await $`IPFS_PATH=${config.repo} ipfs config --json Addresses ${JSON.stringify(
      CONFIG_ADDRESSES
    )}`

    $`IPFS_PATH=${config.repo} ipfs daemon`.catch(error => {
      console.error(error)
      process.exit(1)
    })

    while (true) {
      await sleep(500)
      if (fs.existsSync(`${config.repo}/api`)) {
        break
      }
    }
  }

  constructor(private configService: ConfigService) {}

  private get ipfsPath() {
    return this.configService.get<string>('ipfs.repo')
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

      const name = (
        await $`IPFS_PATH=${this.ipfsPath} ipfs key import --ipns-base b58mh ${cid} ${tmpDir}/key`
      ).stdout.trim()

      await Promise.race([
        $`IPFS_PATH=${this.ipfsPath} ipfs name publish --ipns-base b58mh --key ${cid} ${cid}`,
        this.waitPublish(name, cid),
      ])
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  }

  private async waitPublish(name: string, cid: string) {
    let retry = 100
    while (retry > 0) {
      retry -= 1
      await sleep(200)
      try {
        const resolved = (
          await $`IPFS_PATH=${this.ipfsPath} ipfs name resolve --dhtt 500ms ${name}`
        ).stdout.trim()
        if (resolved === cid || resolved === `/ipfs/${cid}`) {
          return
        }
      } catch {}
    }
    throw new Error(`Wait CID ${cid} publish with name ${name} timeout`)
  }
}
