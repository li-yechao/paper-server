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

import { IPFS } from '@paper/ipfs'
import { RmOptions } from 'ipfs-core-types/src/files'

export namespace fileUtils {
  /**
   * Remove file if file exists.
   * @returns `true` if file exist otherwise `undefiend`
   */
  export async function rmIfExists(ipfs: IPFS, ipfsPaths: string | string[], options?: RmOptions) {
    try {
      await ipfs.files.rm(ipfsPaths, options)
      return true
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
}
