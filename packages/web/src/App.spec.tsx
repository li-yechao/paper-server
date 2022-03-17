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

import { act, render } from '@testing-library/react'
import { keys } from 'libp2p-crypto'
import { Suspense } from 'react'
import { RecoilRoot } from 'recoil'

describe('AuthGuard', () => {
  let storage: { getPrivateKey: jest.Mock }

  beforeEach(() => {
    storage = { getPrivateKey: jest.fn() }

    jest.mock('./Storage', () => storage)
  })

  it('should be signed', async () => {
    storage.getPrivateKey.mockReturnValue(keys.generateKeyPair('Ed25519'))

    const { AuthGuard } = await import('./App')

    const result = render(
      <RecoilRoot>
        <Suspense fallback={<div />}>
          <AuthGuard>auth success</AuthGuard>
        </Suspense>
      </RecoilRoot>
    )
    await act(() => new Promise(resolve => setTimeout(resolve, 100)))
    expect(result.baseElement).toHaveTextContent('auth success')
  })
})
