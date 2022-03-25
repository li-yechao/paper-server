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
import Editor, {
  baseKeymap,
  Blockquote,
  Bold,
  BulletList,
  Code,
  Doc,
  dropCursor,
  gapCursor,
  Heading,
  Highlight,
  history,
  Italic,
  keymap,
  Link,
  Math,
  OrderedList,
  Paragraph,
  Plugins,
  redo,
  State,
  Strikethrough,
  Text,
  Underline,
  undo,
  undoInputRule,
  Value,
} from '.'

describe('Editor', () => {
  let state: State

  beforeEach(() => {
    state = new State({
      nodes: [
        new Doc(),
        new Text(),
        new Paragraph(),
        new Heading(),
        new Blockquote(),
        new OrderedList(),
        new BulletList(),
        new Math(),
      ],
      marks: [
        new Bold(),
        new Code(),
        new Highlight(),
        new Italic(),
        new Link(),
        new Strikethrough(),
        new Underline(),
      ],
      extensions: [
        new Plugins([
          keymap({
            'Mod-z': undo,
            'Shift-Mod-z': redo,
            'Mod-y': redo,
            Backspace: undoInputRule,
          }),
          keymap(baseKeymap),
          history(),
          gapCursor(),
          dropCursor({ color: 'currentColor' }),
        ]),
        new Value({
          defaultValue: {
            type: 'doc',
            content: [
              { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'HELLO' }] },
            ],
          },
        }),
      ],
    })
  })

  it('Editor', async () => {
    const result = render(<Editor state={state} />)
    await act(() => new Promise(resolve => setTimeout(resolve, 100)))
    const editor = result.getByTestId('prosemirror-editor')
    expect(editor).toBeInTheDocument()
    expect(editor).toHaveAttribute('contenteditable', 'true')
    expect(editor).toHaveTextContent('HELLO')
  })
})
