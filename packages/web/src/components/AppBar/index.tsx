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

import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import styled from '@emotion/styled'
import { Button, Dropdown, Menu, Space } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAccount, useSignOut } from '../../state/account'
import { useHeaderActions } from './state'

export * from './state'

export default function AppBar() {
  const headerActions = useHeaderActions()

  return (
    <>
      <_Header>
        <_Logo>Paper</_Logo>
        <Space>
          {headerActions.map(i => (
            <i.component {...i.props} key={i.key} />
          ))}

          <AccountButton />
        </Space>
      </_Header>
      <_HeaderPlaceholder />
    </>
  )
}

const _Header = styled.header`
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  width: 100%;
  height: 48px;
  border-bottom: 1px solid #efefef;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  z-index: 100;
`

const _HeaderPlaceholder = styled.div`
  height: 48px;
  width: 100%;
`

const _Logo = styled.div`
  font-size: 16px;
  font-weight: bold;
`

const AccountButton = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const account = useAccount()
  const signOut = useSignOut()

  if (!account) {
    if (location.pathname === '/auth') {
      return null
    }

    return (
      <Button type="link" onClick={() => navigate('/auth')}>
        Login
      </Button>
    )
  }

  const menu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={signOut}>
        Sign out
      </Menu.Item>
    </Menu>
  )

  return (
    <Dropdown overlay={menu} trigger={['click']} arrow>
      <Button shape="circle">
        <UserOutlined />
      </Button>
    </Dropdown>
  )
}
