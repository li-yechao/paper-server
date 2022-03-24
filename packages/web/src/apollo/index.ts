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

import { ApolloClient, ApolloLink, InMemoryCache, Observable, split } from '@apollo/client'
import { BatchHttpLink } from '@apollo/client/link/batch-http'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition, relayStylePagination } from '@apollo/client/utilities'
import { PrivateKey } from 'libp2p-crypto'
import { createClient as createGraphqlWsClient } from 'graphql-ws'
import { toString } from 'uint8arrays/to-string'
import { GRAPHQL_URI } from '../constants'
import Storage from '../Storage'

export function createClient() {
  const getAuthParams = async (key: PrivateKey) => {
    const publickey = toString(key.public.bytes, 'base64')
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const signature = toString(
      await key.sign(
        new TextEncoder().encode(
          new URLSearchParams({
            timestamp,
          }).toString()
        )
      ),
      'base64'
    )

    return {
      publickey,
      timestamp,
      signature,
    }
  }

  const authLink = new ApolloLink((operation, forward) => {
    return new Observable(observer => {
      ;(async () => {
        try {
          const key = await Storage.getPrivateKey()
          if (key) {
            const params = await getAuthParams(key)
            operation.setContext(({ headers = {} }) => ({ headers: { ...headers, ...params } }))
          }

          forward(operation).subscribe(observer)
        } catch (error) {
          observer.error(error)
        }
      })()
    })
  })

  const httpLink = new BatchHttpLink({
    uri: GRAPHQL_URI,
    batchMax: 5,
    batchInterval: 100,
  })

  const webSocketLink = new GraphQLWsLink(
    createGraphqlWsClient({
      url: GRAPHQL_URI.replace(/^https/, 'wss').replace(/^http/, 'ws'),
      connectionParams: async () => {
        const key = await Storage.getPrivateKey()
        if (key) {
          return getAuthParams(key)
        }
        return {}
      },
    })
  )

  const link = split(
    ({ query }) => {
      const definition = getMainDefinition(query)
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
    },
    webSocketLink,
    authLink.concat(httpLink)
  )

  const client = new ApolloClient({
    link,
    cache: new InMemoryCache({
      typePolicies: {
        User: {
          fields: {
            objects: relayStylePagination(),
          },
        },
      },
    }),
  })
  return client
}
