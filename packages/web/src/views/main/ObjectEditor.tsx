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

import { DeleteOutlined, LoadingOutlined, MoreOutlined } from '@ant-design/icons'
import styled from '@emotion/styled'
import Editor, {
  baseKeymap,
  Blockquote,
  Bold,
  BulletList,
  Code,
  CodeBlock,
  Doc,
  dropCursor,
  DropPasteFile,
  gapCursor,
  Heading,
  Highlight,
  history,
  ImageBlock,
  Italic,
  keymap,
  Link,
  Math,
  OrderedList,
  Paragraph,
  Plugins,
  redo,
  State,
  Strikethrough,
  Text,
  TodoList,
  Underline,
  undo,
  undoInputRule,
  Value,
} from '@paper/editor'
import { ProsemirrorNode } from '@paper/editor/src/Editor/lib/Node'
import { Button, Dropdown, Menu, message, Spin } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toString } from 'uint8arrays'
import { useHeaderActionsCtrl } from '../../components/AppBar'
import { useAccount } from '../../state/account'
import useOnSave from '../../utils/useOnSave'
import { usePrompt } from '../../utils/usePrompt'
import {
  useCreateObject,
  useDeleteObject,
  useObjectUriQuery,
  useObject,
  useUpdateObject,
} from './apollo'

export default function ObjectEditor() {
  const { userId, objectId } = useParams()
  if (!userId) {
    throw new Error('Missing required params `userId`')
  }
  if (!objectId) {
    throw new Error('Missing required params `objectId`')
  }

  const object = useObject({ variables: { userId, objectId } })

  if (object.error) {
    throw object.error
  } else if (object.loading) {
    return (
      <_Loading>
        <Spin indicator={<LoadingOutlined spin />} />
      </_Loading>
    )
  } else if (object.data) {
    return <_ObjectEditor object={object.data.user.object} />
  }
  return null
}

const _Loading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 40vh;
`

const _ObjectEditor = ({ object }: { object: { id: string; userId: string; data?: string } }) => {
  const account = useAccount()
  const [updateObject] = useUpdateObject()
  const [doc, setDoc] = useState<ProsemirrorNode>()
  const [changed, setChanged] = useState(false)

  useEffect(() => {
    setChanged(false)
  }, [object])

  useOnSave(() => {
    if (!doc) {
      return
    }
    const data = JSON.stringify(doc.toJSON())
    setChanged(false)
    updateObject({
      variables: {
        objectId: object.id,
        input: { meta: { title: doc.content.maybeChild(0)?.textContent }, data },
      },
    })
      .then(() => {
        message.success('Save Success')
      })
      .catch(error => {
        message.error(error.message)
        throw error
      })
  }, [object, doc])

  usePrompt('Discard changes?', changed)

  const [createFileObject] = useCreateObject()
  const [queryFileObjectUri] = useObjectUriQuery()

  const state = useMemo(() => {
    return new State({
      nodes: [
        new Doc(),
        new Text(),
        new Paragraph(),
        new Heading(),
        new Blockquote(),
        new OrderedList(),
        new BulletList(),
        new Math(),
        new ImageBlock({
          upload: async file => {
            const data = toString(new Uint8Array(await file.arrayBuffer()), 'base64')
            const res = await createFileObject({
              variables: {
                parentId: object.id,
                input: {
                  meta: { type: 'image' },
                  data,
                  encoding: 'BASE64',
                },
              },
            })
            if (res.errors || !res.data) {
              throw new Error(res.errors?.[0]?.message || 'upload file failed')
            }
            return res.data.createObject.id
          },
          source: async src => {
            const res = await queryFileObjectUri({ variables: { objectId: src } })
            if (!res.data || res.error) {
              throw res.error || new Error('query object cid failed')
            }
            const uri = res.data.viewer.object.uri
            if (!uri) {
              throw new Error('object cid not found')
            }
            return uri
          },
          thumbnail: { maxSize: 1024 },
        }),
        new CodeBlock(),
        new TodoList(),
      ],
      marks: [
        new Bold(),
        new Code(),
        new Highlight(),
        new Italic(),
        new Link(),
        new Strikethrough(),
        new Underline(),
      ],
      extensions: [
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
        new Value({
          defaultValue: object.data ? JSON.parse(object.data) : undefined,
          onDispatchTransaction: (view, tr) => {
            if (tr.docChanged) {
              setDoc(view.state.doc)
              setChanged(true)
            }
          },
        }),
        new DropPasteFile({
          create: (view, file) => {
            const imageBlock = view.state.schema.nodes['image_block']
            if (imageBlock && file.type.startsWith('image/')) {
              return ImageBlock.create(view.state.schema, file, imageBlock.spec.options)
            }
            return
          },
        }),
      ],
    })
  }, [object])

  return (
    <_Container>
      {account?.id === object.userId && <ObjectMenu object={object} />}

      <_Editor state={state} />
    </_Container>
  )
}

const _Container = styled.div`
  max-width: 800px;
  margin: auto;
`

const _Editor = styled(Editor)`
  min-height: calc(100vh - 100px);
`

const ObjectMenu = ({ object }: { object: { id: string } }) => {
  const headerCtl = useHeaderActionsCtrl()
  const navigate = useNavigate()
  const [deleteObject] = useDeleteObject()

  useEffect(() => {
    const menu = (
      <Menu>
        <Menu.Item
          key="logout"
          icon={<DeleteOutlined />}
          onClick={() => {
            deleteObject({ variables: { objectId: object.id } })
              .then(() => {
                message.success('Deleted')
                navigate('/me', { replace: true })
              })
              .catch(error => {
                message.error(error.message)
                throw error
              })
          }}
        >
          Move To Trash
        </Menu.Item>
      </Menu>
    )

    const action = {
      key: 'objectHeaderAction',
      component: () => (
        <Dropdown overlay={menu} trigger={['click']} arrow>
          <Button type="link" shape="circle">
            <MoreOutlined />
          </Button>
        </Dropdown>
      ),
      props: {},
    }

    headerCtl.append(action)

    return () => {
      headerCtl.remove(action)
    }
  }, [object])

  return null
}
