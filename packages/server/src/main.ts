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
import { json } from 'express'
import { AppModule } from './app.module'
import { Config } from './config'

program
  .command('serve', { isDefault: true })
  .description('Start server')
  .option('--cors', 'Enable cors')
  .option('-p, --port <port>', 'Listening port')
  .option('--mongo-uri <uri>', 'MongoDB uri')
  .option('--ipfs-api <api>', 'Ipfs api url')
  .option('--ipfs-uri <uri>', 'Ipfs url')
  .option('--body-json-limit <limit>', 'Json body limit, like `20mb`')
  .action(
    async ({
      cors,
      port,
      mongoUri,
      ipfsApi,
      ipfsUri,
      bodyJsonLimit,
    }: {
      cors?: boolean
      port?: string
      mongoUri?: string
      ipfsApi?: string
      ipfsUri?: string
      bodyJsonLimit?: string
    }) => {
      if (typeof cors === 'boolean') process.env['cors'] = cors.toString()
      if (port) process.env['port'] = port
      if (mongoUri) process.env['mongo.uri'] = mongoUri
      if (ipfsApi) process.env['ipfs.api'] = ipfsApi
      if (ipfsUri) process.env['ipfs.uri'] = ipfsUri
      if (bodyJsonLimit) process.env['body.json.limit'] = bodyJsonLimit

      const app = await NestFactory.create(AppModule)

      const config = app.get(Config)

      if (config.body.json.limit) {
        app.use(json({ limit: config.body.json.limit }))
      }

      if (app.get(Config).cors) {
        app.enableCors()
      }

      return app.listen(app.get(Config).port)
    }
  )

program.parse(process.argv)
