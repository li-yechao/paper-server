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
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import auth from '../../apollo/auth'
import { useSignIn } from '../../state/account'

export default function GithubAuthView() {
  const code = useSearchParams()[0].get('code')
  const signIn = useSignIn()
  const navigate = useNavigate()
  const [error, setError] = useState<Error>()

  if (!code) {
    throw new Error('Missing required github auth code')
  }

  if (error) {
    throw error
  }

  useEffect(() => {
    ;(async () => {
      try {
        const token = await auth({ type: 'github', input: { code } })
        signIn(token)
        navigate('/')
      } catch (error) {
        setError(error)
      }
    })()
  }, [])

  return <_Indicator>Authorizing...</_Indicator>
}

const _Indicator = styled.div`
  margin-top: 30vh;
  text-align: center;
  color: #666;
`
