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
import { useViewer } from '../../apollo/viewer'
import { useSignOut } from '../../state/account'
import { useHeaderActions } from './state'

export * from './state'

export default function AppBar() {
  const { left, right } = useHeaderActions()

  return (
    <>
      <_Header>
        <_Logo>Paper</_Logo>
        <Space>
          {left.map(i => (
            <i.component {...i.props} key={i.key} />
          ))}
        </Space>

        <_Spacing />

        <Space>
          {right.map(i => (
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
  padding: 0 16px;
  display: flex;
  align-items: center;
  z-index: 100;
  background-color: #ffffff;
  border-bottom: 1px solid #efefef;

  @media (prefers-color-scheme: dark) {
    background-color: #202124 !important;
    border-color: #9aa0a6;
  }
`

const _Spacing = styled.div`
  flex: 1;
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
  const viewer = useViewer()
  const signOut = useSignOut()

  if (!viewer.data?.viewer) {
    if (location.pathname.startsWith('/auth')) {
      return null
    }

    return (
      <_Button type="link" onClick={() => navigate('/auth')}>
        Login
      </_Button>
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
      <_Button shape="circle">
        <UserOutlined />
      </_Button>
    </Dropdown>
  )
}

const _Button = styled(Button)`
  @media (prefers-color-scheme: dark) {
    background-color: #202124;
    border-color: #9aa0a6;
    color: #bdc1c6;

    &:hover {
      background: rgba(232, 234, 237, 0.08);
    }
  }
`
