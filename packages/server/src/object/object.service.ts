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
import { InjectModel } from '@nestjs/mongoose'
import { crypto } from 'ipfs-core'
import { create as createIpfsHttpClient, IPFSHTTPClient } from 'ipfs-http-client'
import { Model } from 'mongoose'
import { identity } from 'multiformats/hashes/identity'
import { toString as uint8arraysToString } from 'uint8arrays'
import { Config } from '../config'
import { Object_ } from './object.schema'

@Injectable()
export class ObjectService {
  constructor(
    config: Config,
    @InjectModel(Object_.name) private readonly objectModel: Model<Object_>
  ) {
    this.ipfsClient = createIpfsHttpClient({ url: config.ipfs.api })
  }

  private ipfsClient: IPFSHTTPClient

  async find({ uid }: { uid: string }): Promise<Object_[]> {
    return this.objectModel.find({ uid, deletedAt: null }).sort({ _id: -1 })
  }

  async findOne({ uid, oid }: { uid: string; oid: string }): Promise<Object_> {
    const object = await this.objectModel.findOne({ uid, oid, deletedAt: null })
    if (!object) {
      throw new Error(`Object ${oid} not found`)
    }
    return object
  }

  async create({ uid, oid, cid }: { oid: string; uid: string; cid: string }): Promise<Object_> {
    await this.ipfsClient.pin.add(cid, { recursive: true })
    return this.objectModel.create({ createdAt: Date.now(), oid, uid, cid })
  }

  async update({ uid, oid, cid }: { oid: string; uid: string; cid: string }): Promise<Object_> {
    await this.ipfsClient.pin.add(cid, { recursive: true })
    const object = await this.objectModel.findOneAndUpdate(
      { oid, deletedAt: null },
      { $set: { updatedAt: Date.now(), uid, cid } },
      { new: true }
    )
    if (!object) {
      throw new Error(`Object ${oid} not found`)
    }
    return object
  }

  async delete({ uid, oid }: { uid: string; oid: string }): Promise<Object_> {
    const object = await this.objectModel.findOneAndUpdate(
      { uid, oid, deletedAt: null },
      { $set: { deletedAt: Date.now() } },
      { new: true }
    )
    if (!object) {
      throw new Error(`Object ${oid} not found`)
    }
    return object
  }
}

export async function publicKeyId(
  publicKey: ReturnType<typeof crypto.keys.unmarshalPublicKey>
): Promise<string> {
  if (publicKey instanceof crypto.keys.supportedKeys.rsa.RsaPublicKey) {
    return uint8arraysToString(await publicKey.hash(), 'base58btc')
  } else if (publicKey instanceof crypto.keys.supportedKeys.ed25519.Ed25519PublicKey) {
    return uint8arraysToString(identity.digest(publicKey.bytes).bytes, 'base58btc')
  } else if (publicKey instanceof crypto.keys.supportedKeys.secp256k1.Secp256k1PublicKey) {
    return uint8arraysToString(await publicKey.hash(), 'base58btc')
  }
  throw new Error(`Unsupported public key`)
}
