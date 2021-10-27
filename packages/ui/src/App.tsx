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
import { Box, createTheme, LinearProgress, ThemeProvider as MuiThemeProvider } from '@mui/material'
import { StylesProvider } from '@mui/styles'
import { Account } from '@paper/core'
import { Suspense, useEffect, useMemo } from 'react'
import { IntlProvider } from 'react-intl'
import { HashRouter, Route, Switch } from 'react-router-dom'
import { useAsync } from 'react-use'
import { RecoilRoot, useSetRecoilState } from 'recoil'
import ErrorBoundary from './components/ErrorBoundary'
import NetworkIndicator from './components/NetworkIndicator'
import { accountOptions } from './constants'
import { accountSelector, isUnauthorizedError, useAccountOrNull } from './state/account'
import Storage from './Storage'
import { NotFoundViewLazy } from './views/error'
import ErrorView from './views/error/ErrorView'
import { AuthViewLazy } from './views/auth'
import { UserViewLazy } from './views/user'
import { HomeViewLazy } from './views/home'
import { SnackbarProvider } from 'notistack'

export default function App() {
  const theme = useMemo(
    () =>
      createTheme({
        typography: {
          button: {
            textTransform: 'none',
          },
        },
      }),
    []
  )

  return (
    <ErrorBoundary fallback={ErrorView}>
      <NetworkIndicator.Provider>
        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <NetworkIndicator.Renderer>
            <Box position="fixed" left={0} top={0} right={0} zIndex={t => t.zIndex.tooltip + 1}>
              <LinearProgress />
            </Box>
          </NetworkIndicator.Renderer>

          <IntlProvider locale={navigator.language}>
            <RecoilRoot>
              <StylesProvider injectFirst>
                <MuiThemeProvider theme={theme}>
                  <EmotionThemeProvider theme={theme}>
                    <Suspense fallback={<NetworkIndicator in />}>
                      <AppRoutes />
                    </Suspense>
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
  const setAccount = useSetRecoilState(accountSelector)
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
          const { userId, password } = account
          return Account.create(accountOptions, { userId, password })
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
    <ErrorBoundary fallback={UnauthorizedErrorBoundary}>
      <HashRouter>
        <Switch>
          <Route path="/" exact component={HomeViewLazy} />
          <Route path="/:userId" component={UserViewLazy} />
          <Route path="*" component={NotFoundViewLazy} />
        </Switch>
      </HashRouter>
    </ErrorBoundary>
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
