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

import Editor from './Editor'
import Bold from './Editor/marks/Bold'
import Code from './Editor/marks/Code'
import Highlight from './Editor/marks/Highlight'
import Italic from './Editor/marks/Italic'
import Link from './Editor/marks/Link'
import Strikethrough from './Editor/marks/Strikethrough'
import Underline from './Editor/marks/Underline'
import Blockquote from './Editor/nodes/Blockquote'
import BulletList from './Editor/nodes/BulletList'
import CodeBlock from './Editor/nodes/CodeBlock'
import Doc from './Editor/nodes/Doc'
import Heading from './Editor/nodes/Heading'
import ImageBlock from './Editor/nodes/ImageBlock'
import Math from './Editor/nodes/Math'
import OrderedList from './Editor/nodes/OrderedList'
import Paragraph from './Editor/nodes/Paragraph'
import Table from './Editor/nodes/Table'
import Text from './Editor/nodes/Text'
import TodoList from './Editor/nodes/TodoList'
import BlockMenu from './Editor/plugins/BlockMenu'
import DropPasteFile from './Editor/plugins/DropPasteFile'
import Placeholder from './Editor/plugins/Placeholder'
import Plugins from './Editor/plugins/Plugins'
import Value from './Editor/plugins/Value'

export * from 'prosemirror-commands'
export * from 'prosemirror-dropcursor'
export * from 'prosemirror-gapcursor'
export * from 'prosemirror-history'
export * from 'prosemirror-inputrules'
export * from 'prosemirror-keymap'
export * from 'prosemirror-markdown'
export * from 'prosemirror-model'
export * from 'prosemirror-state'

export type { EditorProps, EditorElement } from './Editor'

export { default as Extension } from './Editor/lib/Extension'

export { default as ExtensionManager } from './Editor/lib/ExtensionManager'

export type { DocJson } from './Editor/plugins/Value'

export { defaultMarkdownSerializer } from './utils/markdown'

export { default as StrictNode } from './Editor/nodes/Node'

export { default as StrictMark } from './Editor/marks/Mark'

export default Editor

export const nodes = {
  Text,
  Doc,
  Heading,
  Paragraph,
  Blockquote,
  ImageBlock,
  CodeBlock,
  Math,
  TodoList,
  OrderedList,
  BulletList,
  Table,
}

export const marks = {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Highlight,
  Link,
}

export const plugins = {
  Plugins,
  DropPasteFile,
  Placeholder,
  Value,
  BlockMenu,
}
