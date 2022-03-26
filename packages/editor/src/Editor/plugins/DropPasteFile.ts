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

import { Fragment, Node as ProsemirrorNode, Slice } from 'prosemirror-model'
import { Plugin } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { Extension } from '../lib/Extension'

export interface DropPasteFileOptions {
  create: (
    view: EditorView,
    file: File
  ) => Promise<ProsemirrorNode | null | undefined> | null | undefined
}

export default class DropPasteFile implements Extension {
  constructor(public options: DropPasteFileOptions) {}

  get name(): string {
    return 'drop_paste_file'
  }

  plugins(): Plugin[] {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            paste: (view, event) => {
              const files = event.clipboardData?.files
              if (!files?.length) {
                return false
              }

              const nodes = Array.from(files)
                .map(file => this.options.create(view, file))
                .filter((i): i is Promise<ProsemirrorNode | null | undefined> => !!i)
              if (nodes.length === 0) {
                return false
              }

              Promise.all(nodes)
                .then(nodes => nodes.filter((i): i is ProsemirrorNode => !!i))
                .then(nodes => {
                  view.dispatch(
                    view.state.tr.replaceSelection(new Slice(Fragment.from(nodes), 0, 0))
                  )
                })

              event.preventDefault()
              return true
            },
            drop: (view, event) => {
              const files = event.dataTransfer?.files
              if (!files?.length) {
                return false
              }

              const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })
              if (!pos) {
                return false
              }

              const nodes = Array.from(files)
                .map(file => this.options.create(view, file))
                .filter((i): i is Promise<ProsemirrorNode | null | undefined> => !!i)
              if (nodes.length === 0) {
                return false
              }

              Promise.all(nodes)
                .then(nodes => nodes.filter((i): i is ProsemirrorNode => !!i))
                .then(nodes => {
                  view.dispatch(view.state.tr.replaceWith(pos.pos, pos.pos, nodes))
                })

              event.preventDefault()
              return true
            },
          },
        },
      }),
    ]
  }
}
