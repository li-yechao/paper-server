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
import { Button, Dropdown, Menu, message, Spin } from 'antd'
import equal from 'fast-deep-equal/es6'
import { $getRoot, EditorState } from 'lexical'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import LexicalEditor from './LexicalEditor'
import { ImageNode } from '@paper/lexical/src/nodes/ImageNode'

const AUTO_SAVE_TIMEOUT = 3e3

export default function ObjectEditor() {
  const { userId, objectId } = useParams()
  if (!userId) {
    throw new Error('Missing required params `userId`')
  }
  if (!objectId) {
    throw new Error('Missing required params `objectId`')
  }

  const object = useObject({ variables: { userId, objectId }, fetchPolicy: 'cache-and-network' })

  if (object.error) {
    throw object.error
  } else if (object.data) {
    return <_ObjectEditor object={object.data.user.object} />
  } else if (object.loading) {
    return (
      <_Loading>
        <Spin indicator={<LoadingOutlined spin />} />
      </_Loading>
    )
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
  const [state, setState] = useState<EditorState>()
  const [savedState, setSavedState] = useState<EditorState>()

  const onChange = useCallback((state: EditorState) => {
    setSavedState(v => v ?? state)
    setState(state)
  }, [])

  useEffect(() => {
    setState(undefined)
    setSavedState(undefined)
  }, [object.id])

  const save = useCallback(
    (state: EditorState) => {
      clearTimeout(autoSaveTimeout.current)

      let title = ''
      const data = JSON.stringify(state)

      state.read(() => {
        const root = $getRoot()
        for (const child of root.getChildren()) {
          title = child.getTextContent()
          if (title) {
            return
          }
        }
      })

      updateObject({
        variables: {
          objectId: object.id,
          input: {
            meta: { title },
            data,
          },
        },
      })
        .then(() => {
          setSavedState(state)
          message.success('Save Success')
        })
        .catch(error => {
          message.error(error.message)
          throw error
        })
    },
    [object.id]
  )

  const changed = useMemo(
    () => !equal(state?._nodeMap, savedState?._nodeMap),
    [state?._nodeMap, savedState?._nodeMap]
  )

  const autoSaveTimeout = useRef<number>()

  useEffect(() => {
    if (autoSaveTimeout.current) {
      clearTimeout(autoSaveTimeout.current)
    }
    if (changed && state) {
      autoSaveTimeout.current = window.setTimeout(() => {
        save(state)
      }, AUTO_SAVE_TIMEOUT)
    }
  }, [state, changed])

  useOnSave(() => {
    if (state) {
      save(state)
    }
  }, [state])

  usePrompt('Discard changes?', changed)

  const [createObject] = useCreateObject()
  const [queryObjectUri] = useObjectUriQuery()

  const imageProviderValue = useMemo(
    () => ({
      upload: async (file: File) => {
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
      source: async (src?: string | null) => {
        if (!src) {
          return null
        }

        const res = await queryObjectUri({
          variables: { userId: object.userId, objectId: src },
        })
        if (!res.data || res.error) {
          throw res.error || new Error('query object cid failed')
        }
        const uri = res.data.user.object.uri
        if (!uri) {
          throw new Error('object cid not found')
        }
        return uri
      },
      thumbnail: { maxSize: 1024 },
    }),
    [createObject, queryObjectUri]
  )

  return (
    <_Container>
      {account?.id === object.userId && <ObjectMenu object={object} />}

      <ImageNode.Provider value={imageProviderValue}>
        <_Editor
          key={object.id}
          defaultValue={object.data}
          readOnly={account?.id !== object.userId}
          onChange={onChange}
        />
      </ImageNode.Provider>
    </_Container>
  )
}

const _Container = styled.div`
  max-width: 800px;
  margin: auto;
`

const _Editor = styled(LexicalEditor)`
  min-height: calc(100vh - 100px);
  padding: 16px 0;
  margin: 0 16px;
`

const ObjectMenu = ({ object }: { object: { id: string } }) => {
  const headerCtl = useHeaderActionsCtrl()
  const navigate = useNavigate()
  const [deleteObject] = useDeleteObject()

  useEffect(() => {
    const menu = (
      <Menu>
        <Menu.Item
          key="delete"
          icon={<DeleteOutlined />}
          onClick={() => {
            deleteObject({ variables: { objectId: object.id } })
              .then(res => {
                message.success('Deleted')
                navigate(`/${res.data?.deleteObject.userId}`, { replace: true })
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
