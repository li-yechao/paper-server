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

import { DeleteOutlined, MoreOutlined } from '@ant-design/icons'
import { Button, Dropdown, Menu, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useDeleteObject } from './apollo'

export default function ObjectMenuButton({
  className,
  object,
}: {
  className?: string
  object: { id: string }
}) {
  const navigate = useNavigate()
  const [deleteObject] = useDeleteObject()

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

  return (
    <div className={className} onClick={e => e.stopPropagation()}>
      <Dropdown overlay={menu} trigger={['click']} arrow placement="bottomRight">
        <Button type="link" shape="circle">
          <MoreOutlined />
        </Button>
      </Dropdown>
    </div>
  )
}
