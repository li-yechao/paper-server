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

import { keys } from 'libp2p-crypto'
import { Page } from 'puppeteer'

describe('App', () => {
  let page: Page

  beforeEach(async () => {
    const context = await browser.createIncognitoBrowserContext()
    page = await context.newPage()
    await page.goto('http://localhost:4444', { waitUntil: 'networkidle0' })
  })

  it('sign in by private key', async () => {
    const key = await keys.generateKeyPair('Ed25519')
    const keyText = Buffer.from(key.bytes).toString('base64')

    await expect(page).toFill('[data-testid="input-privatekey"]', keyText)
    await expect(page).toClick('[data-testid="button-submit"]')
    await new Promise(resolve => setTimeout(resolve, 200))
    await expect(page.url()).toMatch(`/${await key.id()}`)
  })

  it('sign in by new key', async () => {
    await expect(page).toClick('[data-testid="button-newkey"]')
    const keyText = await page.$eval(
      '[data-testid="input-privatekey"]',
      el => (el as HTMLTextAreaElement).value
    )
    const key = await keys.unmarshalPrivateKey(Buffer.from(keyText, 'base64'))
    await expect(page).toClick('[data-testid="button-submit"]')
    await new Promise(resolve => setTimeout(resolve, 200))
    await expect(page.url()).toMatch(`/${await key.id()}`)
  })
})
