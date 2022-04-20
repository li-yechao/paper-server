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
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { LinkNode } from '@lexical/link'
import { ListItemNode, ListNode } from '@lexical/list'
import LexicalComposer from '@lexical/react/LexicalComposer'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import LexicalContentEditable from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import LexicalLinkPlugin from '@lexical/react/LexicalLinkPlugin'
import LexicalMarkdownShortcutPlugin from '@lexical/react/LexicalMarkdownShortcutPlugin'
import LexicalRichTextPlugin from '@lexical/react/LexicalRichTextPlugin'
import LexicalTablePlugin from '@lexical/react/LexicalTablePlugin'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { EquationNode } from '@paper/lexical/src/nodes/EquationNode'
import { ImageNode } from '@paper/lexical/src/nodes/ImageNode'
import CodeHighlightPlugin from '@paper/lexical/src/plugins/CodeHighlightPlugin'
import FloatingToolbarPlugin, {
  ToggleBlockButton,
  ToggleFormatButton,
  ToggleLinkButton,
} from '@paper/lexical/src/plugins/FloatingToolbarPlugin'
import ImagePlugin from '@paper/lexical/src/plugins/ImagePlugin'
import TableActionMenuPlugin from '@paper/lexical/src/plugins/TableActionMenuPlugin'
import initialEditorStateFromProsemirrorDoc from '@paper/lexical/src/prosemirror/initialEditorStateFromProsemirrorDoc'
import theme from '@paper/lexical/src/themes/theme'
import { $getRoot, CLEAR_HISTORY_COMMAND, EditorState } from 'lexical'
import { ComponentProps, useEffect, useMemo, useRef } from 'react'

export interface LexicalEditorProps {
  className?: string
  defaultValue?: string
  readOnly?: boolean
  onChange?: (editorState: EditorState) => void
}

export default function LexicalEditor(props: LexicalEditorProps) {
  const initialConfig = useMemo<ComponentProps<typeof LexicalComposer>['initialConfig']>(
    () => ({
      readOnly: props.readOnly,
      nodes: [
        HeadingNode,
        QuoteNode,
        ListNode,
        ListItemNode,
        LinkNode,
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
    }),
    [props.readOnly]
  )

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <EditorContainer className={props.className}>
        <LexicalRichTextPlugin
          contentEditable={<ContentEditable testid="lexical-editor" />}
          placeholder={<Placeholder>Input something...</Placeholder>}
        />
        <ValuePlugin defaultValue={props.defaultValue} onChange={props.onChange} />
        <LexicalLinkPlugin />
        <CodeHighlightPlugin />
        <LexicalMarkdownShortcutPlugin />
        <HistoryPlugin />

        <ImagePlugin />
        <LexicalTablePlugin />
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

function ValuePlugin({
  defaultValue,
  onChange,
}: {
  defaultValue?: string
  onChange?: (editorState: EditorState) => void
}) {
  const inited = useRef(false)

  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (onChange) {
      return editor.registerUpdateListener(({ editorState, dirtyElements, dirtyLeaves }) => {
        if (!inited.current) {
          return
        }

        if (dirtyElements.size === 0 && dirtyLeaves.size === 0) {
          return
        }

        onChange(editorState)
      })
    }
    return
  }, [editor, onChange])

  useEffect(() => {
    setTimeout(() => {
      if (defaultValue) {
        let json
        try {
          json = JSON.parse(defaultValue || '{}')
        } catch {}

        if (json.type === 'doc') {
          editor.update(() => {
            initialEditorStateFromProsemirrorDoc($getRoot(), defaultValue)
          })
        } else if (json._nodeMap) {
          const editorState = editor.parseEditorState(defaultValue)
          editor.setEditorState(editorState)
        }
      }
      editor.dispatchCommand(CLEAR_HISTORY_COMMAND, null)
      inited.current = true
      onChange?.(editor.getEditorState())
    })
  }, [editor])

  return null
}

const EditorContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
`

const ContentEditable = styled(LexicalContentEditable)`
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
