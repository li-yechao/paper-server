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
import { $createCodeNode, CodeHighlightNode, CodeNode } from '@lexical/code'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { $createListItemNode, $createListNode, ListItemNode, ListNode } from '@lexical/list'
import { CHECK_LIST, TRANSFORMERS } from '@lexical/markdown'
import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin'
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { TablePlugin } from '@lexical/react/LexicalTablePlugin'
import { $createHeadingNode, $createQuoteNode, HeadingNode, QuoteNode } from '@lexical/rich-text'
import {
  $createTableNodeWithDimensions,
  TableCellNode,
  TableNode,
  TableRowNode,
} from '@lexical/table'
import BlockQuote from '@paper/lexical/src/icons/BlockQuote'
import BulletList from '@paper/lexical/src/icons/BulletList'
import Code from '@paper/lexical/src/icons/Code'
import Heading1 from '@paper/lexical/src/icons/Heading1'
import Heading2 from '@paper/lexical/src/icons/Heading2'
import Heading3 from '@paper/lexical/src/icons/Heading3'
import Image from '@paper/lexical/src/icons/Image'
import Math from '@paper/lexical/src/icons/Math'
import OrderedList from '@paper/lexical/src/icons/OrderedList'
import Table from '@paper/lexical/src/icons/Table'
import TodoList from '@paper/lexical/src/icons/TodoList'
import {
  $createEquationNode,
  $isEquationNode,
  EquationNode,
} from '@paper/lexical/src/nodes/EquationNode'
import { $createImageNode, ImageNode } from '@paper/lexical/src/nodes/ImageNode'
import BlockMenuPlugin, {
  BlockMenuCommand,
  replaceWithNode,
} from '@paper/lexical/src/plugins/BlockMenuPlugin'
import CodeHighlightPlugin from '@paper/lexical/src/plugins/CodeHighlightPlugin'
import FloatingToolbarPlugin, {
  ToggleBlockButton,
  ToggleFormatButton,
  ToggleLinkButton,
} from '@paper/lexical/src/plugins/FloatingToolbarPlugin'
import ImagePlugin from '@paper/lexical/src/plugins/ImagePlugin'
import TableActionMenuPlugin from '@paper/lexical/src/plugins/TableActionMenuPlugin'
import TrailingParagraphPlugin from '@paper/lexical/src/plugins/TrailingParagraphPlugin'
import theme from '@paper/lexical/src/themes/theme'
import { $createParagraphNode, EditorState, LexicalNode } from 'lexical'
import { ChangeEventHandler, ComponentProps, useCallback, useEffect, useMemo, useRef } from 'react'

export interface LexicalEditorProps {
  className?: string
  defaultValue?: string
  readOnly?: boolean
  onChange?: (editorState: EditorState) => void
}

export default function LexicalEditor(props: LexicalEditorProps) {
  const imageInput = useRef<HTMLInputElement>(null)

  const onImageInputChange = useRef<ChangeEventHandler<HTMLInputElement>>()

  const handleImageInputChange = useCallback<ChangeEventHandler<HTMLInputElement>>(e => {
    onImageInputChange.current?.(e)
  }, [])

  const initialConfig = useMemo<ComponentProps<typeof LexicalComposer>['initialConfig']>(
    () => ({
      namespace: 'editor',
      readOnly: props.readOnly,
      nodes: [
        HeadingNode,
        QuoteNode,
        ListNode,
        ListItemNode,
        LinkNode,
        AutoLinkNode,
        CodeNode,
        CodeHighlightNode,
        TableNode,
        TableRowNode,
        TableCellNode,
        ImageNode,
        EquationNode,
      ],
      theme,
      onError: e => {
        throw e
      },
      editorState: props.defaultValue,
    }),
    [props.readOnly]
  )

  const autoLinkMatchers = useMemo(() => {
    const URL_MATCHER =
      /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/

    const EMAIL_MATCHER =
      /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/

    return [
      (text: string) => {
        const match = URL_MATCHER.exec(text)
        return match?.[0]
          ? {
              index: match.index,
              length: match[0].length,
              text: match[0],
              url: match[0],
            }
          : null
      },
      (text: string) => {
        const match = EMAIL_MATCHER.exec(text)
        return match?.[0]
          ? {
              index: match.index,
              length: match[0].length,
              text: match[0],
              url: `mailto:${match[0]}`,
            }
          : null
      },
    ]
  }, [])

  const blockMenuCommands = useMemo<BlockMenuCommand[]>(() => {
    return [
      {
        icon: <Heading1 />,
        title: 'Heading1',
        action: editor => replaceWithNode(editor, () => $createHeadingNode('h1')),
      },
      {
        icon: <Heading2 />,
        title: 'Heading2',
        action: editor => replaceWithNode(editor, () => $createHeadingNode('h2')),
      },
      {
        icon: <Heading3 />,
        title: 'Heading3',
        action: editor => replaceWithNode(editor, () => $createHeadingNode('h3')),
      },
      {
        icon: <BlockQuote />,
        title: 'Quote',
        action: editor => replaceWithNode(editor, () => $createQuoteNode()),
      },
      {
        icon: <Code />,
        title: 'Code',
        action: editor => replaceWithNode(editor, () => $createCodeNode()),
      },
      {
        icon: <OrderedList />,
        title: 'Ordered List',
        action: editor =>
          replaceWithNode(editor, () => $createListNode('number').append($createListItemNode())),
      },
      {
        icon: <BulletList />,
        title: 'Bullet List',
        action: editor =>
          replaceWithNode(editor, () => $createListNode('bullet').append($createListItemNode())),
      },
      {
        icon: <TodoList />,
        title: 'Todo List',
        action: editor =>
          replaceWithNode(editor, () => $createListNode('check').append($createListItemNode())),
      },
      {
        icon: <Image />,
        title: 'Image ',
        action: editor => {
          onImageInputChange.current = e => {
            const { files } = e.target
            if (files?.length) {
              replaceWithNode(editor, () =>
                $createParagraphNode().append(
                  ...Array.from(files).map(file => $createImageNode({ file }))
                )
              )
            }
          }
          imageInput.current?.click()
        },
      },
      {
        icon: <Table />,
        title: 'Table',
        action: editor => replaceWithNode(editor, () => $createTableNodeWithDimensions(3, 3, true)),
      },
      {
        icon: <Math />,
        title: 'Equation',
        action: editor =>
          replaceWithNode(editor, () =>
            $createParagraphNode().append($createEquationNode('', true))
          ),
      },
      {
        icon: <Math />,
        title: 'Equation Block',
        action: editor =>
          replaceWithNode(editor, () =>
            $createParagraphNode().append($createEquationNode('', false))
          ),
      },
    ]
  }, [])

  const transformers = useMemo<
    ComponentProps<typeof MarkdownShortcutPlugin>['transformers']
  >(() => {
    const exportEquation = (node: LexicalNode) => {
      if (!$isEquationNode(node)) {
        return null
      }
      const inline = node.getInline()
      const equation = node.getEquation()
      if (inline) {
        return `$${equation}$`
      } else {
        return `$$${equation}$$`
      }
    }

    return [
      CHECK_LIST,
      ...TRANSFORMERS,
      {
        export: exportEquation,
        importRegExp: /\$(\S+)\$/,
        regExp: /\$(.+)\$$/,
        replace: (textNode, match) => {
          textNode.replace($createEquationNode(match[1], true))
        },
        trigger: '$',
        type: 'text-match',
      },
      {
        export: exportEquation,
        regExp: /^\$\$\s/,
        replace: parentNode => {
          parentNode.replace($createParagraphNode().append($createEquationNode('', false)))
        },
        type: 'element',
      },
    ]
  }, [])

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <_ImageInput
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageInputChange}
        ref={imageInput}
      />

      <EditorContainer className={props.className}>
        <RichTextPlugin
          contentEditable={<_ContentEditable testid="lexical-editor" />}
          placeholder={<Placeholder>Input something...</Placeholder>}
        />
        {props.onChange && <OnChangePlugin onChange={props.onChange} />}
        <AutoLinkPlugin matchers={autoLinkMatchers} />
        <LinkPlugin />
        <CodeHighlightPlugin />
        <MarkdownShortcutPlugin transformers={transformers} />
        <ListPlugin />
        <CheckListPlugin />
        <HistoryPlugin />

        <NoAutoFocusPlugin />
        <TrailingParagraphPlugin />
        <BlockMenuPlugin commands={blockMenuCommands} />
        <ImagePlugin />
        <TablePlugin />
        <TableActionMenuPlugin />
        <FloatingToolbarPlugin>
          <ToggleFormatButton type="bold" />
          <ToggleFormatButton type="italic" />
          <ToggleFormatButton type="underline" />
          <ToggleFormatButton type="strikethrough" />
          <ToggleFormatButton type="code" />
          <ToggleLinkButton />
          <ToggleBlockButton type="h1" />
          <ToggleBlockButton type="h2" />
          <ToggleBlockButton type="h3" />
          <ToggleBlockButton type="quote" />
          <ToggleBlockButton type="ol" />
          <ToggleBlockButton type="ul" />

          <FloatingToolbarPlugin.Extras>
            <ToggleLinkButton.Extra />
          </FloatingToolbarPlugin.Extras>
        </FloatingToolbarPlugin>
      </EditorContainer>
    </LexicalComposer>
  )
}

const NoAutoFocusPlugin = () => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    setTimeout(() => {
      editor.blur()
    })
  }, [editor])

  return null
}

const EditorContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
`

const _ImageInput = styled.input`
  position: fixed;
  left: -1000px;
  top: 0;
`

const _ContentEditable = styled(ContentEditable)`
  outline: none;
  flex-grow: 1;
`

const Placeholder = styled.div`
  font-size: 14px;
  color: #999;
  overflow: hidden;
  position: absolute;
  text-overflow: ellipsis;
  left: 0;
  user-select: none;
  white-space: nowrap;
  display: inline-block;
  pointer-events: none;
`
