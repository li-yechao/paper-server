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
import { EditorState, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePopper } from 'react-popper'

export interface FloatingToolbarProps {
  view: EditorView
  menus: MenuComponentType[]
}

export type MenuComponentType = {
  button: React.ComponentType<{ view: EditorView }>
  expand?: React.ComponentType<{ view: EditorView }>
  isExtraPanelVisible?: (view: EditorView) => boolean
}

export default function FloatingToolbar({ view, menus }: FloatingToolbarProps) {
  const [open, setOpen] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)

  const virtualElement = useRef<{ getBoundingClientRect: () => DOMRect }>({
    getBoundingClientRect: () => {
      const { selection } = view.state
      const open = !selection.empty && !(selection as any).node
      setOpen(open)

      if (!open) {
        return { width: 0, height: 0, right: 0, bottom: 0, left: -1000, top: 0 } as any
      }

      const { left: fromLeft, top: fromTop } = view.coordsAtPos(view.state.selection.from)
      const { left: toLeft, bottom: toBottom } = view.coordsAtPos(view.state.selection.to, -1)

      const left = fromLeft + (toLeft - fromLeft) / 2
      const top = fromTop

      return { width: 0, height: toBottom - fromTop, right: 0, bottom: 0, left, top }
    },
  })

  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null)
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null)
  const { styles, attributes, update } = usePopper(virtualElement.current, popperElement, {
    modifiers: [
      { name: 'flip', enabled: true },
      { name: 'arrow', options: { element: arrowElement } },
      { name: 'offset', options: { offset: [0, 16] } },
      { name: 'preventOverflow', options: { padding: 16, altAxis: true } },
    ],
  })

  useEffect(() => {
    update?.()
  }, [view.state])

  useEffect(() => {
    const onMouseDown = () => {
      setIsSelecting(true)
    }
    const onMouseUp = () => {
      setIsSelecting(false)
    }

    view.dom.addEventListener('mousedown', onMouseDown, true)
    window.addEventListener('mouseup', onMouseUp, true)
    return () => {
      view.dom.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  return createPortal(
    <_Container
      ref={setPopperElement}
      style={{
        ...styles['popper'],
        pointerEvents: isSelecting ? 'none' : 'all',
      }}
      {...attributes['popper']}
    >
      <div ref={setArrowElement} className="arrow" style={styles['arrow']} />

      {open && (
        <_Content>
          <_ButtonList>
            {menus.map((menu, index) => (
              <li key={index}>
                <menu.button view={view} />
              </li>
            ))}
          </_ButtonList>

          <_ExtraPanelList>
            {menus.map((menu, index) => {
              return (
                menu.expand &&
                menu.isExtraPanelVisible?.(view) && (
                  <li key={index}>
                    <menu.expand view={view} />
                  </li>
                )
              )
            })}
          </_ExtraPanelList>
        </_Content>
      )}
    </_Container>,
    document.body
  )
}

const _Container = styled.div`
  position: relative;
  background-color: #ffffff;
  box-shadow: 0 3px 6px -4px #0000001f, 0 6px 16px #00000014, 0 9px 28px 8px #0000000d;

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
      left: 0;
      right: 0;
      background-color: #ffffff;
      border-radius: 0 0 2px;
      pointer-events: none;
      box-shadow: 3px 3px 7px #00000012;
    }
  }

  &[data-popper-placement^='top'] > .arrow {
    bottom: -16px;

    &:before {
      top: -5px;
      transform: rotate(45deg);
    }
  }

  &[data-popper-placement^='bottom'] > .arrow {
    top: -16px;

    &:before {
      bottom: -5px;
      transform: rotate(45deg);
    }
  }
`

const _Content = styled.div`
  border-radius: 4px;
  overflow: hidden;
`

const _ButtonList = styled.ul`
  padding: 0;
  margin: 0;
  list-style: none;
  display: flex;
  align-items: center;

  > li {
    &:not(:last-of-type) {
      border-right: 1px solid #f5f5f5;
    }
  }
`

const _ExtraPanelList = styled.ul`
  padding: 0;
  margin: 0;
  list-style: none;

  > li {
    border-top: 1px solid #f5f5f5;
  }
`

export function createMarkMenu({
  icon,
  isActive,
  toggleMark,
  isVisible,
}: {
  icon: React.ReactNode
  isActive?: (state: EditorState) => boolean
  toggleMark?: (state: EditorState, dispatch: (tr: Transaction) => void) => boolean
  isVisible?: (view: EditorView) => boolean
}): MenuComponentType {
  return {
    button: ({ view, ...buttonProps }) => {
      if (isVisible && !isVisible(view)) {
        return null
      }

      const active = isActive?.(view.state)

      return (
        <Button
          {...buttonProps}
          className={cx(active && 'active')}
          onClick={() => {
            if (toggleMark) {
              const top = window.scrollY
              toggleMark(view.state, view.dispatch)
              window.scrollTo({ top })
              view.focus()
            }
          }}
        >
          {icon}
        </Button>
      )
    },
  }
}

const Button = styled.button`
  appearance: none;
  border: none;
  outline: none;
  background-color: transparent;
  cursor: pointer;
  padding: 4px;
  opacity: 0.6;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &.active {
    background-color: rgba(0, 0, 0, 0.1);
    opacity: 1;
  }
`
