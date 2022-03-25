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

import { act, fireEvent, render, RenderResult, waitFor } from '@testing-library/react'
import { keys } from 'libp2p-crypto'
import { RecoilRoot } from 'recoil'
import { toString } from 'uint8arrays/to-string'
import AuthView from '../AuthView'

describe('AuthView', () => {
  const onSuccess = jest.fn()
  let result: RenderResult,
    inputPrivKey: HTMLElement,
    buttonNewKey: HTMLElement,
    buttonSubmit: HTMLElement

  beforeEach(() => {
    result = render(
      <RecoilRoot>
        <AuthView onSuccess={onSuccess} />
      </RecoilRoot>
    )
    inputPrivKey = result.getByTestId('input-privatekey')
    buttonNewKey = result.getByTestId('button-newkey')
    buttonSubmit = result.getByTestId('button-submit')
  })

  it('auth by key', async () => {
    const key = await keys.generateKeyPair('Ed25519')
    const pem = toString(new Uint8Array(key.bytes), 'base64')

    expect(inputPrivKey).not.toHaveValue()
    await waitFor(() => fireEvent.input(inputPrivKey, { target: { value: pem } }))
    expect(inputPrivKey).toHaveValue()

    await waitFor(() => fireEvent.click(buttonSubmit))
    await act(() => new Promise(resolve => setTimeout(resolve, 200)))
    expect(onSuccess).toBeCalled()
  })

  it('new account', async () => {
    expect(inputPrivKey).not.toHaveValue()
    await waitFor(() => fireEvent.click(buttonNewKey))
    expect(inputPrivKey).toHaveValue()

    await waitFor(() => fireEvent.click(buttonSubmit))
    await act(() => new Promise(resolve => setTimeout(resolve, 200)))
    expect(onSuccess).toBeCalled()
  })
})
