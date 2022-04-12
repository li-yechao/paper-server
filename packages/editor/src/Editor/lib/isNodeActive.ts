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

import { NodeType } from 'prosemirror-model'
import { EditorState } from 'prosemirror-state'
import { findParentNode, findSelectedNodeOfType } from 'prosemirror-utils'

export default function isNodeActive(type: NodeType, attrs: Record<string, any> = {}) {
  return (state: EditorState) => {
    const node =
      findSelectedNodeOfType(type)(state.selection) ||
      findParentNode(node => node.type === type)(state.selection)

    if (!Object.keys(attrs).length || !node) {
      return !!node
    }

    return node.node.hasMarkup(type, { ...node.node.attrs, ...attrs })
  }
}
