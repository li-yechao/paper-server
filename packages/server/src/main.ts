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

import { NestFactory } from '@nestjs/core'
import { program } from 'commander'
import { AppModule } from './app.module'
import { Config } from './config'

program
  .command('serve', { isDefault: true })
  .description('Start server')
  .option('--cors', 'Enable cors', false)
  .option('-p, --port <port>', 'Listening port')
  .action(async ({ cors, port }: { cors?: boolean; port?: string }) => {
    if (typeof cors === 'boolean') process.env['cors'] = cors.toString()
    if (port) process.env['port'] = port

    const app = await NestFactory.create(AppModule)

    if (app.get(Config).cors) {
      app.enableCors()
    }

    await app.listen(app.get(Config).port)
  })

program.parse(process.argv)
