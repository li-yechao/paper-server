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
import { Button, Form, Input, InputRef, message } from 'antd'
import { keys, PrivateKey } from 'libp2p-crypto'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fromString } from 'uint8arrays/from-string'
import { toString } from 'uint8arrays/to-string'
import { useSignIn } from '../../state/account'

export interface AuthViewProps {
  onSuccess?: () => void
}

export default function AuthView(props: AuthViewProps) {
  const navigate = useNavigate()
  const signIn = useSignIn()
  const passwordRef = useRef<InputRef>(null)
  const [key, setKey] = useState<PrivateKey>()
  const [value, setValue] = useState('')
  const [id, setId] = useState('')

  useEffect(() => {
    if (key) {
      setValue(toString(new Uint8Array(key.bytes), 'base64'))
    }
    !(async () => {
      const id = await key?.id()
      setId(id || '')
    })()
  }, [key])

  useEffect(() => {
    !(async () => {
      try {
        const key = await keys.unmarshalPrivateKey(fromString(value, 'base64'))
        setId(await key.id())
      } catch {
        setId('')
      }
    })()
  }, [value])

  const handleNewAccount = useCallback(async () => {
    setKey(await keys.generateKeyPair('Ed25519'))
    passwordRef.current?.focus()
  }, [])

  const handleSignIn = async () => {
    try {
      const key = await keys.unmarshalPrivateKey(fromString(value, 'base64'))
      await signIn(key)
      props.onSuccess?.()
      navigate('/', { replace: true })
    } catch (error) {
      message.error(error.message)
    }
  }

  return (
    <_Card>
      <Form>
        <Form.Item>
          <Input id="username" autoComplete="username" type="text" value={id} readOnly disabled />
        </Form.Item>

        <Form.Item>
          <Input.Password
            ref={passwordRef}
            data-testid="input-privatekey"
            id="current-password"
            autoComplete="current-password"
            placeholder="Input or generate your private key"
            type="password"
            value={value}
            onChange={e => setValue(e.target.value)}
          />
        </Form.Item>

        <_Actions>
          <Button data-testid="button-newkey" type="link" onClick={handleNewAccount}>
            Generate New Account
          </Button>

          <Button
            data-testid="button-submit"
            htmlType="submit"
            type="primary"
            onClick={handleSignIn}
          >
            Sign In
          </Button>
        </_Actions>
      </Form>
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

const _Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`
