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

export namespace crypto {
  const subtle = globalThis.crypto.subtle

  export namespace aes {
    export async function encrypt(key: string, data: ArrayBuffer): Promise<ArrayBuffer> {
      const hash = await subtle.digest('SHA-256', new TextEncoder().encode(key))
      const hashHex = [...new Uint8Array(hash)].map(i => i.toString(16).padStart(2, '0')).join(',')
      const iv = await subtle.digest('SHA-256', new TextEncoder().encode(hashHex.concat(key)))
      const k = await subtle.importKey('raw', hash, 'AES-GCM', true, ['encrypt'])
      return subtle.encrypt({ name: 'AES-GCM', iv: iv }, k, data)
    }

    export async function decrypt(key: string, data: ArrayBuffer): Promise<ArrayBuffer> {
      const hash = await subtle.digest('SHA-256', new TextEncoder().encode(key))
      const hashHex = [...new Uint8Array(hash)].map(i => i.toString(16).padStart(2, '0')).join(',')
      const iv = await subtle.digest('SHA-256', new TextEncoder().encode(hashHex.concat(key)))
      const k = await subtle.importKey('raw', hash, 'AES-GCM', true, ['decrypt'])
      return subtle.decrypt({ name: 'AES-GCM', iv: iv }, k, data)
    }
  }

  export class Crypto {
    constructor(private key: string) {}

    readonly aes = {
      encrypt: (data: ArrayBuffer) => aes.encrypt(this.key, data),
      decrypt: (data: ArrayBuffer) => aes.decrypt(this.key, data),
    }
  }
}
