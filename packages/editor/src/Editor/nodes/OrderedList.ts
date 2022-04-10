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

import { css } from '@emotion/css'
import { Keymap } from 'prosemirror-commands'
import { InputRule, wrappingInputRule } from 'prosemirror-inputrules'
import { NodeType } from 'prosemirror-model'
import { liftListItem, sinkListItem, splitListItem } from 'prosemirror-schema-list'
import { Node, NodeView, NodeViewCreator, StrictNodeSpec } from '../lib/Node'

export interface OrderedListAttrs {}

export default class OrderedList implements Node<OrderedListAttrs> {
  get name(): string {
    return 'ordered_list'
  }

  get schema(): StrictNodeSpec<OrderedListAttrs> {
    return {
      attrs: {},
      content: 'list_item+',
      group: 'block',
      parseDOM: [{ tag: 'ol' }],
      toDOM: () => ['ol', 0],
    }
  }

  inputRules({ type }: { type: NodeType }): InputRule[] {
    return [wrappingInputRule(/^(\d+)\.\s$/, type)]
  }

  childNodes = [LIST_ITEM]
}

interface ListItemAttrs {}

export class ListItem implements Node<ListItemAttrs> {
  readonly type = 'node'

  get name(): string {
    return 'list_item'
  }

  get schema(): StrictNodeSpec<ListItemAttrs> {
    return {
      attrs: {},
      content: 'paragraph block*',
      defining: true,
      draggable: true,
      parseDOM: [{ tag: 'li' }],
      toDOM: () => ['li', 0],
    }
  }

  keymap({ type }: { type: NodeType }): Keymap {
    return {
      Enter: splitListItem(type),
      'Mod-[': liftListItem(type),
      'Mod-]': sinkListItem(type),
    }
  }

  nodeView(): NodeViewCreator<ListItemAttrs> {
    return () => {
      return new (class extends NodeView<ListItemAttrs> {
        constructor() {
          super()

          this.dom.classList.add(css`
            position: relative;
          `)
          const zero = document.createElement('span')
          zero.innerText = '\u200b'
          zero.classList.add(css`
            position: absolute;
            left: 0;
            top: 0;
            opacity: 0;
          `)

          this.dom.append(zero, this.contentDOM)
        }

        dom = document.createElement('li')
        override contentDOM = document.createElement('div')
      })()
    }
  }
}

export const LIST_ITEM = new ListItem()
