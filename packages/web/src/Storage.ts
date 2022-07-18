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

export interface Token {
  accessToken: string
  refreshToken: string
}

export default class Storage {
  private static TOKEN_KEY = 'PAPER_ACCESS_TOKEN'
  private static _token: Token | null = null
  static get token(): Token | null {
    if (!this._token) {
      try {
        const v = JSON.parse(localStorage.getItem(this.TOKEN_KEY) || '{}')
        if (typeof v.accessToken === 'string' && typeof v.refreshToken === 'string') {
          this._token = { accessToken: v.accessToken, refreshToken: v.refreshToken }
        }
      } catch {}
    }
    return this._token
  }
  static set token(token: Token | null) {
    this._token = token
    if (token) {
      localStorage.setItem(this.TOKEN_KEY, JSON.stringify(token))
    } else {
      localStorage.removeItem(this.TOKEN_KEY)
    }
  }

  private static ASIDE_COLLAPSED = 'PAPER_ASIDE_COLLAPSED'
  private static _asideCollapsed: boolean | null = null
  static get asideCollapsed(): boolean | null {
    if (this._asideCollapsed === null) {
      try {
        const v = JSON.parse(localStorage.getItem(this.ASIDE_COLLAPSED) || '')
        if (typeof v === 'boolean') {
          this._asideCollapsed = v
        }
      } catch {}
    }
    return this._asideCollapsed
  }
  static set asideCollapsed(v: boolean | null) {
    this._asideCollapsed = v
    if (typeof v === 'boolean') {
      localStorage.setItem(this.ASIDE_COLLAPSED, JSON.stringify(v))
    } else {
      localStorage.removeItem(this.ASIDE_COLLAPSED)
    }
  }
}
