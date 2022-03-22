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

import { Keymap } from 'prosemirror-commands'
import { InputRule } from 'prosemirror-inputrules'
import {
  DOMOutputSpec,
  NodeSpec,
  NodeType,
  Node as ProsemirrorNode,
  ParseRule,
} from 'prosemirror-model'
import { Plugin } from 'prosemirror-state'
import { Decoration, EditorView, NodeView as ProsemirrorNodeView } from 'prosemirror-view'

export { Node as ProsemirrorNode } from 'prosemirror-model'

export type StrictProsemirrorNode<T extends { [key: string]: any }> = Omit<
  ProsemirrorNode,
  'attrs'
> & {
  attrs: T
}

export interface StrictParseRule<T> extends ParseRule {
  getAttrs?: ((p: globalThis.Node | string) => T | false | null | undefined) | null
}

export type RemoveIndex<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K]
}

export interface StrictNodeSpec<T extends { [key: string]: any }>
  extends Omit<RemoveIndex<NodeSpec>, 'toDOM'> {
  attrs: { [key in keyof T]: { default: T[key] } } & { _phantom?: any }

  toDOM?: ((node: StrictProsemirrorNode<T>) => DOMOutputSpec) | null

  parseDOM?: StrictParseRule<T>[] | null

  options?: any
}

export interface Node<T extends { [key: string]: any }> {
  name: string

  schema: StrictNodeSpec<T>

  inputRules?(options: { type: NodeType }): InputRule[]

  keymap?(options: { type: NodeType }): Keymap

  nodeView?(): NodeViewCreator<T> | undefined

  plugins?(): Plugin[]

  readonly childNodes?: ChildNode<any>[]
}

export type ChildNode<T extends { [key: string]: any }> = Omit<Node<T>, 'childNodes'>

export type NodeViewCreator<T extends { [key: string]: any }> = (args: {
  node: StrictProsemirrorNode<T>
  view: EditorView
  getPos: (() => number) | boolean
}) => ProsemirrorNodeView | NodeView<T>

export abstract class NodeView<T> {
  abstract dom: HTMLElement

  contentDOM?: HTMLElement

  update?: (node: StrictProsemirrorNode<T>, decorations: Decoration[]) => boolean

  selectNode?: () => void

  deselectNode?: () => void

  setSelection?: (anchor: number, head: number, root: Document) => void

  stopEvent?: (event: Event) => boolean

  ignoreMutation?: (p: MutationRecord | { type: 'selection'; target: Element }) => boolean

  destroy?: () => void
}
