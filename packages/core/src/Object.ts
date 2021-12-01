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

import * as IPFSFiles from 'ipfs-core-types/src/files'
import Account from './Account'
import { ObjectInfo } from './Channel'
import { ObjectId } from './ObjectId'

export default class Object {
  constructor(private account: Account, id: string | ObjectId) {
    this.objectId = ObjectId.parse(id)
    this.id = ObjectId.toString(this.objectId)
    this.files = new ObjectFiles(this.account.user.id, this.id)
  }

  readonly files: ObjectFiles

  readonly id: string

  private readonly objectId: ObjectId

  get createdAt() {
    return this.objectId.createdAt
  }

  get updatedAt() {
    return Account.client.call('object_updatedAt', {
      userId: this.account.user.id,
      objectId: this.id,
    })
  }

  get info(): Promise<ObjectInfo> {
    return Account.client.call('object_info', {
      userId: this.account.user.id,
      objectId: this.id,
    })
  }

  async setInfo(info: Partial<ObjectInfo> = {}): Promise<ObjectInfo> {
    return Account.client.call('object_setInfo', {
      userId: this.account.user.id,
      objectId: this.id,
      info,
    })
  }

  async read(path: string, options?: IPFSFiles.ReadOptions): Promise<ArrayBuffer> {
    return Account.client.call('object_read', {
      userId: this.account.user.id,
      objectId: this.id,
      path,
      options,
    })
  }

  async write(path: string, content: string | ArrayBuffer, options?: IPFSFiles.WriteOptions) {
    return Account.client.call('object_write', {
      userId: this.account.user.id,
      objectId: this.id,
      path,
      content,
      options,
    })
  }
}

class ObjectFiles {
  constructor(private userId: string, private objectId: string) {}

  cp(from: string | string[], to: string, options?: IPFSFiles.CpOptions) {
    return Account.client.call('object_files_cp', {
      userId: this.userId,
      objectId: this.objectId,
      from,
      to,
      options,
    })
  }

  mkdir(path: string, options?: IPFSFiles.MkdirOptions) {
    return Account.client.call('object_files_mkdir', {
      userId: this.userId,
      objectId: this.objectId,
      path,
      options,
    })
  }

  stat(path: string, options?: IPFSFiles.StatOptions) {
    return Account.client.call('object_files_stat', {
      userId: this.userId,
      objectId: this.objectId,
      path,
      options,
    })
  }

  touch(path: string, options?: IPFSFiles.TouchOptions) {
    return Account.client.call('object_files_touch', {
      userId: this.userId,
      objectId: this.objectId,
      path,
      options,
    })
  }

  rm(path: string | string[], options?: IPFSFiles.RmOptions) {
    return Account.client.call('object_files_rm', {
      userId: this.userId,
      objectId: this.objectId,
      path,
      options,
    })
  }

  mv(from: string | string[], to: string, options?: IPFSFiles.MvOptions) {
    return Account.client.call('object_files_mv', {
      userId: this.userId,
      objectId: this.objectId,
      from,
      to,
      options,
    })
  }

  ls(path: string) {
    return Account.client.call('object_files_ls', {
      userId: this.userId,
      objectId: this.objectId,
      path,
    })
  }
}
