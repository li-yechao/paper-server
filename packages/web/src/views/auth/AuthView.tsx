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

import styled from '@emotion/styled'
import Github from '../../components/Icons/Github'
import { GITHUB_CLIENT_ID, GITHUB_REDIRECT_URL } from '../../constants'

export default function AuthView() {
  const toGithubAuth = () => {
    const url = new URL('https://github.com/login/oauth/authorize')
    url.searchParams.set('client_id', GITHUB_CLIENT_ID)
    url.searchParams.set('redirect_uri', GITHUB_REDIRECT_URL)
    url.searchParams.set('scope', 'user')
    url.searchParams.set('state', Date.now().toString())
    console.log(url.toString())
    window.location.href = url.toString()
  }

  return (
    <_Card>
      <_Thirds>
        <button onClick={toGithubAuth} title="Github">
          <Github />
        </button>
      </_Thirds>
    </_Card>
  )
}

const _Card = styled.div`
  max-width: 400px;
  margin: 64px auto;
  padding: 32px;
  border: 1px solid #efefef;
  border-radius: 8px;
`

const _Thirds = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  > button {
    border: none;
    background: transparent;
    font-size: 40px;
    line-height: 1;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 50%;

    &:hover {
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.05);
      background: rgba(0, 0, 0, 0.05);
    }
  }
`
