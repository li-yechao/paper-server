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

import Editor, { EditorState } from '@paper/editor'
import Bold from '@paper/editor/src/Editor/marks/Bold'
import Code from '@paper/editor/src/Editor/marks/Code'
import Highlight from '@paper/editor/src/Editor/marks/Highlight'
import Italic from '@paper/editor/src/Editor/marks/Italic'
import Link from '@paper/editor/src/Editor/marks/Link'
import Strikethrough from '@paper/editor/src/Editor/marks/Strikethrough'
import Underline from '@paper/editor/src/Editor/marks/Underline'
import Blockquote from '@paper/editor/src/Editor/nodes/Blockquote'
import BulletList from '@paper/editor/src/Editor/nodes/BulletList'
import CodeBlock from '@paper/editor/src/Editor/nodes/CodeBlock'
import Doc from '@paper/editor/src/Editor/nodes/Doc'
import ImageBlock, { ImageBlockOptions } from '@paper/editor/src/Editor/nodes/ImageBlock'
import Heading from '@paper/editor/src/Editor/nodes/Heading'
import Math from '@paper/editor/src/Editor/nodes/Math'
import OrderedList from '@paper/editor/src/Editor/nodes/OrderedList'
import Paragraph from '@paper/editor/src/Editor/nodes/Paragraph'
import TagList from '@paper/editor/src/Editor/nodes/TagList'
import Text from '@paper/editor/src/Editor/nodes/Text'
import Title from '@paper/editor/src/Editor/nodes/Title'
import TodoList from '@paper/editor/src/Editor/nodes/TodoList'
import DropPasteFile from '@paper/editor/src/Editor/plugins/DropPasteFile'
import Placeholder from '@paper/editor/src/Editor/plugins/Placeholder'
import Plugins from '@paper/editor/src/Editor/plugins/Plugins'
import Value from '@paper/editor/src/Editor/plugins/Value'
import { baseKeymap } from 'prosemirror-commands'
import { dropCursor } from 'prosemirror-dropcursor'
import { gapCursor } from 'prosemirror-gapcursor'
import { history, redo, undo } from 'prosemirror-history'
import { undoInputRule } from 'prosemirror-inputrules'
import { keymap } from 'prosemirror-keymap'
import { useRef } from 'react'
import { Prompt, RouteComponentProps } from 'react-router'
import { useRecoilValue } from 'recoil'
import { accountSelector } from '../../../state/account'
import { usePaper } from '../../../state/paper'
import useOnSave from '../../../utils/useOnSave'
import styled from '@emotion/styled'
import { useBeforeUnload } from 'react-use'
import useAsync from '../../../utils/useAsync'
import NetworkIndicator from '../../../components/NetworkIndicator'

export interface ObjectViewProps
  extends RouteComponentProps<{
    userId: string
    objectId: string
  }> {}

export default function ObjectView(props: ObjectViewProps) {
  const { userId, objectId } = props.match.params
  const account = useRecoilValue(accountSelector)
  if (account.userId !== userId) {
    throw new Error('Forbidden')
  }
  const { paper } = usePaper({ account, objectId })

  const ref = useRef<{ state?: EditorState; version: number; savedVersion: number }>({
    state: undefined,
    version: 0,
    savedVersion: 0,
  })

  const extensions = useAsync(async () => {
    const content = await paper.getContent()

    const uploadOptions: ImageBlockOptions = {
      upload: async (file: File) => {
        const files = [new File([file], 'image'), new File([file], `original/${file.name}`)]
        return paper.addResource(files)
      },
      getSrc: async cid => {
        const file = await paper.getResource(cid, 'image')
        return URL.createObjectURL(file)
      },
      thumbnail: {
        maxSize: 1024,
      },
    }

    const imageBlock = new ImageBlock(uploadOptions)

    return [
      new Value({
        defaultValue: content,
        editable: true,
        onDispatchTransaction: (view, tr) => {
          if (tr.docChanged) {
            ref.current.version += 1
            ref.current.state = view.state
            document.title = document.title.replace(/^\**/, '*')
          }
        },
      }),

      new Placeholder(),
      new Doc('title tag_list block+'),
      new Text(),
      new Title(),
      new Paragraph(),
      new Heading(),
      new TagList(),
      new Blockquote(),
      new TodoList(),
      new OrderedList(),
      new BulletList(),
      new CodeBlock(),
      new Math(),

      new Bold(),
      new Italic(),
      new Underline(),
      new Strikethrough(),
      new Highlight(),
      new Code(),
      new Link(),

      new Plugins([
        keymap({
          'Mod-z': undo,
          'Shift-Mod-z': redo,
          'Mod-y': redo,
          Backspace: undoInputRule,
        }),
        keymap(baseKeymap),
        history(),
        gapCursor(),
        dropCursor({ color: 'currentColor' }),
      ]),

      imageBlock,

      new DropPasteFile({
        fileToNode: (view, file) => {
          if (imageBlock && file.type.startsWith('image/')) {
            return imageBlock.create(view.state.schema, file)
          }
        },
      }),
    ]
  }, [paper])

  const save = async () => {
    const { state, version, savedVersion } = ref.current
    if (paper && state && version !== savedVersion) {
      let title: string | undefined
      const firstChild = state.doc.firstChild
      if (firstChild?.type.name === 'title') {
        title = firstChild.textContent
      }

      const tags: string[] = []
      const tagList = state.doc.maybeChild(1)
      if (tagList?.type.name === 'tag_list') {
        tagList.forEach(node => {
          const tag = node.textContent.trim()
          tag && tags.push(tag)
        })
      }

      await paper.setContent(state.doc.toJSON())
      await paper.setInfo({ title, tags })

      ref.current.savedVersion = version
      document.title = document.title.replace(/^\**/, '')
    }
  }

  useOnSave(save, [save])

  useBeforeUnload(() => {
    return ref.current.version !== ref.current.savedVersion
  }, 'Discard changes?')

  if (extensions.error) {
    throw extensions.error
  }

  return (
    <>
      <Prompt
        message={() =>
          ref.current.savedVersion !== ref.current.version ? 'Discard changes' : true
        }
      />
      {extensions.loading ? <NetworkIndicator in /> : <_Editor extensions={extensions.value} />}
    </>
  )
}

const _Editor = styled(Editor)`
  min-height: 100vh;
  padding: 8px;
  padding-bottom: 100px;
  max-width: 800px;
  margin: auto;
`
