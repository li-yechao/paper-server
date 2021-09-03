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
import { AccountService } from './account/account.service'
import { AppModule } from './app.module'
import { Config } from './config'

program
  .command('serve')
  .description('Start server')
  .option('--cors', 'Enable cors', false)
  .requiredOption('-p, --port <port>', 'Listening port', '8080')
  .requiredOption('--ipfs-repo <ipfs repo path>', 'Ipfs repo path', './ipfs')
  .option('--ipfs-api <api>', 'Ipfs api address', '/ip4/127.0.0.1/tcp/5001')
  .option('--ipfs-gateway <gateway>', 'Ipfs gateway address', '/ip4/127.0.0.1/tcp/8081')
  .requiredOption('--ipfs-swarm <addrs...>', 'Ipfs swarm address', '/ip4/0.0.0.0/tcp/4001')
  .action(
    async ({
      cors,
      port,
      ipfsRepo,
      ipfsApi,
      ipfsGateway,
      ipfsSwarm,
    }: {
      cors: boolean
      port: string
      ipfsRepo: string
      ipfsApi: string
      ipfsGateway: string
      ipfsSwarm: string[]
    }) => {
      Config.init({
        port,
        ipfs: { repo: ipfsRepo, api: ipfsApi, gateway: ipfsGateway, swarm: ipfsSwarm },
      })

      await AccountService.startIpfs(Config.shared.ipfs)

      const app = await NestFactory.create(AppModule)

      if (cors) {
        app.enableCors()
      }

      await app.listen(port)
    }
  )

program.parse(process.argv)
