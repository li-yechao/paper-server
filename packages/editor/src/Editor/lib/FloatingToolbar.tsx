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

import { css } from '@emotion/css'
import styled from '@emotion/styled'
import { Box, Button, ButtonGroup, ButtonProps, Popper, Tooltip, TooltipProps } from '@mui/material'
import { EditorState, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import React, { useEffect, useRef, useState } from 'react'
import { useSafeUpdate } from '../../utils/useSafeUpdate'

export interface FloatingToolbarProps {
  view: EditorView
  menus: MenuComponentType[]
}

export type MenuComponentType = {
  button: React.ComponentType<{ view: EditorView } & ButtonProps>
  expand?: React.ComponentType<{ view: EditorView }>
  isExpandVisible?: (view: EditorView) => boolean
}

export default function FloatingToolbar({ view, menus }: FloatingToolbarProps) {
  const props = useTooltipProps(view)
  const [open, setOpen] = useState(false)

  // Avoid show toolbar when IME input in safari.
  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(props.open)
    }, 50)
    return () => clearTimeout(timer)
  }, [props.open])

  return <_FloatingToolbar menus={menus} view={view} {...props} open={open} />
}

const _FloatingToolbar = React.memo(
  ({
    view,
    menus,
    isSelecting,
    offsetX,
    offsetY,
    ...popperProps
  }: {
    view: EditorView
    menus: MenuComponentType[]
    isSelecting?: boolean
    offsetX: number
    offsetY: number
  } & Partial<TooltipProps>) => {
    return (
      <Tooltip
        placement="top"
        arrow
        classes={{
          tooltip: css`
            max-width: none;
          `,
          arrow: css`
            transform: translate(0, 0) !important;
            left: 0;
            right: 0;
            margin: auto;
          `,
        }}
        disableFocusListener
        disableHoverListener
        disableTouchListener
        children={<div />}
        PopperProps={{
          anchorEl: view.dom,
          style: { pointerEvents: isSelecting ? 'none' : 'all', position: 'relative' },
          popperOptions: {
            modifiers: [
              { name: 'flip', enabled: false },
              {
                name: 'offset',
                options: {
                  offset: [offsetX, offsetY],
                },
              },
              {
                name: 'preventOverflow',
                options: {
                  rootBoundary: 'document',
                },
              },
            ],
          },
        }}
        {...popperProps}
        PopperComponent={_Popper}
        title={
          <>
            <_ButtonGroup variant="text" color="inherit">
              {menus.map((menu, index) => (
                <menu.button key={index} view={view} />
              ))}
            </_ButtonGroup>
            {menus.map((menu, index) => {
              return (
                menu.expand &&
                menu.isExpandVisible?.(view) && (
                  <Box key={index} borderTop={1} borderColor="rgba(0, 0, 0, 0.23)">
                    <menu.expand view={view} />
                  </Box>
                )
              )
            })}
          </>
        }
      />
    )
  }
)

function useTooltipProps(view: EditorView) {
  const update = useSafeUpdate()

  const state = useRef({
    isSelecting: false,
    open: false,
    offsetX: 0,
    offsetY: 0,
  })

  useEffect(() => {
    const onMouseDown = () => {
      state.current.isSelecting = true
    }
    const onMouseUp = () => {
      state.current.isSelecting = false
      setTimeout(() => update())
    }

    view.dom.addEventListener('mousedown', onMouseDown, true)
    window.addEventListener('mouseup', onMouseUp, true)
    return () => {
      view.dom.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  state.current.open = false

  if (!state.current.isSelecting) {
    const { selection } = view.state
    if (!selection.empty && !(selection as any).node) {
      const dom = view.dom
      const { width, left, top } = dom.getBoundingClientRect()
      const { left: fromLeft, top: fromTop } = view.coordsAtPos(selection.from)
      const { left: toLeft } = view.coordsAtPos(selection.to, -1)

      state.current.open = true
      state.current.offsetX = fromLeft + (toLeft - fromLeft) / 2 - left - width / 2
      state.current.offsetY = top - fromTop
    }
  }

  return state.current
}

const _Popper = styled(Popper)`
  user-select: none;

  > .MuiTooltip-tooltip {
    padding: 0;
  }
`

const _ButtonGroup = styled(ButtonGroup)`
  > .MuiButton-root {
    color: inherit;
    opacity: 0.6;
    border-right: none !important;
    border-left: 1px solid rgba(0, 0, 0, 0.23);

    &:first-of-type {
      border-left: none;
    }
  }

  > .MuiDivider-root {
    height: auto;
    border-color: currentColor;
    margin: 0 4px;

    &:first-child,
    &:last-child /* emotion-disable-server-rendering-unsafe-selector-warning-please-do-not-use-this-the-warning-exists-for-a-reason */ {
      display: none;
    }

    + .MuiButton-root {
      border-left: none;
    }
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
          style={{ opacity: active ? 1 : 0.6 }}
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
