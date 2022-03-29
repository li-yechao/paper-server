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

import { useApolloClient } from '@apollo/client'
import { PrivateKey } from 'libp2p-crypto'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { atom, useRecoilValue, useSetRecoilState } from 'recoil'
import Storage from '../Storage'

export interface AccountState {
  privateKey: PrivateKey
}

const accountState = atom<AccountState | null>({
  key: 'account',
  default: (async () => {
    const privateKey = await Storage.getPrivateKey()
    return privateKey ? { privateKey } : null
  })(),
})

export const useSignOut = () => {
  const client = useApolloClient()
  const navigate = useNavigate()
  const setAccountState = useSetRecoilState(accountState)

  return useCallback(async () => {
    navigate('/')
    await client.clearStore()
    return setAccountState(() => {
      Storage.setPrivateKey(null)
      return null
    })
  }, [])
}

export const useSignIn = () => {
  const setAccountState = useSetRecoilState(accountState)

  return useCallback((privateKey: PrivateKey) => {
    return setAccountState(() => {
      Storage.setPrivateKey(privateKey)
      return { privateKey }
    })
  }, [])
}

export const useAccount = () => {
  return useRecoilValue(accountState)
}
