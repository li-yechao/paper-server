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

describe('Editor', () => {
  beforeEach(async () => {
    await page.goto('http://localhost:4444', { waitUntil: 'networkidle0' })
  })

  test('Editor', async () => {
    await expect(page).toMatchElement('[data-testid="prosemirror-editor"]')
    await expect(
      page.$eval('[data-testid="prosemirror-editor"]', el => el.getAttribute('contenteditable'))
    ).resolves.toEqual('true')

    await expect(page).toFill('[data-testid="prosemirror-editor"]', 'HELLO WORLD')
    await expect(page).toMatch('HELLO WORLD')
  })
})
