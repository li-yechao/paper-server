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
import { Paper } from './paper.schema'

@Injectable()
export class PaperService {
  constructor(config: Config, @InjectModel(Paper.name) private readonly paperModel: Model<Paper>) {
    this.ipfsClient = createIpfsHttpClient({ url: config.ipfs.httpClient.uri })
  }

  private ipfsClient: IPFSHTTPClient

  async find({ uid }: { uid: string }): Promise<Paper[]> {
    return this.paperModel.find({ uid, deletedAt: null }).sort({ _id: -1 })
  }

  async findOne({ uid, pid }: { uid: string; pid: string }): Promise<Paper> {
    const paper = await this.paperModel.findOne({ uid, pid, deletedAt: null })
    if (!paper) {
      throw new Error(`Paper ${pid} not found`)
    }
    return paper
  }

  async create({ uid, pid, cid }: { pid: string; uid: string; cid: string }): Promise<Paper> {
    await this.ipfsClient.pin.add(cid, { recursive: true })
    return this.paperModel.create({ createdAt: Date.now(), pid, uid, cid })
  }

  async update({ uid, pid, cid }: { pid: string; uid: string; cid: string }): Promise<Paper> {
    await this.ipfsClient.pin.add(cid, { recursive: true })
    const paper = await this.paperModel.findOneAndUpdate(
      { pid, deletedAt: null },
      { $set: { updatedAt: Date.now(), uid, cid } },
      { new: true }
    )
    if (!paper) {
      throw new Error(`Paper ${pid} not found`)
    }
    return paper
  }

  async delete({ uid, pid }: { uid: string; pid: string }): Promise<Paper> {
    const paper = await this.paperModel.findOneAndUpdate(
      { uid, pid, deletedAt: null },
      { $set: { deletedAt: Date.now() } },
      { new: true }
    )
    if (!paper) {
      throw new Error(`Paper ${pid} not found`)
    }
    return paper
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
