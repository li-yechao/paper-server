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

import { Plugin } from 'prosemirror-state'
import { getCellsInRow, isColumnSelected, selectColumn } from 'prosemirror-utils'
import { Decoration, DecorationSet } from 'prosemirror-view'
import Node, { StrictNodeSpec } from '../Node'

export interface TableHeadCellAttrs {
  rowspan: number
  colspan: number
}

export default class TableHeadCell extends Node<TableHeadCellAttrs> {
  constructor() {
    super()
  }

  get name(): string {
    return 'th'
  }

  get schema(): StrictNodeSpec<TableHeadCellAttrs> {
    return {
      attrs: {
        rowspan: { default: 1 },
        colspan: { default: 1 },
      },
      content: 'paragraph+',
      tableRole: 'header_cell',
      isolating: true,
      parseDOM: [{ tag: 'th' }],
      toDOM: () => {
        return ['th', 0]
      },
    }
  }

  get plugins(): Plugin[] {
    return [
      new Plugin({
        props: {
          decorations: state => {
            const { doc, selection } = state
            const decorations: Decoration[] = []
            const cells = getCellsInRow(0)(selection)

            if (cells) {
              cells.forEach(({ pos }, index) => {
                decorations.push(
                  Decoration.widget(pos + 1, () => {
                    const colSelected = isColumnSelected(index)(selection)
                    let className = 'grip-column'
                    if (colSelected) {
                      className += ' selected'
                    }
                    if (index === 0) {
                      className += ' first'
                    } else if (index === cells.length - 1) {
                      className += ' last'
                    }
                    const grip = document.createElement('a')
                    grip.className = className
                    grip.addEventListener('mousedown', event => {
                      event.preventDefault()
                      event.stopImmediatePropagation()
                      this.view?.dispatch(selectColumn(index)(state.tr))
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
