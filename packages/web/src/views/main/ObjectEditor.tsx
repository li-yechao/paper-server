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
import {
  gql,
  LazyQueryHookOptions,
  MutationHookOptions,
  QueryHookOptions,
  useLazyQuery,
  useMutation,
  useQuery,
} from '@apollo/client'
import styled from '@emotion/styled'
import Editor, {
  baseKeymap,
  Blockquote,
  Bold,
  BulletList,
  Code,
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
  Underline,
  undo,
  undoInputRule,
  Value,
} from '@paper/editor'
import { ProsemirrorNode } from '@paper/editor/src/Editor/lib/Node'
import { Button, Dropdown, Menu, message, Spin } from 'antd'
import produce from 'immer'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toString } from 'uint8arrays'
import { useHeaderActionsCtrl } from '../../components/AppBar'
import useOnSave from '../../utils/useOnSave'
import { usePrompt } from '../../utils/usePrompt'

export default function ObjectEditor({ objectId }: { objectId: string }) {
  const object = useObject({ variables: { objectId } })

  if (object.error) {
    throw object.error
  } else if (object.loading) {
    return (
      <_Loading>
        <Spin indicator={<LoadingOutlined spin />} />
      </_Loading>
    )
  } else if (object.data) {
    return <_ObjectEditor object={object.data.viewer.object} />
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

const _ObjectEditor = ({ object }: { object: { id: string; data?: string } }) => {
  const headerCtl = useHeaderActionsCtrl()
  const navigate = useNavigate()
  const [updateObject] = useUpdateObject()
  const [deleteObject] = useDeleteObject()
  const [doc, setDoc] = useState<ProsemirrorNode>()
  const [changed, setChanged] = useState(false)

  useEffect(() => {
    const menu = (
      <Menu>
        <Menu.Item
          key="logout"
          icon={<DeleteOutlined />}
          onClick={() => {
            deleteObject({ variables: { objectId: object.id } })
              .then(() => {
                message.success('删除成功')
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
          <Button type="link">
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

  const [createObject] = useCreateObject()
  const [queryObjectCid] = useObjectUriLazy()

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
            const res = await createObject({
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
            const res = await queryObjectCid({ variables: { objectId: src } })
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

  return <_Editor state={state} />
}

const _Editor = styled(Editor)`
  min-height: calc(100vh - 100px);
`

const OBJECT_QUERY = gql`
  query Object($objectId: String!) {
    viewer {
      id

      object(objectId: $objectId) {
        id
        createdAt
        updatedAt
        meta
        data
      }
    }
  }
`

const useObject = (
  options?: QueryHookOptions<
    {
      viewer: {
        id: string
        object: {
          id: string
          createdAt: string
          updatedAt: string
          meta?: unknown
          data?: string
        }
      }
    },
    { objectId: string }
  >
) => {
  return useQuery(OBJECT_QUERY, options)
}

const UPDATE_OBJECT_MUTATION = gql`
  mutation UpdateObject($objectId: String!, $input: UpdateObjectInput!) {
    updateObject(objectId: $objectId, input: $input) {
      id
      createdAt
      updatedAt
      meta
      data
    }
  }
`

const useUpdateObject = (
  options?: MutationHookOptions<
    {
      updateObject: {
        id: string
        createdAt: string
        updatedAt: string
        meta?: unknown
        data?: string
      }
    },
    {
      objectId: string
      input: {
        meta?: { title?: string }
        data?: string
      }
    }
  >
) => {
  return useMutation(UPDATE_OBJECT_MUTATION, options)
}

const CREATE_OBJECT_MUTATION = gql`
  mutation CreateObject($parentId: String, $input: CreateObjectInput!) {
    createObject(parentId: $parentId, input: $input) {
      id
      meta
      cid
    }
  }
`

const useCreateObject = (
  options?: MutationHookOptions<
    {
      createObject: {
        id: string
        meta?: unknown
        cid?: string
      }
    },
    {
      parentId?: string
      input: {
        meta?: unknown
        data?: string
        encoding?: 'BASE64'
      }
    }
  >
) => {
  return useMutation(CREATE_OBJECT_MUTATION, options)
}

const OBJECT_URI_QUERY = gql`
  query Object($objectId: String!) {
    viewer {
      id

      object(objectId: $objectId) {
        id
        uri
      }
    }
  }
`

const useObjectUriLazy = (
  options?: LazyQueryHookOptions<
    {
      viewer: {
        id: string
        object: {
          id: string
          uri?: string
        }
      }
    },
    { objectId: string }
  >
) => {
  return useLazyQuery(OBJECT_URI_QUERY, options)
}

const DELETE_OBJECT_MUTATION = gql`
  mutation DeleteObject($objectId: String!) {
    deleteObject(objectId: $objectId) {
      id
      userId
    }
  }
`

const useDeleteObject = (
  options?: MutationHookOptions<
    { deleteObject: { id: string; userId: string } },
    { objectId: string }
  >
) => {
  return useMutation(DELETE_OBJECT_MUTATION, {
    updateQueries: {
      Objects(prev, { mutationResult }) {
        return produce(prev, draft => {
          if (!mutationResult.data) {
            return
          }

          const { id: objectId } = mutationResult.data.deleteObject
          const index = draft['viewer'].objects.edges.findIndex(
            (i: { node: { id: string } }) => i.node.id === objectId
          )
          if (index >= 0) {
            draft['viewer'].objects.edges.splice(index, 1)
          }
        })
      },
    },
    ...options,
  })
}
