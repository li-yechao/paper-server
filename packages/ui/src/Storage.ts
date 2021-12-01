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

export interface Account {
  id: string
  password: string
}

export default class Storage {
  private static ACCOUNT_KEY = 'PAPER_ACCOUNT'
  static get account(): Account | null {
    try {
      const v = JSON.parse(localStorage.getItem(this.ACCOUNT_KEY) || '{}')
      if (typeof v.id === 'string' && typeof v.password === 'string') {
        return { id: v.id, password: v.password }
      }
    } catch {}
    return null
  }
  static set account(value: Account | null) {
    if (value) {
      localStorage.setItem(
        this.ACCOUNT_KEY,
        JSON.stringify({ id: value.id, password: value.password })
      )
    } else {
      localStorage.removeItem(this.ACCOUNT_KEY)
    }
  }
}
