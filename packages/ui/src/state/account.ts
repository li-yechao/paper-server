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

import { atom, selector } from 'recoil'
import { Account } from '../../../core/src'
import { accountOptions } from '../constants'
import Storage from '../Storage'

export type AccountState = Account

const accountState = atom<AccountState | null>({
  key: 'accountState',
  default: (() => {
    const account = Storage.account
    if (account) {
      const { name, password } = account
      return Account.create(accountOptions, { name, password })
    }

    return null
  })(),
  dangerouslyAllowMutability: true,
})

export const accountSelector = selector<AccountState | null>({
  key: 'accountSelector',
  get: ({ get }) => get(accountState),
  set: ({ get, set }, value) => {
    set(accountState, value)
    const account = get(accountState)
    if (account) {
      const { name, password } = account
      Storage.account = { name, password }
    } else {
      Storage.account = null
    }
  },
  dangerouslyAllowMutability: true,
})
