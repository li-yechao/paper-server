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

import { Account } from '@paper/core'
import { useSnackbar } from 'notistack'
import { useCallback } from 'react'
import { atom, DefaultValue, selector, useRecoilValue, useSetRecoilState } from 'recoil'
import Storage from '../Storage'

export type AccountState = { account: Account; sync?: { syncing: boolean; error?: string } }

const accountState = atom<AccountState | null>({
  key: 'accountState',
  default: null,
  dangerouslyAllowMutability: true,
})

export function useAccountOrNull(): AccountState | null {
  return useRecoilValue(accountState)
}

const accountSelector = selector<AccountState>({
  key: 'accountSelector',
  get: ({ get }) => {
    const account = get(accountState)
    if (!account) {
      throw unauthorizedError('Unauthorized')
    }
    return account
  },
  dangerouslyAllowMutability: true,
})

export function useAccount() {
  return useRecoilValue(accountSelector)
}

export function useSetAccount() {
  const setAccount = useSetRecoilState(accountState)
  const snackbar = useSnackbar()

  return useCallback((account?: Account) => {
    if (!account) {
      Storage.account = null
    } else {
      const { id, password } = account.user
      Storage.account = { id, password }
    }

    setAccount(old => {
      if (!old || old.account !== account) {
        old?.account.stop()

        account?.on('sync', e => {
          setAccount(v => {
            if (!v || v instanceof DefaultValue) {
              return v
            }
            return { ...v, sync: e }
          })
        })
        account?.on('error', e => {
          snackbar.enqueueSnackbar(e.message, { variant: 'error' })
          console.error(e)
        })
      }

      return account ? { account } : null
    })
  }, [])
}

export const ERR_UNAUTHORIZED = 'ERR_UNAUTHORIZED'
export interface UnauthorizedError extends Error {
  code: typeof ERR_UNAUTHORIZED
}

function unauthorizedError(message?: string): UnauthorizedError {
  const e: UnauthorizedError = new Error(message) as any
  e.code = ERR_UNAUTHORIZED
  return e
}

export function isUnauthorizedError(e: any): e is UnauthorizedError {
  return e.code === ERR_UNAUTHORIZED
}
