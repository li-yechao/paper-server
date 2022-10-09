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

import { Injectable } from '@nestjs/common'
import { create } from 'ipfs-http-client'
import { Config } from '../config'

@Injectable()
export class IpfsService {
  constructor(config: Config) {
    this.ipfsClient = create({ url: config.ipfs.api })
  }

  private ipfsClient: ReturnType<typeof create>

  add: typeof this.ipfsClient.add = (...args) => this.ipfsClient.add(...args)

  cat: typeof this.ipfsClient.cat = (...args) => this.ipfsClient.cat(...args)
}
