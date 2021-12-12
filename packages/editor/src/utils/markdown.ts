// Copyright 2021 LiYechao
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

import { MarkdownSerializerState, MarkSerializerConfig } from 'prosemirror-markdown'
import { Fragment, Mark } from 'prosemirror-model'
import { ProsemirrorNode } from '../Editor/nodes/Node'

export const defaultMarkdownSerializer: {
  nodes: {
    [key: string]: (
      state: MarkdownSerializerState,
      node: ProsemirrorNode,
      parent: ProsemirrorNode,
      index: number
    ) => void
  }
  marks: { [key: string]: MarkSerializerConfig }
} = {
  nodes: {
    heading(state, node) {
      state.write(state.repeat('#', node.attrs.level) + ' ')
      state.renderInline(node)
      state.closeBlock(node)
    },
    blockquote(state, node) {
      state.wrapBlock('> ', undefined, node, () => state.renderContent(node))
    },
    paragraph(state, node) {
      state.renderInline(node)
      state.closeBlock(node)
    },
    code_block(state, node) {
      state.write('```' + (node.attrs.language || '') + '\n')
      state.text(node.textContent, false)
      state.ensureNewLine()
      state.write('```')
      state.closeBlock(node)
    },
    image_block(state, node) {
      state.write('![' + (node.textContent || '') + '](' + node.attrs.thumbnail + ')')
      state.closeBlock(node)
    },
    ordered_list(state, node) {
      state.renderList(node, '', i => `${i + 1}. `)
    },
    bullet_list(state, node) {
      state.renderList(node, '', () => '* ')
    },
    list_item(state, node) {
      state.renderContent(node)
    },
    todo_list(state, node) {
      state.renderList(node, '', () => '[] ')
    },
    todo_item(state, node) {
      state.renderContent(node)
    },
    text(state, node) {
      state.text(node.text ?? '')
    },
  },
  marks: {
    bold: { open: '**', close: '**', mixable: true, expelEnclosingWhitespace: true },
    italic: { open: '*', close: '*', mixable: true, expelEnclosingWhitespace: true },
    underline: { open: '__', close: '__', mixable: true, expelEnclosingWhitespace: true },
    strikethrough: { open: '~', close: '~', mixable: true, expelEnclosingWhitespace: true },
    highlight: { open: '==', close: '==', mixable: true, expelEnclosingWhitespace: true },
    code: {
      open(_state, _mark, parent, index) {
        return backticksFor(parent.child(index), -1)
      },
      close(_state, _mark, parent, index) {
        return backticksFor(parent.child(index - 1), 1)
      },
      escape: false,
    },
    link: {
      open(_state, mark, parent, index) {
        return isPlainURL(mark, parent, index, 1) ? '<' : '['
      },
      close(state, mark, parent, index) {
        const { href } = mark.attrs

        return isPlainURL(mark, parent, index, -1) ? '>' : `](${state.esc(href)})`
      },
    },
  },
}

function backticksFor(node: ProsemirrorNode, side: 1 | -1) {
  let ticks = /`+/g,
    m,
    len = 0
  if (node.isText) while ((m = ticks.exec(node.text ?? ''))) len = Math.max(len, m[0].length)
  let result = len > 0 && side > 0 ? ' `' : '`'
  for (let i = 0; i < len; i++) result += '`'
  if (len > 0 && side < 0) result += ' '
  return result
}

function isPlainURL(link: Mark, parent: Fragment, index: number, side: 1 | -1) {
  if (link.attrs.title || !/^\w+:/.test(link.attrs.href)) return false
  let content = parent.child(index + (side < 0 ? -1 : 0))
  if (
    !content.isText ||
    content.text != link.attrs.href ||
    content.marks[content.marks.length - 1] != link
  )
    return false
  if (index == (side < 0 ? 1 : parent.childCount - 1)) return true
  let next = parent.child(index + (side < 0 ? -2 : 1))
  return !link.isInSet(next.marks)
}
