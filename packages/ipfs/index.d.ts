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

/**
 * @typedef {import('ipfs-core-types').IPFS} IPFS
 */
export const create: typeof import('ipfs-core').create
export const crypto: typeof import('libp2p-crypto')
export const isIPFS: typeof import('is-ipfs')
export const CID: typeof import('multiformats').CID
export const multiaddr: typeof import('multiaddr').Multiaddr
export const PeerId: typeof import('peer-id')
export const globSource: typeof import('ipfs-utils/src/files/glob-source')
export const urlSource: typeof import('ipfs-utils/src/files/url-source')
export const path: typeof pathImport
export type IPFS = import('ipfs-core-types').IPFS
import { path as pathImport } from './path.js'
//# sourceMappingURL=index.d.ts.map
