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

export class Config {
  static get shared(): Config {
    if (!this._shared) {
      throw new Error('Config are not initialized')
    }
    return this._shared
  }
  static init(options: Config) {
    this._shared = new Config(options)
  }
  private static _shared: Config

  private constructor(options: Config) {
    this.port = options.port
    this.ipfs = options.ipfs
  }

  readonly port: string

  readonly ipfs: {
    repo: string
    api: string
    gateway: string
    swarm: string[]
  }
}
