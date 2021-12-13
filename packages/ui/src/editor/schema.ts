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

import {
  baseKeymap,
  dropCursor,
  gapCursor,
  history,
  keymap,
  marks,
  nodes,
  plugins,
  redo,
  StrictMark,
  StrictNode,
  undo,
  undoInputRule,
} from '@paper/editor'
import ImageBlock, { ImageBlockOptions } from '@paper/editor/src/Editor/nodes/ImageBlock'
import { ValueOptions } from '@paper/editor/src/Editor/plugins/Value'

export const defaultNodes = ({
  imageBlockOptions,
}: {
  imageBlockOptions: ImageBlockOptions
}): StrictNode<any>[] => {
  return [
    new nodes.Text(),
    new nodes.Doc('block+'),
    new nodes.Paragraph(),
    new nodes.Heading(),
    new nodes.Blockquote(),
    new nodes.TodoList(),
    new nodes.OrderedList(),
    new nodes.BulletList(),
    new nodes.CodeBlock(),
    new nodes.Math(),
    new nodes.ImageBlock(imageBlockOptions),
    new nodes.Table(),
  ]
}

export const defaultMarks = (): StrictMark[] => {
  return [
    new marks.Bold(),
    new marks.Italic(),
    new marks.Underline(),
    new marks.Strikethrough(),
    new marks.Highlight(),
    new marks.Code(),
    new marks.Link(),
  ]
}

export const defaultPlugins = ({
  valueOptions,
  imageBlockOptions,
}: {
  valueOptions: ValueOptions
  imageBlockOptions: Pick<ImageBlockOptions, 'thumbnail'>
}) => {
  return [
    new plugins.Value(valueOptions),

    new plugins.BlockMenu(),

    new plugins.Plugins([
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

    new plugins.DropPasteFile({
      fileToNode: (view, file) => {
        const imageBlock: ImageBlock = view.state.schema.nodes['image_block']
        if (imageBlock && file.type.startsWith('image/')) {
          return ImageBlock.create(view.state.schema, file, imageBlockOptions)
        }
      },
    }),
  ]
}
