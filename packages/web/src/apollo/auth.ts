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

import { ApolloClient, gql, HttpLink, InMemoryCache } from '@apollo/client'
import { GRAPHQL_URI } from '../constants'
import { Token } from '../Storage'

export default async function auth({
  type,
  input,
}:
  | { type: 'refreshToken'; input: { refreshToken: string } }
  | { type: 'github'; input: { code: string } }): Promise<Token> {
  const client = createClient()

  const res = await client.mutate<
    { auth: { accessToken: string; refreshToken: string; expiresIn: number; tokenType: string } },
    { type: string; input: any }
  >({
    mutation: gql`
      mutation Auth($type: String!, $input: JSONObject!) {
        auth(type: $type, input: $input) {
          accessToken
          refreshToken
          expiresIn
          tokenType
        }
      }
    `,
    variables: { type, input },
  })

  if (res.errors?.length) {
    throw res.errors[0]
  }

  if (!res.data) {
    throw new Error(`Invalid response data of refreshToken`)
  }

  return res.data.auth
}

function createClient() {
  return new ApolloClient({
    link: new HttpLink({
      uri: GRAPHQL_URI,
    }),
    cache: new InMemoryCache(),
  })
}
