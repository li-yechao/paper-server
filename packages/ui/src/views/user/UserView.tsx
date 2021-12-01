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
import { AccountCircle, Add, CloudSync, SyncProblem } from '@mui/icons-material'
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material'
import { Account } from '@paper/core'
import * as React from 'react'
import { useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router'
import { useToggleNetworkIndicator } from '../../components/NetworkIndicator'
import { useAccount, useAccountOrNull, useSetAccount } from '../../state/account'
import { useHeaderActions } from '../../state/header'
import { useCreateObject } from '../../state/object'
import { NotFoundViewLazy } from '../error'
import { UserHomeViewLazy } from './home'
import { ObjectViewLazy } from './object'

export default function UserView() {
  const headerActions = useHeaderActions()

  return (
    <>
      <_AppBar position="fixed" elevation={0}>
        <Toolbar>
          <Typography variant="h5">Paper</Typography>

          <Box flexGrow={1} />

          {headerActions.map(i => (
            <i.component {...i.props} key={i.key} />
          ))}
          <SyncStatus />
          <CreateButton />
          <AccountButton />
        </Toolbar>
      </_AppBar>

      <_Body>
        <Routes>
          <Route index element={<UserHomeViewLazy />} />
          <Route path=":objectId" element={<ObjectViewLazy />} />
          <Route path="*" element={<NotFoundViewLazy />} />
        </Routes>
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
  const account = useAccountOrNull()
  return account ? <_CreateButton account={account.account} /> : null
}

const _CreateButton = ({ account }: { account: Account }) => {
  const navigate = useNavigate()
  const toggleNetworkIndicator = useToggleNetworkIndicator()
  const createObject = useCreateObject({ account })

  const handleClick = React.useCallback(async () => {
    try {
      toggleNetworkIndicator(true)
      const object = await createObject()
      navigate(`/${account.user.id}/${object.id}`)
    } finally {
      toggleNetworkIndicator(false)
    }
  }, [createObject])

  return (
    <IconButton onClick={handleClick}>
      <Add />
    </IconButton>
  )
}

const AccountButton = () => {
  const navigate = useNavigate()
  const account = useAccount()
  const setAccount = useSetAccount()
  const [anchorEl, setAnchorEl] = useState<Element>()

  const handleMenuOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(undefined)
  }

  const handleSignOut = () => {
    handleMenuClose()
    setAccount()
  }

  const handleLogin = () => {
    navigate(`/`)
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

const SyncStatus = () => {
  const account = useAccountOrNull()
  const sync = account?.sync

  const handleClick = () => {
    if (!sync?.syncing) {
      account?.account.sync()
    }
  }

  if (!sync) {
    return null
  }

  return (
    <IconButton onClick={handleClick}>
      {sync.error ? (
        <SyncProblem color="error" />
      ) : sync.syncing ? (
        <CircularProgress size={20} />
      ) : (
        <CloudSync />
      )}
    </IconButton>
  )
}
