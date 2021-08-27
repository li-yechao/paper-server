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
  .option('-p, --port [port]', 'Listening port', '8080')
  .option('--cors', 'Enable cors', false)
  .requiredOption('--ipfs-path [ipfs root path]', 'Ipfs root path', './ipfs')
  .option('--ipfs-api-port [port]', 'Ipfs api port', '5001')
  .option('--ipfs-gateway-port [port]', 'Ipfs gateway port', '8081')
  .option('--ipfs-swarm-port [port]', 'Ipfs swarm port', '4001')
  .option('--ipfs-swarm-ws-port [port]', 'Ipfs swarm websocket port', '4002')
  .action(
    async ({
      port,
      cors,
      ipfsPath,
      ipfsApiPort,
      ipfsGatewayPort,
      ipfsSwarmPort,
      ipfsSwarmWsPort,
    }: { cors: boolean } & { [key: string]: string }) => {
      Config.init({ port, ipfsPath, ipfsApiPort, ipfsGatewayPort, ipfsSwarmPort, ipfsSwarmWsPort })

      await AccountService.startIpfs(Config.shared)

      const app = await NestFactory.create(AppModule)

      if (cors) {
        app.enableCors()
      }

      await app.listen(port)
    }
  )

program.parse(process.argv)
