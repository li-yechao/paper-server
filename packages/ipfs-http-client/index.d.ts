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
 * @typedef {import('./types').EndpointConfig} EndpointConfig
 * @typedef {import('./types').Options} Options
 * @typedef {import('multiformats/codecs/interface').BlockCodec<any, any>} BlockCodec
 * @typedef {import('multiformats/hashes/interface').MultihashHasher} MultihashHasher
 * @typedef {import('multiformats/bases/interface').MultibaseCodec<any>} MultibaseCodec
 * @typedef {import('./types').IPFSHTTPClient} IPFSHTTPClient
 */
/**
 * @param {Options} options
 */
export function create(options?: Options): import('./types').IPFSHTTPClient
export { CID } from 'multiformats/cid'
export { Multiaddr as multiaddr } from 'multiaddr'
export { default as urlSource } from 'ipfs-utils/src/files/url-source.js'
export const globSource: typeof globSourceImport
export type EndpointConfig = import('./types').EndpointConfig
export type Options = import('./types').Options
export type BlockCodec = import('multiformats/codecs/interface').BlockCodec<any, any>
export type MultihashHasher = import('multiformats/hashes/interface').MultihashHasher
export type MultibaseCodec = import('multiformats/bases/interface').MultibaseCodec<any>
export type IPFSHTTPClient = import('./types').IPFSHTTPClient
import globSourceImport from 'ipfs-utils/src/files/glob-source.js'
//# sourceMappingURL=index.d.ts.map
