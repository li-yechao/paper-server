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

import { setBlockType } from 'prosemirror-commands'
import { NodeType } from 'prosemirror-model'
import { EditorState, Selection, Transaction } from 'prosemirror-state'
import isNodeActive from './isNodeActive'

export default function toggleBlockType(
  type: NodeType,
  toggleType: NodeType,
  attrs: Record<string, any> = {}
) {
  return (state: EditorState, dispatch: (tr: Transaction) => void) => {
    const isActive = isNodeActive(type, attrs)(state)

    if (isActive) {
      return setBlockType(toggleType)(state, dispatch)
    }

    return setBlockType(type, attrs)(state, dispatch)
  }
}

const CAN_TOGGLE_BLOCK_TYPES = [
  'paragraph',
  'heading',
  'blockquote',
  'bullet_list',
  'ordered_list',
  'todo_list',
]

export function canToggleBlockType(selection: Selection): boolean {
  if (selection.empty) {
    return false
  }

  const { content } = selection.content()
  for (let i = 0; i < content.childCount; i++) {
    if (!CAN_TOGGLE_BLOCK_TYPES.includes(content.child(i).type.name)) {
      return false
    }
  }
  return true
}
