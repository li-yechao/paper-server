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

import { cx } from '@emotion/css'
import styled from '@emotion/styled'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  $isRootNode,
  $isTextNode,
  ElementNode,
  LexicalEditor,
  LexicalNode,
  TextNode,
} from 'lexical'
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePopper } from 'react-popper'
import { useUpdate } from 'react-use'

export interface BlockMenuCommand {
  icon: ReactNode
  title: string
  keyword?: string
  action: (editor: LexicalEditor) => void
}

export default function BlockMenuPlugin({ commands }: { commands: BlockMenuCommand[] }) {
  const [editor] = useLexicalComposerContext()
  const [keyword, setKeyword] = useState<string>()

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      let text: string | undefined

      editorState.read(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) {
          return
        }

        const anchor = selection.anchor
        if (anchor.type !== 'text') {
          return
        }
        const anchorNode = anchor.getNode()
        if (!anchorNode.isSimpleText()) {
          return
        }
        const parent = anchorNode.getParent()
        if ($isParagraphNode(parent) && $isRootNode(parent?.getParent())) {
          text = anchorNode.getTextContent()
        }
      })

      if (text?.startsWith('/')) {
        setKeyword(text.slice(1).trim())
      } else {
        setKeyword(undefined)
      }
    })
  }, [editor])

  const filteredCommands = useMemo(
    () =>
      keyword === undefined
        ? []
        : commands.filter(
            i =>
              i.keyword?.toLowerCase().includes(keyword.toLowerCase()) ||
              i.title.toLowerCase().includes(keyword.toLowerCase())
          ),
    [keyword]
  )

  if (!filteredCommands.length) {
    return null
  }

  return createPortal(<BlockMenu editor={editor} commands={filteredCommands} />, document.body)
}

function BlockMenu({ editor, commands }: { editor: LexicalEditor; commands: BlockMenuCommand[] }) {
  const forceUpdate = useUpdate()

  const commandsRef = useRef(commands)
  commandsRef.current = commands

  const index = useRef(0)
  const setIndex = useCallback((v: number) => ((index.current = v), forceUpdate()), [])

  const virtualElement = useRef<{ getBoundingClientRect: () => DOMRect }>({
    getBoundingClientRect: () => {
      const nativeSelection = window.getSelection()
      if (nativeSelection?.rangeCount) {
        const domRange = nativeSelection.getRangeAt(0)
        return domRange.getBoundingClientRect()
      }
      return { left: -1000, top: 0, width: 0, height: 0 } as any
    },
  })

  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null)
  const { styles, attributes, update } = usePopper(virtualElement.current, popperElement, {
    placement: 'bottom-start',
    modifiers: [
      { name: 'flip', enabled: true },
      { name: 'offset', options: { offset: [0, 8] } },
      { name: 'preventOverflow', options: { padding: 16, altAxis: true } },
    ],
  })

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        update?.()
      })
    })
  }, [editor, update])

  useEffect(() => {
    const cb = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        e.stopPropagation()

        commandsRef.current[index.current % commandsRef.current.length]?.action(editor)
      }

      if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey) || (e.ctrlKey && e.key === 'p')) {
        e.preventDefault()
        e.stopPropagation()

        setIndex(Math.max(0, index.current - 1))
      }

      if (
        e.key === 'ArrowDown' ||
        (e.key === 'Tab' && !e.shiftKey) ||
        (e.ctrlKey && e.key === 'n')
      ) {
        e.preventDefault()
        e.stopPropagation()

        setIndex(index.current + 1)
      }
    }
    window.addEventListener('keydown', cb, true)
    return () => window.removeEventListener('keydown', cb, true)
  }, [])

  return (
    <_Popper ref={setPopperElement} style={styles['popper']} {...attributes['popper']}>
      <_Menus>
        {commands.map((item, i) => (
          <_Menu
            key={item.title}
            className={cx(index.current % commands.length === i && 'selected')}
            onClick={() => item.action(editor)}
          >
            <span className="icon">{item.icon}</span>
            <span className="title">{item.title}</span>
          </_Menu>
        ))}
      </_Menus>
    </_Popper>
  )
}

export function replaceWithNode(editor: LexicalEditor, node: () => LexicalNode) {
  editor.update(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) {
      return
    }
    const anchorNode = selection.anchor.getNode()
    if (!$isTextNode(anchorNode)) {
      return
    }
    if (!(anchorNode as TextNode).isSimpleText()) {
      return
    }
    const n = node()
    anchorNode.getParent()?.replace(n)
    if (n instanceof ElementNode) {
      n.selectStart()
    } else {
      n.selectPrevious()
    }
  })
}

const _Popper = styled.div`
  background-color: #ffffff;
  box-shadow: 0 5px 10px #0000004d;
  border-radius: 8px;
`

const _Menus = styled.div`
  padding: 8px;
  border-radius: 8px;
  overflow: hidden;
`

const _Menu = styled.div`
  height: 32px;
  padding: 0 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  cursor: pointer;

  &.selected {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }

  > .icon {
    width: 40px;
    font-size: 24px;
    color: #666666;
    display: flex;
    align-items: center;
  }
`
