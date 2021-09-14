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

import { Controller, Get, Post, Query } from '@nestjs/common'
import { AccountService } from './account.service'

@Controller('account')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Post('publish')
  async publish(@Query('cid') cid: string, @Query('password') password: string) {
    await this.accountService.publish(cid, password)
    return {}
  }

  @Get('resolve')
  async resolve(@Query('name') name: string) {
    const cid = await this.accountService.resolve(name)
    return { name, cid }
  }
}
