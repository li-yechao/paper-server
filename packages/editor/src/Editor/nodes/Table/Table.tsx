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

import { Keymap } from 'prosemirror-commands'
import { NodeType } from 'prosemirror-model'
import { Plugin } from 'prosemirror-state'
import { goToNextCell, isInTable, tableEditing } from 'prosemirror-tables'
import { addRowAt, getCellsInColumn } from 'prosemirror-utils'
import Node, { StrictNodeSpec } from '../Node'
import TableCell from './TableCell'
import TableHeadCell from './TableHeadCell'
import TableRow from './TableRow'

export interface TableAttrs {}

export default class Table extends Node<TableAttrs> {
  constructor() {
    super()
  }

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

  keymap(_: { type: NodeType }): Keymap {
    return {
      Enter: (state, dispatch) => {
        if (!dispatch || !isInTable(state)) return false

        // TODO: Adding row at the end for now, can we find the current cell
        // row index and add the row below that?
        const cells = getCellsInColumn(0)(state.selection) || []

        dispatch(addRowAt(cells.length, true)(state.tr))
        return true
      },
      Tab: goToNextCell(1),
      'Shift-Tab': goToNextCell(-1),
    }
  }

  get plugins(): Plugin[] {
    return [tableEditing()]
  }

  readonly childNodes = [new TableRow(), new TableHeadCell(), new TableCell()]
}
