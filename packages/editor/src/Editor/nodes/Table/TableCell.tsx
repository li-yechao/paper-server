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

import { Plugin } from 'prosemirror-state'
import {
  getCellsInColumn,
  isRowSelected,
  isTableSelected,
  selectRow,
  selectTable,
} from 'prosemirror-utils'
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view'
import { Node, StrictNodeSpec } from '../../lib/Node'

export interface TableCellAttrs {
  rowspan: number
  colspan: number
}

export default class TableCell implements Node<TableCellAttrs> {
  get name(): string {
    return 'td'
  }

  get schema(): StrictNodeSpec<TableCellAttrs> {
    return {
      attrs: {
        rowspan: { default: 1 },
        colspan: { default: 1 },
      },
      content: 'paragraph+',
      tableRole: 'cell',
      isolating: true,
      parseDOM: [{ tag: 'td' }],
      toDOM: () => {
        return ['td', 0]
      },
    }
  }

  view?: EditorView

  plugins(): Plugin[] {
    return [
      new Plugin({
        props: {
          decorations: state => {
            const { doc, selection } = state
            const decorations: Decoration[] = []
            const cells = getCellsInColumn(0)(selection)

            if (cells) {
              cells.forEach(({ pos }, index) => {
                if (index === 0) {
                  decorations.push(
                    Decoration.widget(pos + 1, () => {
                      let className = 'grip-table'
                      const selected = isTableSelected(selection)
                      if (selected) {
                        className += ' selected'
                      }
                      const grip = document.createElement('a')
                      grip.className = className
                      grip.addEventListener('mousedown', event => {
                        event.preventDefault()
                        event.stopImmediatePropagation()
                        this.view?.dispatch(selectTable(state.tr))
                      })
                      return grip
                    })
                  )
                }
                decorations.push(
                  Decoration.widget(pos + 1, () => {
                    const rowSelected = isRowSelected(index)(selection)

                    let className = 'grip-row'
                    if (rowSelected) {
                      className += ' selected'
                    }
                    if (index === 0) {
                      className += ' first'
                    }
                    if (index === cells.length - 1) {
                      className += ' last'
                    }
                    const grip = document.createElement('a')
                    grip.className = className
                    grip.addEventListener('mousedown', event => {
                      event.preventDefault()
                      event.stopImmediatePropagation()
                      this.view?.dispatch(selectRow(index)(state.tr))
                    })
                    return grip
                  })
                )
              })
            }

            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  }
}
