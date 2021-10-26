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

import { atom, DefaultValue, selector, useRecoilValue } from 'recoil'
import { Account } from '../../../core/src'
import Storage from '../Storage'

export type AccountState = Account

const accountState = atom<AccountState | null>({
  key: 'accountState',
  default: null,
  dangerouslyAllowMutability: true,
})

export function useAccountOrNull(): Account | null {
  return useRecoilValue(accountState)
}

export const accountSelector = selector<AccountState>({
  key: 'accountSelector',
  get: ({ get }) => {
    const account = get(accountState)
    if (!account) {
      throw unauthorizedError('Unauthorized')
    }
    return account
  },
  set: ({ get, set }, value) => {
    if (value instanceof DefaultValue) {
      Storage.account = null
    } else {
      const { name, password } = value
      Storage.account = { name, password }
    }

    const old = get(accountState)

    if (old !== value) {
      old?.stop()
    }

    set(accountState, value)
  },
  dangerouslyAllowMutability: true,
})

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
