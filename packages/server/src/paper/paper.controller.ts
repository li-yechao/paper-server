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
import { Paper } from './paper.schema'
import { PaperService, publicKeyId } from './paper.service'

const TIMESTAMP_EXPIRES_IN = 30

@Controller('/:uid/papers')
export class PaperController {
  constructor(private readonly paperService: PaperService) {}

  @Get()
  async list(@Param('uid') uid: string): Promise<Paper[]> {
    return this.paperService.find({ uid })
  }

  @Get(':pid')
  async detail(@Param('uid') uid: string, @Param('pid') pid: string): Promise<Paper> {
    return this.paperService.findOne({ uid, pid })
  }

  @Post(':pid')
  async create(
    @Headers('pubkey') key: string,
    @Param('uid') uid: string,
    @Param('pid') pid: string,
    @Query('cid') cid: string,
    @Query('timestamp') timestamp: string,
    @Query('sig') sig: string
  ): Promise<Paper> {
    this.checkTimestamp(timestamp)

    const publicKey = crypto.keys.unmarshalPublicKey(Buffer.from(key, 'base64'))

    this.verifySignature(publicKey, uid, `cid=${cid}&pid=${pid}&timestamp=${timestamp}`, sig)

    return this.paperService.create({ uid, pid, cid })
  }

  @Delete(':pid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Headers('pubkey') key: string,
    @Param('uid') uid: string,
    @Param('pid') pid: string,
    @Query('timestamp') timestamp: string,
    @Query('sig') sig: string
  ): Promise<void> {
    this.checkTimestamp(timestamp)

    const publicKey = crypto.keys.unmarshalPublicKey(Buffer.from(key, 'base64'))

    this.verifySignature(publicKey, uid, `pid=${pid}&timestamp=${timestamp}`, sig)

    await this.paperService.delete({ uid, pid })
  }

  private checkTimestamp(timestamp: string) {
    const now = Math.floor(Date.now() / 1000)
    const time = parseInt(timestamp)
    if (Math.abs(now - time) > TIMESTAMP_EXPIRES_IN) {
      throw new Error(`Invalid timestamp`)
    }
  }

  private async verifySignature(
    publicKey: ReturnType<typeof crypto.keys.unmarshalPublicKey>,
    uid: string,
    data: string,
    sig: string
  ) {
    if (uid !== (await publicKeyId(publicKey))) {
      throw new HttpException('Invalid public key', HttpStatus.BAD_REQUEST)
    }

    if (!(await publicKey.verify(Buffer.from(data), Buffer.from(sig, 'base64')))) {
      throw new HttpException('Invalid signature', HttpStatus.BAD_REQUEST)
    }
  }
}
