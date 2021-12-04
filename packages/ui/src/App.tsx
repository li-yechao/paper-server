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

import { ThemeProvider as EmotionThemeProvider } from '@emotion/react'
import styled from '@emotion/styled'
import { AccountCircle, Add, CloudSync, Logout, SyncProblem } from '@mui/icons-material'
import {
  AppBar,
  Box,
  CircularProgress,
  CssBaseline,
  Divider,
  IconButton,
  LinearProgress,
  ListItemIcon,
  MenuItem,
  ThemeProvider as MuiThemeProvider,
  Toolbar,
  Typography,
} from '@mui/material'
import { StylesProvider } from '@mui/styles'
import { Account } from '@paper/core'
import { SnackbarProvider } from 'notistack'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { IntlProvider } from 'react-intl'
import { HashRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { useAsync } from 'react-use'
import { RecoilRoot } from 'recoil'
import ArrowMenu from './components/ArrowMenu'
import ErrorBoundary from './components/ErrorBoundary'
import NetworkIndicator, { useToggleNetworkIndicator } from './components/NetworkIndicator'
import { accountOptions } from './constants'
import { isUnauthorizedError, useAccountOrNull, useSetAccount } from './state/account'
import { useHeaderActions } from './state/header'
import { useCreateObject } from './state/object'
import Storage from './Storage'
import useMyTheme from './theme'
import useIsElectron from './utils/useIsEelectron'
import { AuthViewLazy } from './views/auth'
import { NotFoundViewLazy } from './views/error'
import ErrorView from './views/error/ErrorView'
import { HomeViewLazy } from './views/home'
import { UserViewLazy } from './views/user'

export default function App() {
  const theme = useMyTheme()

  return (
    <ErrorBoundary fallback={ErrorView}>
      <NetworkIndicator.Provider>
        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <IntlProvider locale={navigator.language}>
            <RecoilRoot>
              <StylesProvider injectFirst>
                <MuiThemeProvider theme={theme}>
                  <EmotionThemeProvider theme={theme}>
                    <CssBaseline>
                      <Suspense fallback={<NetworkIndicator in />}>
                        <AppRoutes />
                      </Suspense>
                    </CssBaseline>
                  </EmotionThemeProvider>
                </MuiThemeProvider>
              </StylesProvider>
            </RecoilRoot>
          </IntlProvider>
        </SnackbarProvider>
      </NetworkIndicator.Provider>
    </ErrorBoundary>
  )
}

const AppRoutes = () => {
  const isElectron = useIsElectron()
  const headerActions = useHeaderActions()
  const setAccount = useSetAccount()
  const accountState = useAsync(async () => {
    // NOTE: Set account into globalThis at development environment (avoid hot
    // module replacement recreate account instance).
    const g: { __ACCOUNT__?: Promise<Account> | null } = import.meta.env.PROD
      ? {}
      : (globalThis as any)

    if (!g.__ACCOUNT__) {
      g.__ACCOUNT__ = (() => {
        const account = Storage.account
        if (account) {
          const { id, password } = account
          return Account.create({ id, password }, accountOptions)
        }

        return null
      })()
    }

    const account = await g.__ACCOUNT__
    if (account) {
      setAccount(account)
    }
  }, [])

  if (accountState.loading) {
    return <NetworkIndicator in />
  } else if (accountState.error) {
    throw accountState.error
  }

  return (
    <HashRouter>
      <_AppBar position="fixed" elevation={0}>
        <Toolbar>
          {isElectron && <Box width={72} />}
          <Typography variant="h5">Paper</Typography>

          <Box flexGrow={1} />

          {headerActions.map(i => (
            <i.component {...i.props} key={i.key} />
          ))}
          <SyncStatus />
          <CreateButton />
          <AccountButton />
        </Toolbar>

        <NetworkIndicator.Renderer>
          <Box position="fixed" left={0} top={56} right={0} zIndex={t => t.zIndex.tooltip + 1}>
            <LinearProgress />
          </Box>
        </NetworkIndicator.Renderer>
      </_AppBar>

      <_Body>
        <ErrorBoundary fallback={ErrorView}>
          <ErrorBoundary fallback={UnauthorizedErrorBoundary}>
            <Routes>
              <Route index element={<HomeViewLazy />} />
              <Route path=":userId/*" element={<UserViewLazy />} />
              <Route path="*" element={<NotFoundViewLazy />} />
            </Routes>
          </ErrorBoundary>
        </ErrorBoundary>
      </_Body>
    </HashRouter>
  )
}

function UnauthorizedErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  const account = useAccountOrNull()

  useEffect(() => {
    if (account) {
      reset()
    }
  }, [account, reset])

  if (isUnauthorizedError(error)) {
    return <AuthViewLazy />
  }

  throw error
}

const _AppBar = styled(AppBar)`
  background-color: ${props => props.theme.palette.background.paper};
  color: ${props => props.theme.palette.text.primary};
  border-bottom: 1px solid ${props => props.theme.palette.divider};
  user-select: none;
  -webkit-app-region: drag;

  button {
    -webkit-app-region: none;
  }

  .MuiToolbar-root {
    min-height: ${props => props.theme.spacing(7)};
  }
`

const _Body = styled.div`
  padding-top: ${props => props.theme.spacing(7)};
`

const AccountButton = () => {
  const navigate = useNavigate()
  const account = useAccountOrNull()
  const setAccount = useSetAccount()
  const [anchorEl, setAnchorEl] = useState<Element>()

  const handleMenuOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(undefined)
  }

  const handleToMyProfile = () => {
    handleMenuClose()
    if (account) {
      navigate(`/${account.account.user.id}`)
    }
  }

  const handleSignOut = () => {
    handleMenuClose()
    setAccount()
  }

  if (!account) {
    return null
  }

  return (
    <>
      <IconButton onClick={handleMenuOpen}>
        <AccountCircle />
      </IconButton>

      <ArrowMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        keepMounted
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleToMyProfile}>
          <ListItemIcon>
            <AccountCircle />
          </ListItemIcon>
          My profile
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Sign out
        </MenuItem>
      </ArrowMenu>
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
        <CircularProgress size={24} />
      ) : (
        <CloudSync />
      )}
    </IconButton>
  )
}

const CreateButton = () => {
  const account = useAccountOrNull()
  return account ? <_CreateButton account={account.account} /> : null
}

const _CreateButton = ({ account }: { account: Account }) => {
  const navigate = useNavigate()
  const toggleNetworkIndicator = useToggleNetworkIndicator()
  const createObject = useCreateObject({ account })

  const handleClick = useCallback(async () => {
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
