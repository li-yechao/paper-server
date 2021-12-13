import { css } from '@emotion/css'
import { Add } from '@mui/icons-material'
import { Box, List, ListItemButton, ListItemIcon, Paper } from '@mui/material'
import { setBlockType } from 'prosemirror-commands'
import { InputRule, inputRules } from 'prosemirror-inputrules'
import { EditorState, Plugin, TextSelection, Transaction } from 'prosemirror-state'
import { isInTable } from 'prosemirror-tables'
import { createTable, findParentNode } from 'prosemirror-utils'
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view'
import { useCallback } from 'react'
import { ReactNode, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import ReactDOM from 'react-dom'
import { useSafeUpdate } from '../../utils/useSafeUpdate'
import BlockQuote from '../icons/BlockQuote'
import BulletList from '../icons/BulletList'
import Code from '../icons/Code'
import Heading1 from '../icons/Heading1'
import Heading2 from '../icons/Heading2'
import Heading3 from '../icons/Heading3'
import Image from '../icons/Image'
import MathIcon from '../icons/Math'
import OrderedList from '../icons/OrderedList'
import Table from '../icons/Table'
import TodoList from '../icons/TodoList'
import Extension from '../lib/Extension'
import toggleList from '../lib/toggleList'
import toggleWrap from '../lib/toggleWrap'
import ImageBlock from '../nodes/ImageBlock'

const MAX_MATCH = 500
const OPEN_REGEX = /^\/(\w+)?$/
const CLOSE_REGEX = /(^(?!\/(\w+)?)(.*)$|^\/(([\w\W]+)\s.*|\s)$|^\/((\W)+)$)/

export interface BlockMenuOptions {
  onOpen: (keyword: string) => void
  onClose: () => void
}

export default class BlockMenu extends Extension {
  private options?: BlockMenuOptions

  setOptions(options: BlockMenuOptions) {
    this.options = options
  }

  get name() {
    return 'block_menu'
  }

  get plugins() {
    const button = document.createElement('button')
    button.className = css`
      outline: none;
      border: none;
      background-color: transparent;
      cursor: pointer;
      color: currentColor;
      position: absolute;
      padding: 0;
      margin-left: -24px;

      &:hover {
        opacity: 0.5;
      }
    `
    button.type = 'button'
    ReactDOM.render(<Add />, button)

    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            mousedown: () => {
              this.options?.onClose()
              return false
            },
          },
          handleKeyDown: (view, event) => {
            // Prosemirror input rules are not triggered on backspace, however
            // we need them to be evaluted for the filter trigger to work
            // correctly. This additional handler adds inputrules-like handling.
            if (event.key === 'Backspace') {
              // timeout ensures that the delete has been handled by prosemirror
              // and any characters removed, before we evaluate the rule.
              setTimeout(() => {
                const { pos } = view.state.selection.$from
                return run(view, pos, pos, OPEN_REGEX, (_, match) => {
                  if (match) {
                    this.options?.onOpen(match[1] || '')
                  } else {
                    this.options?.onClose()
                  }
                  return null
                })
              })
            }

            // If the query is active and we're navigating the block menu then
            // just ignore the key events in the editor itself until we're done
            if (
              event.key === 'Enter' ||
              event.key === 'ArrowUp' ||
              event.key === 'ArrowDown' ||
              event.key === 'Tab'
            ) {
              const { pos } = view.state.selection.$from

              return run(view, pos, pos, OPEN_REGEX, (_, match) => {
                // just tell Prosemirror we handled it and not to do anything
                return match ? true : null
              })
            }

            return false
          },
          decorations: state => {
            const parent = findParentNode(node => node.type.name === 'paragraph')(state.selection)
            if (!parent) {
              return
            }

            const decorations: Decoration[] = []
            const isEmpty = parent && parent.node.content.size === 0
            const isSlash = parent && parent.node.textContent === '/'
            const isTopLevel = state.selection.$from.depth === 1

            if (isTopLevel) {
              if (isEmpty) {
                decorations.push(
                  Decoration.widget(parent.pos, () => {
                    button.addEventListener('click', () => {
                      this.options?.onOpen('')
                    })
                    return button
                  })
                )

                decorations.push(
                  Decoration.node(parent.pos, parent.pos + parent.node.nodeSize, {
                    class: 'ProseMirror-placeholder',
                    'data-placeholder': `Type '/' to insert…`,
                  })
                )
              }

              if (isSlash) {
                decorations.push(
                  Decoration.node(parent.pos, parent.pos + parent.node.nodeSize, {
                    class: 'ProseMirror-placeholder',
                    'data-placeholder': `  Keep typing to filter…`,
                  })
                )
              }

              return DecorationSet.create(state.doc, decorations)
            }

            return
          },
        },
      }),
      inputRules({
        rules: [
          // main regex should match only:
          // /word
          new InputRule(OPEN_REGEX, (state, match) => {
            if (
              match &&
              state.selection.$from.parent.type.name === 'paragraph' &&
              !isInTable(state)
            ) {
              this.options?.onOpen(match[1] || '')
            }
            return null
          }),
          // invert regex should match some of these scenarios:
          // /<space>word
          // /<space>
          // /word<space>
          new InputRule(CLOSE_REGEX, (_, match) => {
            if (match) {
              this.options?.onClose()
            }
            return null
          }),
        ],
      }),
    ]
  }

  Menus = ({
    view,
    keyword,
    onClose,
  }: {
    view: EditorView
    keyword: string | null
    onClose: () => void
  }) => {
    const onSubmit = useCallback(() => {
      const { state, dispatch } = view
      const parent = findParentNode(node => !!node)(state.selection)

      if (parent) {
        dispatch(state.tr.delete(parent.start, state.selection.to))
      }
    }, [view])

    const open = typeof keyword === 'string'
    const { left, top } = useMenuPosition(view)
    const { menus, selected } = useMenus({ view, keyword, onClose, onSubmit })

    return (
      <Box position="absolute" left={open ? left : -1000} top={top} mt={3.5}>
        <Paper>
          <List>
            {menus.map((m, index) => (
              <ListItemButton key={index} selected={index === selected}>
                <ListItemIcon>{m.icon}</ListItemIcon>
                {m.title}
              </ListItemButton>
            ))}
          </List>
        </Paper>
      </Box>
    )
  }
}

function useMenuPosition(view: EditorView) {
  const { selection } = view.state
  const coords = view.coordsAtPos(selection.from)
  const rect = view.dom.getBoundingClientRect()
  return {
    left: Math.floor(rect.left),
    top: Math.floor(coords.top - rect.top),
  }
}

interface MenuItem {
  icon: ReactNode
  title: string
  handler: (state: EditorState, dispatch: (tr: Transaction) => void) => void
}

function useMenus({
  view,
  keyword,
  onClose,
  onSubmit,
}: {
  view: EditorView
  keyword: string | null
  onClose: () => void
  onSubmit: () => void
}): {
  menus: MenuItem[]
  selected: number
} {
  const update = useSafeUpdate()
  const openRef = useRef(false)
  const menusRef = useRef<MenuItem[]>([])
  const selectedRef = useRef(0)

  useLayoutEffect(() => {
    openRef.current = typeof keyword === 'string'
  }, [keyword])

  const allMenus = useMemo(() => {
    const menus: MenuItem[] = []
    if (view.state.schema.nodes['heading']) {
      menus.push(
        {
          icon: <Heading1 />,
          title: 'Big heading',
          handler: (state, dispatch) => {
            setBlockType(state.schema.nodes['heading'], { level: 1 })(state, dispatch)
          },
        },
        {
          icon: <Heading2 />,
          title: 'Medium heading',
          handler: (state, dispatch) => {
            setBlockType(state.schema.nodes['heading'], { level: 2 })(state, dispatch)
          },
        },
        {
          icon: <Heading3 />,
          title: 'Small heading',
          handler: (state, dispatch) => {
            setBlockType(state.schema.nodes['heading'], { level: 3 })(state, dispatch)
          },
        }
      )
    }
    if (view.state.schema.nodes['ordered_list']) {
      menus.push({
        icon: <OrderedList />,
        title: 'Ordered list',
        handler: (state, dispatch) => {
          toggleList(state.schema.nodes['ordered_list'], state.schema.nodes['list_item'])(
            state,
            dispatch
          )
        },
      })
    }
    if (view.state.schema.nodes['bullet_list']) {
      menus.push({
        icon: <BulletList />,
        title: 'Bullet list',
        handler: (state, dispatch) => {
          toggleList(state.schema.nodes['bullet_list'], state.schema.nodes['list_item'])(
            state,
            dispatch
          )
        },
      })
    }
    if (view.state.schema.nodes['todo_list']) {
      menus.push({
        icon: <TodoList />,
        title: 'Todo list',
        handler: (state, dispatch) => {
          toggleList(state.schema.nodes['todo_list'], state.schema.nodes['todo_item'])(
            state,
            dispatch
          )
        },
      })
    }
    if (view.state.schema.nodes['blockquote']) {
      menus.push({
        icon: <BlockQuote />,
        title: 'Quote',
        handler: (state, dispatch) => {
          toggleWrap(state.schema.nodes['blockquote'])(state, dispatch)
        },
      })
    }
    if (view.state.schema.nodes['code_block']) {
      menus.push({
        icon: <Code />,
        title: 'Code block',
        handler: (state, dispatch) => {
          setBlockType(state.schema.nodes['code_block'], {})(state, dispatch)
        },
      })
    }
    if (view.state.schema.nodes['math_display']) {
      menus.push({
        icon: <MathIcon />,
        title: 'Math block',
        handler: (state, dispatch) => {
          setBlockType(state.schema.nodes['math_display'])(state, dispatch)
        },
      })
    }
    if (view.state.schema.nodes['image_block']) {
      menus.push({
        icon: <Image />,
        title: 'Image block',
        handler: (state, dispatch) => {
          setTimeout(() => {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'image/*'
            input.multiple = true
            input.onchange = async () => {
              if (input.files?.length) {
                const nodes = await Promise.all(
                  Array.from(input.files).map(file =>
                    ImageBlock.create(
                      view.state.schema,
                      file,
                      view.state.schema.nodes['image_block'].spec.options
                    )
                  )
                )
                dispatch(state.tr.replaceWith(state.selection.from - 1, state.selection.to, nodes))
              }
            }
            input.click()
          }, 1000)
        },
      })
    }
    if (view.state.schema.nodes['table']) {
      menus.push({
        icon: <Table />,
        title: 'Table',
        handler: (state, dispatch) => {
          const offset = state.tr.selection.anchor + 1
          const nodes = createTable(state.schema, 3, 3)
          const tr = state.tr.replaceSelectionWith(nodes).scrollIntoView()
          const resolvedPos = tr.doc.resolve(offset)
          tr.setSelection(TextSelection.near(resolvedPos))
          dispatch(tr)
        },
      })
    }
    return menus
  }, [view])

  useEffect(() => {
    if (!keyword) {
      menusRef.current = allMenus
    } else {
      const lowercase = keyword.toLowerCase()
      menusRef.current = allMenus.filter(m => m.title.toLowerCase().includes(lowercase))
    }
    update()
  }, [allMenus, keyword])

  useEffect(() => {
    const cb = (e: KeyboardEvent) => {
      if (!openRef.current) return

      if (e.key === 'Enter') {
        e.preventDefault()
        e.stopPropagation()

        const m = menusRef.current[selectedRef.current]
        onSubmit()
        m?.handler(view.state, view.dispatch)
        onClose()
      }

      if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey) || (e.ctrlKey && e.key === 'p')) {
        e.preventDefault()
        e.stopPropagation()

        selectedRef.current = Math.max(0, selectedRef.current - 1)
        update()
      }

      if (
        e.key === 'ArrowDown' ||
        (e.key === 'Tab' && !e.shiftKey) ||
        (e.ctrlKey && e.key === 'n')
      ) {
        e.preventDefault()
        e.stopPropagation()

        selectedRef.current = Math.max(
          Math.min(selectedRef.current + 1, menusRef.current.length - 1),
          0
        )
        update()
      }

      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', cb)
    return () => window.removeEventListener('keydown', cb)
  }, [])

  return {
    menus: menusRef.current,
    selected: selectedRef.current,
  }
}

// based on the input rules code in Prosemirror, here:
// https://github.com/ProseMirror/prosemirror-inputrules/blob/master/src/inputrules.js
export function run(
  view: EditorView,
  from: number,
  to: number,
  regex: RegExp,
  handler: (
    state: EditorState,
    match: RegExpExecArray | null,
    from: number,
    to: number
  ) => boolean | Transaction | null
) {
  if (view.composing) {
    return false
  }
  const state = view.state
  const $from = state.doc.resolve(from)
  if ($from.parent.type.spec.code) {
    return false
  }

  const textBefore = $from.parent.textBetween(
    Math.max(0, $from.parentOffset - MAX_MATCH),
    $from.parentOffset,
    undefined,
    '\ufffc'
  )

  const match = regex.exec(textBefore)
  const tr = handler(state, match, match ? from - match[0].length : from, to)
  if (!tr) return false
  return true
}
