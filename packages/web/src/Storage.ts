// Copyright 2022 LiYechao
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

import { keys, PrivateKey } from 'libp2p-crypto'
import { fromString, toString as uint8arraysToString } from 'uint8arrays'

export default class Storage {
  private static PRIVATE_KEY = 'PAPER_PRIVATE_KEY'

  private static _privateKey: PrivateKey | null = null

  static async getPrivateKey(): Promise<PrivateKey | null> {
    if (!this._privateKey) {
      try {
        const raw = localStorage.getItem(this.PRIVATE_KEY)
        if (raw) {
          const bytes = fromString(raw, 'base64')
          this._privateKey = await keys.unmarshalPrivateKey(bytes)
        }
      } catch {}
    }
    return this._privateKey
  }

  static setPrivateKey(key: PrivateKey | null) {
    this._privateKey = key
    if (key) {
      localStorage.setItem(
        this.PRIVATE_KEY,
        uint8arraysToString(new Uint8Array(key.bytes), 'base64')
      )
    } else {
      localStorage.removeItem(this.PRIVATE_KEY)
    }
  }
}
