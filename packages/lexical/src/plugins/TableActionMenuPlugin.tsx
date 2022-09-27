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

import styled from '@emotion/styled'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $deleteTableColumn,
  $getElementGridForTableNode,
  $getTableCellNodeFromLexicalNode,
  $getTableColumnIndexFromTableCellNode,
  $getTableNodeFromLexicalNodeOrThrow,
  $getTableRowIndexFromTableCellNode,
  $insertTableColumn,
  $insertTableRow,
  $isTableCellNode,
  $isTableRowNode,
  $removeTableRowAtIndex,
  TableCellHeaderStates,
  TableCellNode,
  TableRowNode,
} from '@lexical/table'
import {
  $getSelection,
  $isRangeSelection,
  $setSelection,
  DEPRECATED_$isGridSelection,
  LexicalEditor,
} from 'lexical'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePopper } from 'react-popper'
import ChevronDown from '../icons/ChevronDown'

export default function TableActionMenuPlugin() {
  const [editor] = useLexicalComposerContext()

  return createPortal(<TableActionMenu editor={editor} />, document.body)
}

function TableActionMenu({ editor }: { editor: LexicalEditor }) {
  const [menuButton, setMenuButton] = useState<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)
  const [cellNode, setCellNode] = useState<TableCellNode | null>(null)

  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null)
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null)
  const { styles, attributes } = usePopper(menuButton, popperElement, {
    placement: 'right-start',
    modifiers: [
      { name: 'flip', enabled: true },
      { name: 'arrow', options: { element: arrowElement } },
      { name: 'offset', options: { offset: [-16, 8] } },
      { name: 'preventOverflow', options: { padding: 16, altAxis: true } },
    ],
  })

  useEffect(() => {
    setVisible(false)
  }, [cellNode])

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        if (!menuButton) {
          return
        }

        const selection = $getSelection()
        const cellNode = $isRangeSelection(selection)
          ? $getTableCellNodeFromLexicalNode(selection.anchor.getNode())
          : null
        if (cellNode) {
          setCellNode(cellNode)
          const rect = editor.getElementByKey(cellNode.getKey())?.getBoundingClientRect()
          if (rect) {
            menuButton.style.top = `${rect.top + window.scrollY + 6}px`
            menuButton.style.left = `${rect.left + rect.width + window.scrollX - 26}px`
            return
          }
        }
        menuButton.style.top = `0`
        menuButton.style.left = `-1000px`
        setCellNode(null)
      })
    })
  }, [editor, menuButton])

  const insertTableRowAtSelection = useCallback(
    (after: boolean) => {
      if (!cellNode) {
        return
      }

      editor.update(() => {
        const selection = $getSelection()
        const tableNode = $getTableNodeFromLexicalNodeOrThrow(cellNode)

        let tableRowIndex
        if (DEPRECATED_$isGridSelection(selection)) {
          const selectionShape = selection.getShape()
          tableRowIndex = after ? selectionShape.toY : selectionShape.fromY
        } else {
          tableRowIndex = $getTableRowIndexFromTableCellNode(cellNode)
        }

        const grid = $getElementGridForTableNode(editor, tableNode)

        $insertTableRow(tableNode, tableRowIndex, after, 1, grid)

        setVisible(false)
      })
    },
    [editor, cellNode]
  )

  const insertTableColumnAtSelection = useCallback(
    (after: boolean) => {
      if (!cellNode) {
        return
      }

      editor.update(() => {
        const selection = $getSelection()

        const tableNode = $getTableNodeFromLexicalNodeOrThrow(cellNode)

        let tableColumnIndex

        if (DEPRECATED_$isGridSelection(selection)) {
          const selectionShape = selection.getShape()
          tableColumnIndex = after ? selectionShape.toX : selectionShape.fromX
        } else {
          tableColumnIndex = $getTableColumnIndexFromTableCellNode(cellNode)
        }

        const grid = $getElementGridForTableNode(editor, tableNode)

        $insertTableColumn(tableNode, tableColumnIndex, after, 1, grid)

        setVisible(false)
      })
    },
    [editor, cellNode]
  )

  const deleteTableRowAtSelection = useCallback(() => {
    if (!cellNode) {
      return
    }

    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(cellNode)
      const tableRowIndex = $getTableRowIndexFromTableCellNode(cellNode)

      $removeTableRowAtIndex(tableNode, tableRowIndex)

      setVisible(false)

      $setSelection(null)
    })
  }, [editor, cellNode])

  const deleteTableColumnAtSelection = useCallback(() => {
    if (!cellNode) {
      return
    }

    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(cellNode)
      const tableColumnIndex = $getTableColumnIndexFromTableCellNode(cellNode)

      $deleteTableColumn(tableNode, tableColumnIndex)

      setVisible(false)

      $setSelection(null)
    })
  }, [editor, cellNode])

  const deleteTableAtSelection = useCallback(() => {
    if (!cellNode) {
      return
    }

    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(cellNode)
      tableNode.remove()

      setVisible(false)

      $setSelection(null)
    })
  }, [editor, cellNode])

  const toggleTableRowIsHeader = useCallback(() => {
    if (!cellNode) {
      return
    }

    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(cellNode)

      const tableRowIndex = $getTableRowIndexFromTableCellNode(cellNode)

      const tableRows = tableNode.getChildren()

      if (tableRowIndex >= tableRows.length || tableRowIndex < 0) {
        throw new Error('Expected table cell to be inside of table row.')
      }

      const tableRow = tableRows[tableRowIndex] as TableRowNode

      if (!$isTableRowNode(tableRow)) {
        throw new Error('Expected table row')
      }

      tableRow?.getChildren().forEach(tableCell => {
        if (!$isTableCellNode(tableCell)) {
          throw new Error('Expected table cell')
        }

        ;(tableCell as any).toggleHeaderStyle(TableCellHeaderStates.ROW)
      })

      $setSelection(null)

      setVisible(false)
    })
  }, [editor, cellNode])

  const toggleTableColumnIsHeader = useCallback(() => {
    if (!cellNode) {
      return
    }

    editor.update(() => {
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(cellNode)

      const tableColumnIndex = $getTableColumnIndexFromTableCellNode(cellNode)

      const tableRows = tableNode.getChildren()

      for (let r = 0; r < tableRows.length; r++) {
        const tableRow = tableRows[r] as TableRowNode

        if (!$isTableRowNode(tableRow)) {
          throw new Error('Expected table row')
        }

        const tableCells = tableRow.getChildren()

        if (tableColumnIndex >= tableCells.length || tableColumnIndex < 0) {
          throw new Error('Expected table cell to be inside of table row.')
        }

        const tableCell = tableCells[tableColumnIndex]

        if (!$isTableCellNode(tableCell)) {
          throw new Error('Expected table cell')
        }

        ;(tableCell as any).toggleHeaderStyle(TableCellHeaderStates.COLUMN)
      }

      $setSelection(null)

      setVisible(false)
    })
  }, [editor, cellNode])

  return (
    <>
      <_MenuButton ref={setMenuButton} onClick={() => setVisible(true)}>
        <ChevronDown />
      </_MenuButton>

      {cellNode &&
        visible &&
        createPortal(
          <_Popper ref={setPopperElement} style={styles['popper']} {...attributes['popper']}>
            <div ref={setArrowElement} className="arrow" style={styles['arrow']} />

            <_Menus>
              <_Menu onClick={() => insertTableRowAtSelection(false)}>Insert row above</_Menu>
              <_Menu onClick={() => insertTableRowAtSelection(true)}>Insert row below</_Menu>
              <_Menu onClick={() => insertTableColumnAtSelection(false)}>Insert column left</_Menu>
              <_Menu onClick={() => insertTableColumnAtSelection(true)}>Insert column right</_Menu>
              <_Menu onClick={() => deleteTableRowAtSelection()}>Delete row</_Menu>
              <_Menu onClick={() => deleteTableColumnAtSelection()}>Delete column</_Menu>
              <_Menu onClick={() => deleteTableAtSelection()}>Delete table</_Menu>
              <_Menu onClick={() => toggleTableRowIsHeader()}>
                {((cellNode as any).__headerState & TableCellHeaderStates.ROW) ===
                TableCellHeaderStates.ROW
                  ? 'Remove'
                  : 'Add'}{' '}
                row header
              </_Menu>
              <_Menu onClick={() => toggleTableColumnIsHeader()}>
                {((cellNode as any).__headerState & TableCellHeaderStates.COLUMN) ===
                TableCellHeaderStates.COLUMN
                  ? 'Remove'
                  : 'Add'}{' '}
                column header
              </_Menu>
            </_Menus>
          </_Popper>,
          document.body
        )}
    </>
  )
}

const _MenuButton = styled.div`
  position: absolute;
  top: 0;
  left: -1000px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: rgba(0, 0, 0, 0.4);
  background-color: rgba(0, 0, 0, 0.1);
  cursor: pointer;

  &:hover {
    background-color: rgba(0, 0, 0, 0.2);
    color: rgba(255, 255, 255, 0.4);
  }
`

const _Popper = styled.div`
  position: relative;
  background-color: #ffffff;
  box-shadow: 0 5px 10px #0000004d;
  border-radius: 8px;

  > .arrow {
    position: absolute;
    display: block;
    width: 16px;
    height: 16px;
    overflow: hidden;
    pointer-events: none;

    &:before {
      content: '';
      display: block;
      position: absolute;
      width: 10px;
      height: 10px;
      margin: auto;
      top: 0;
      bottom: 0;
      background-color: #ffffff;
      border-radius: 0 0 2px;
      pointer-events: none;
      box-shadow: 0 0 1px #0000004d;
    }
  }

  &[data-popper-placement^='left'] > .arrow {
    right: -16px;

    &:before {
      left: -5px;
      transform: rotate(45deg);
    }
  }

  &[data-popper-placement^='right'] > .arrow {
    left: -16px;

    &:before {
      right: -5px;
      transform: rotate(45deg);
    }
  }
`

const _Menus = styled.div`
  padding: 8px;
`

const _Menu = styled.div`
  height: 32px;
  line-height: 32px;
  padding: 0 8px;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`
