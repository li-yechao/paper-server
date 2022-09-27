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
import { $isLinkNode, LinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import {
  $createListItemNode,
  $createListNode,
  $isListItemNode,
  $isListNode,
  ListItemNode,
  ListNode,
} from '@lexical/list'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  HeadingNode,
} from '@lexical/rich-text'
import { $isAtNodeEnd, $wrapNodes } from '@lexical/selection'
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  ElementNode,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
  RangeSelection,
  TextNode,
} from 'lexical'
import {
  ButtonHTMLAttributes,
  Children,
  DetailedHTMLProps,
  InputHTMLAttributes,
  ReactChild,
  ReactFragment,
  ReactNode,
  ReactPortal,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { usePopper } from 'react-popper'
import BlockQuote from '../icons/BlockQuote'
import BulletList from '../icons/BulletList'
import CodeTags from '../icons/CodeTags'
import FormatBold from '../icons/FormatBold'
import FormatItalic from '../icons/FormatItalic'
import FormatStrikethrough from '../icons/FormatStrikethrough'
import FormatUnderlined from '../icons/FormatUnderlined'
import Heading1 from '../icons/Heading1'
import Heading2 from '../icons/Heading2'
import Heading3 from '../icons/Heading3'
import Launch from '../icons/Launch'
import Link from '../icons/Link'
import OrderedList from '../icons/OrderedList'

export interface FloatingToolbarPluginProps {
  children?: ReactNode
}

export default function FloatingToolbarPlugin(props: FloatingToolbarPluginProps) {
  const [open, setOpen] = useState(false)
  const [editor] = useLexicalComposerContext()
  const enabled = useEnabled(editor)

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const nativeSelection = window.getSelection()
        if (nativeSelection?.rangeCount && !nativeSelection.isCollapsed) {
          setOpen(true)
        } else {
          setOpen(false)
        }
      })
    })
  }, [editor])

  if (!open) {
    return null
  }

  return <FloatingToolbar {...props} enabled={enabled} />
}

function useEnabled(editor: LexicalEditor) {
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    const editorElement = editor.getRootElement()

    const handleMouseDown = () => {
      setEnabled(false)
    }
    const handleMouseUp = () => {
      setEnabled(true)
    }

    editorElement?.addEventListener('mousedown', handleMouseDown, true)
    window.addEventListener('mouseup', handleMouseUp, true)

    return () => {
      editorElement?.removeEventListener('mousedown', handleMouseDown, true)
      window.removeEventListener('mouseup', handleMouseUp, true)
    }
  }, [editor])

  return enabled
}

function FloatingToolbar(props: FloatingToolbarPluginProps & { enabled?: boolean }) {
  const [editor] = useLexicalComposerContext()

  const virtualElement = useRef<{ getBoundingClientRect: () => DOMRect }>({
    getBoundingClientRect: () => {
      const nativeSelection = window.getSelection()
      if (nativeSelection?.rangeCount && !nativeSelection.isCollapsed) {
        const domRange = nativeSelection.getRangeAt(0)
        return domRange.getBoundingClientRect()
      }
      return { left: -1000, top: -1000, width: 0, height: 0 } as any
    },
  })

  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null)
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null)
  const { styles, attributes, update } = usePopper(virtualElement.current, popperElement, {
    modifiers: [
      { name: 'flip', enabled: true },
      { name: 'arrow', options: { element: arrowElement } },
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

  const extras: (ReactChild | ReactFragment | ReactPortal)[] = []
  const buttons = Children.toArray(props.children).filter(i => {
    if ((i as any).type === FloatingToolbarPlugin.Extras) {
      extras.push(i)
      return false
    }
    return true
  })

  return createPortal(
    <_Toolbar
      ref={setPopperElement}
      style={styles['popper']}
      {...attributes['popper']}
      className={cx(props.enabled && 'available')}
    >
      <div ref={setArrowElement} className="arrow" style={styles['arrow']} />

      <_Buttons>{buttons}</_Buttons>
      <div>{extras}</div>
    </_Toolbar>,
    document.body
  )
}

const _Toolbar = styled.div`
  position: relative;
  background-color: #ffffff;
  box-shadow: 0 5px 10px #0000004d;
  border-radius: 8px;
  pointer-events: none;

  &.available {
    pointer-events: all;
  }

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
      box-shadow: 0 0 1px #0000004d;
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

const _Buttons = styled.div`
  border-radius: 8px;
  overflow: hidden;
  padding: 4px;
`

export function Button(
  props: { active?: boolean } & DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
) {
  return <_Button {...props} />
}

const _Button = styled.button<{ active?: boolean }>`
  border: 0;
  background: none;
  padding: 4px;
  border-radius: 8px;
  cursor: pointer;
  vertical-align: middle;
  background-color: ${props => (props.active ? 'rgba(0, 0, 0, 0.05)' : 'transparent')};
  color: ${props => (props.active ? '#333333' : '#888888')};

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    background-color: rgba(0, 0, 0, 0.02);
    color: rgba(0, 0, 0, 0.3);
    cursor: not-allowed;
  }

  & + button {
    margin-left: 4px;
  }

  > svg {
    font-size: 20px;
  }
`

export function ToggleFormatButton({
  type,
}: {
  type: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code'
}) {
  const [editor] = useLexicalComposerContext()
  const [active, setActive] = useState(false)

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection()

        if ($isRangeSelection(selection)) {
          setActive(selection.hasFormat(type))
        } else {
          setActive(false)
        }
      })
    })
  }, [editor, type])

  const toggleActive = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, type)
  }, [editor, type])

  const icon = {
    bold: <FormatBold />,
    italic: <FormatItalic />,
    underline: <FormatUnderlined />,
    strikethrough: <FormatStrikethrough />,
    code: <CodeTags />,
  }[type]

  return (
    <Button active={active} onClick={toggleActive}>
      {icon}
    </Button>
  )
}

FloatingToolbarPlugin.Extras = ({ children }: { children?: ReactNode }) => {
  return <>{children}</>
}

export function ToggleLinkButton() {
  const [editor] = useLexicalComposerContext()
  const [active, setActive] = useState(false)

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection()

        if ($isRangeSelection(selection)) {
          const node = getSelectedNode(selection)
          setActive($isLinkNode(node) || $isLinkNode(node.getParent()))
        } else {
          setActive(false)
        }
      })
    })
  }, [editor])

  const toggleLink = useCallback(() => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, active ? null : 'https://')
  }, [editor, active])

  return (
    <Button active={active} onClick={toggleLink}>
      <Link />
    </Button>
  )
}

ToggleLinkButton.Extra = () => {
  const [editor] = useLexicalComposerContext()
  const [active, setActive] = useState(false)
  const [url, setUrl] = useState('')

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection()

        let link: LinkNode | undefined

        if ($isRangeSelection(selection)) {
          const node = getSelectedNode(selection)
          const parent = node.getParent()
          if ($isLinkNode(parent)) {
            link = parent as any
          } else if ($isLinkNode(node)) {
            link = node as any
          }
        }

        setUrl(link?.getURL() || '')
        setActive(!!link)
      })
    })
  }, [editor])

  if (!active) {
    return null
  }

  return (
    <Input
      placeholder="https://"
      value={url}
      onChange={e => setUrl(e.target.value)}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          e.preventDefault()
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
        }
      }}
      button={
        <Button disabled={!url} onClick={() => window.open(url, '__blank')}>
          <Launch />
        </Button>
      }
    />
  )
}

export function Input({
  button,
  ...props
}: { button?: ReactNode } & DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>) {
  return (
    <_InputWrapper>
      <_InputContent>
        <_Input {...props} />

        {button && <_InputIcon>{button}</_InputIcon>}
      </_InputContent>
    </_InputWrapper>
  )
}

const _Input = styled.input`
  display: block;
  height: 28px;
  line-height: 28px;
  border-radius: 28px;
  padding: 0 16px;
  outline: none;
  border: none;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.1);
`

const _InputWrapper = styled.div`
  padding: 4px 8px;
  overflow: hidden;
`

const _InputContent = styled.div`
  display: flex;
  align-items: center;
  overflow: hidden;
`

const _InputIcon = styled.div`
  margin-left: 8px;
  color: #999999;
`

function getSelectedNode(selection: RangeSelection): TextNode | ElementNode {
  const anchor = selection.anchor
  const focus = selection.focus
  const anchorNode = selection.anchor.getNode()
  const focusNode = selection.focus.getNode()
  if (anchorNode === focusNode) {
    return anchorNode
  }
  const isBackward = selection.isBackward()
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode
  } else {
    return $isAtNodeEnd(anchor) ? focusNode : anchorNode
  }
}

export function ToggleBlockButton({ type }: { type: 'h1' | 'h2' | 'h3' | 'quote' | 'ol' | 'ul' }) {
  const [editor] = useLexicalComposerContext()
  const [active, setActive] = useState(false)

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection()
        let active = false

        if ($isRangeSelection(selection)) {
          const node = getSelectedNode(selection).getParent()
          if (node) {
            if (type === 'h1' || type === 'h2' || type === 'h3') {
              if ($isHeadingNode(node)) {
                const heading = node as any as HeadingNode
                active = heading.getTag() === type
              }
            } else if (type === 'quote') {
              active = $isQuoteNode(node) || $isQuoteNode(node.getParent())
            } else if (type === 'ol' || type === 'ul') {
              if ($isListItemNode(node)) {
                const li = node as ListItemNode
                const p = li.getParent()
                if (p && $isListNode(p)) {
                  const list = p as ListNode
                  active = list.getTag() === type
                }
              }
            }
          }
        }

        setActive(active)
      })
    })
  }, [editor, type])

  const toggleActive = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection()

      if ($isRangeSelection(selection)) {
        if (active) {
          $wrapNodes(selection, () => $createParagraphNode())
        } else {
          if (type === 'h1' || type === 'h2' || type === 'h3') {
            $wrapNodes(selection, () => $createHeadingNode(type) as any)
          } else if (type === 'quote') {
            $wrapNodes(selection, () => $createQuoteNode() as any)
          } else if (type === 'ol' || type === 'ul') {
            $wrapNodes(
              selection,
              () => $createListItemNode(),
              $createListNode(type === 'ol' ? 'number' : 'bullet')
            )
          }
        }
      }
    })
  }, [editor, type, active])

  const icon = {
    h1: <Heading1 />,
    h2: <Heading2 />,
    h3: <Heading3 />,
    quote: <BlockQuote />,
    ol: <OrderedList />,
    ul: <BulletList />,
  }[type]

  return (
    <Button active={active} onClick={toggleActive}>
      {icon}
    </Button>
  )
}
