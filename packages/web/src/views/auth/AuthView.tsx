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

import { useEffect } from 'react'
import { GITHUB_CLIENT_ID, GITHUB_REDIRECT_URL } from '../../constants'

export default function AuthView() {
  useEffect(() => {
    const url = new URL('https://github.com/login/oauth/authorize')
    url.searchParams.set('client_id', GITHUB_CLIENT_ID)
    url.searchParams.set('redirect_uri', GITHUB_REDIRECT_URL)
    url.searchParams.set('scope', 'user')
    url.searchParams.set('state', Date.now().toString())
    window.location.href = url.toString()
  }, [])

  return null
}
