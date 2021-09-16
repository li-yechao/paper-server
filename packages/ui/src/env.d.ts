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

interface ImportMetaEnv extends Readonly<Record<string, string | boolean>> {
  DEV: boolean
  PROD: boolean

  VITE_ACCOUNT_GATEWAY: string
  VITE_IPNS_GATEWAY: string
  VITE_LIBP2P_TRANSPORT_FILTER: 'all' | 'dnsWss' | 'dnsWsOrWss'
  VITE_SWARM: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
