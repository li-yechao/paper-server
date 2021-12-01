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

import all from 'it-all'

export namespace fileUtils {
  export async function ignoreErrNotFound<T>(promise: Promise<T>) {
    try {
      return await promise
    } catch (error) {
      if (!isErrNotFound(error)) {
        throw error
      }
    }
  }

  export const ERR_NOT_FOUND = 'ERR_NOT_FOUND'

  export function isErrNotFound(e: any): e is Error & { code: typeof ERR_NOT_FOUND } {
    return e.code === ERR_NOT_FOUND
  }

  export async function readAll(source: AsyncIterable<Uint8Array>): Promise<Uint8Array> {
    const chunks = await all(source)
    const buffer = new Uint8Array(chunks.reduce((res, i) => res + i.byteLength, 0))
    let offset = 0
    for (const chunk of chunks) {
      buffer.set(chunk, offset)
      offset += chunk.byteLength
    }
    return buffer
  }

  export async function readString(source: AsyncIterable<Uint8Array>): Promise<string> {
    return new TextDecoder().decode(await readAll(source))
  }

  export function joinPath(...path: string[]): string {
    return path
      .map((p, i) => (i === 0 ? p : p.replace(/^\/+/, '')))
      .filter(i => !!i)
      .join('/')
  }
}
