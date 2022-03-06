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

import {
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common'
import { crypto } from 'ipfs-core'
import { Object_ } from './object.schema'
import { ObjectService, publicKeyId } from './object.service'

const TIMESTAMP_EXPIRES_IN = 30

@Controller('/:uid/objects')
export class ObjectController {
  constructor(private readonly objectService: ObjectService) {}

  @Get()
  async list(@Param('uid') uid: string): Promise<Object_[]> {
    return this.objectService.find({ uid })
  }

  @Get(':oid')
  async detail(@Param('uid') uid: string, @Param('oid') oid: string): Promise<Object_> {
    return this.objectService.findOne({ uid, oid })
  }

  @Post(':oid')
  async create(
    @Headers('pubkey') key: string,
    @Param('uid') uid: string,
    @Param('oid') oid: string,
    @Query('cid') cid: string,
    @Query('timestamp') timestamp: string,
    @Query('sig') sig: string
  ): Promise<Object_> {
    this.checkTimestamp(timestamp)

    const publicKey = crypto.keys.unmarshalPublicKey(Buffer.from(key, 'base64'))

    await this.verifySignature(publicKey, uid, { cid, oid, timestamp }, sig)

    return this.objectService.create({ uid, oid: oid, cid })
  }

  @Delete(':oid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Headers('pubkey') key: string,
    @Param('uid') uid: string,
    @Param('oid') oid: string,
    @Query('timestamp') timestamp: string,
    @Query('sig') sig: string
  ): Promise<void> {
    this.checkTimestamp(timestamp)

    const publicKey = crypto.keys.unmarshalPublicKey(Buffer.from(key, 'base64'))

    await this.verifySignature(publicKey, uid, { oid, timestamp }, sig)

    await this.objectService.delete({ uid, oid: oid })
  }

  private checkTimestamp(timestamp: string) {
    const now = Math.floor(Date.now() / 1000)
    const time = parseInt(timestamp)
    if (!Number.isSafeInteger(time) || time <= 0 || Math.abs(now - time) > TIMESTAMP_EXPIRES_IN) {
      throw new Error(`Invalid timestamp`)
    }
  }

  private async verifySignature(
    publicKey: ReturnType<typeof crypto.keys.unmarshalPublicKey>,
    uid: string,
    data: Record<string, string>,
    sig: string
  ) {
    if (uid !== (await publicKeyId(publicKey))) {
      throw new HttpException('Invalid public key', HttpStatus.BAD_REQUEST)
    }

    const qs = new URLSearchParams(data)
    qs.sort()

    if (!(await publicKey.verify(Buffer.from(qs.toString()), Buffer.from(sig, 'base64')))) {
      throw new HttpException('Invalid signature', HttpStatus.BAD_REQUEST)
    }
  }
}
