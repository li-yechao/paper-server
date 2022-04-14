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

import { Keymap, splitBlock } from 'prosemirror-commands'
import { Plugin } from 'prosemirror-state'
import {
  addColumnAfter,
  addColumnBefore,
  addRowAfter,
  addRowBefore,
  deleteColumn,
  deleteRow,
  deleteTable,
  goToNextCell,
  isInTable,
  tableEditing,
} from 'prosemirror-tables'
import { addRowAt, getCellsInColumn } from 'prosemirror-utils'
import DeleteOutline from '../../icons/DeleteOutline'
import InsertAbove from '../../icons/InsertAbove'
import InsertBelow from '../../icons/InsertBelow'
import InsertLeft from '../../icons/InsertLeft'
import InsertRight from '../../icons/InsertRight'
import { Button, MenuComponentType } from '../../lib/FloatingToolbar'
import { Node, StrictNodeSpec } from '../../lib/Node'
import TableCell from './TableCell'
import TableHeadCell from './TableHeadCell'
import TableRow from './TableRow'
import getColumnIndex from './utils/getColumnIndex'
import getRowIndex from './utils/getRowIndex'

export interface TableAttrs {}

export default class Table implements Node<TableAttrs> {
  get name(): string {
    return 'table'
  }

  get schema(): StrictNodeSpec<TableAttrs> {
    return {
      attrs: {},
      content: 'tr+',
      tableRole: 'table',
      isolating: true,
      group: 'block',
      parseDOM: [{ tag: 'table' }],
      toDOM: () => {
        return [
          'div',
          { class: 'scrollable-wrapper' },
          ['div', { class: 'scrollable' }, ['table', ['tbody', 0]]],
        ]
      },
    }
  }

  keymap(): Keymap {
    return {
      Enter: (state, dispatch) => {
        if (!dispatch || !isInTable(state)) return false

        // TODO: Adding row at the end for now, can we find the current cell
        // row index and add the row below that?
        const cells = getCellsInColumn(0)(state.selection) || []

        dispatch(addRowAt(cells.length, true)(state.tr))
        return true
      },
      'Shift-Enter': splitBlock,
      Tab: goToNextCell(1),
      'Shift-Tab': goToNextCell(-1),
    }
  }

  menus(): MenuComponentType[] {
    return [
      {
        button: ({ view, ...buttonProps }) => {
          const colIndex = getColumnIndex(view.state.selection)
          const rowIndex = getRowIndex(view.state.selection)
          const isTableSelection = colIndex !== undefined && rowIndex !== undefined

          if (isTableSelection) {
            return (
              <>
                <Button {...buttonProps} onClick={() => deleteTable(view.state, view.dispatch)}>
                  <DeleteOutline />
                </Button>
              </>
            )
          } else if (colIndex !== undefined) {
            return (
              <>
                <Button {...buttonProps} onClick={() => addColumnBefore(view.state, view.dispatch)}>
                  <InsertLeft />
                </Button>
                <Button {...buttonProps} onClick={() => addColumnAfter(view.state, view.dispatch)}>
                  <InsertRight />
                </Button>
                <Button {...buttonProps} onClick={() => deleteColumn(view.state, view.dispatch)}>
                  <DeleteOutline />
                </Button>
              </>
            )
          } else if (rowIndex !== undefined) {
            return (
              <>
                <Button {...buttonProps} onClick={() => addRowBefore(view.state, view.dispatch)}>
                  <InsertAbove />
                </Button>
                <Button {...buttonProps} onClick={() => addRowAfter(view.state, view.dispatch)}>
                  <InsertBelow />
                </Button>
                <Button {...buttonProps} onClick={() => deleteRow(view.state, view.dispatch)}>
                  <DeleteOutline />
                </Button>
              </>
            )
          }
          return null
        },
      },
    ]
  }

  plugins(): Plugin[] {
    return [tableEditing()]
  }

  readonly childNodes = [new TableRow(), new TableHeadCell(), new TableCell()]
}
