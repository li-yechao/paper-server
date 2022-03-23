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

import { FileAddOutlined, PlusOutlined } from '@ant-design/icons'
import { gql, MutationHookOptions, useMutation } from '@apollo/client'
import { Button, Dropdown, Menu } from 'antd'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount } from '../../state/account'

export default function CreateButton() {
  const navigate = useNavigate()
  const account = useAccount()
  const [createObject] = useCreateObject()

  const handleCreateObject = useCallback(async () => {
    createObject({ variables: { input: {} }, refetchQueries: ['Objects'] }).then(res => {
      const object = res.data?.createObject
      if (object) {
        navigate(`/me/${object.id}`)
      }
    })
  }, [])

  if (!account) {
    return null
  }

  const menu = (
    <Menu>
      <Menu.Item key="logout" icon={<FileAddOutlined />} onClick={handleCreateObject}>
        Document
      </Menu.Item>
    </Menu>
  )

  return (
    <Dropdown overlay={menu} trigger={['click']} arrow>
      <Button type="link">
        <PlusOutlined />
      </Button>
    </Dropdown>
  )
}

const CREATE_OBJECT_MUTATION = gql`
  mutation CreateObject($input: CreateObjectInput!) {
    createObject(input: $input) {
      id
      userId
    }
  }
`

const useCreateObject = (
  options?: MutationHookOptions<
    { createObject: { id: string; userId: string } },
    { input: { meta?: unknown; data?: string } }
  >
) => {
  return useMutation(CREATE_OBJECT_MUTATION, options)
}
