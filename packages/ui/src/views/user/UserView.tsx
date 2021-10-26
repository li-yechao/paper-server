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

import styled from '@emotion/styled'
import { AccountCircle, Add } from '@mui/icons-material'
import { AppBar, Box, Button, IconButton, Menu, MenuItem, Toolbar, Typography } from '@mui/material'
import Ipfs from '@paper/ipfs'
import * as React from 'react'
import { useMemo, useState } from 'react'
import { Route, RouteComponentProps, Switch, useHistory } from 'react-router'
import { useRecoilValue, useResetRecoilState } from 'recoil'
import { accountSelector } from '../../state/account'
import { NotFoundViewLazy } from '../error'
import { UserHomeViewLazy } from './home'
import { ObjectViewLazy } from './object'
import { useCreateObject } from './useObjectPagination'

export interface UserViewProps extends Pick<RouteComponentProps<{ name: string }>, 'match'> {}

export default function UserView(props: UserViewProps) {
  const { name } = props.match.params
  const id = useMemo(() => {
    try {
      return Ipfs.PeerId.parse(name)
    } catch {
      return null
    }
  }, [name])

  if (!id) {
    return <NotFoundViewLazy />
  }

  return (
    <>
      <_AppBar position="fixed" elevation={0}>
        <Toolbar>
          <Typography variant="h5">Paper</Typography>

          <Box flexGrow={1} />

          <CreateButton />
          <AccountButton />
        </Toolbar>
      </_AppBar>

      <_Body>
        <Switch>
          <Route path={`${props.match.path}`} exact component={UserHomeViewLazy} />
          <Route path={`${props.match.path}/:objectId`} exact component={ObjectViewLazy} />
          <Route path="*" component={NotFoundViewLazy} />
        </Switch>
      </_Body>
    </>
  )
}

const _AppBar = styled(AppBar)`
  background-color: ${props => props.theme.palette.background.paper};
  color: ${props => props.theme.palette.text.primary};
  border-bottom: 1px solid ${props => props.theme.palette.divider};
  user-select: none;

  .MuiToolbar-root {
    min-height: ${props => props.theme.spacing(7)};
  }
`

const _Body = styled.div`
  padding-top: ${props => props.theme.spacing(7)};
`

const CreateButton = () => {
  const handleCreate = useCreateObject()

  return (
    <IconButton onClick={handleCreate}>
      <Add />
    </IconButton>
  )
}

const AccountButton = () => {
  const account = useRecoilValue(accountSelector)
  const resetAccount = useResetRecoilState(accountSelector)
  const [anchorEl, setAnchorEl] = useState<Element>()
  const history = useHistory()

  const handleMenuOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(undefined)
  }

  const handleSignOut = () => {
    handleMenuClose()
    resetAccount()
  }

  const handleLogin = () => {
    history.push(`/`)
  }

  return (
    <>
      {account ? (
        <IconButton onClick={handleMenuOpen}>
          <AccountCircle />
        </IconButton>
      ) : (
        <Button variant="text" onClick={handleLogin}>
          Login
        </Button>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        keepMounted
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleSignOut}>Sign out</MenuItem>
      </Menu>
    </>
  )
}
