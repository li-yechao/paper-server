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
import { Suspense, useMemo } from 'react'
import { IntlProvider } from 'react-intl'
import { HashRouter, Route, Switch } from 'react-router-dom'
import { RecoilRoot } from 'recoil'
import ErrorBoundary from './components/ErrorBoundary'
import NetworkIndicator from './components/NetworkIndicator'
import { NotFoundViewLazy } from './views/error'
import ErrorView from './views/error/ErrorView'
import { HomeViewLazy } from './views/home'
import { UserViewLazy } from './views/user'

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
      </NetworkIndicator.Provider>
    </ErrorBoundary>
  )
}

const AppRoutes = () => {
  return (
    <HashRouter>
      <Switch>
        <Route path="/" exact component={HomeViewLazy} />
        <Route path="/:name" render={({ match }) => <UserViewLazy match={match} />} />
        <Route path="*" component={NotFoundViewLazy} />
      </Switch>
    </HashRouter>
  )
}
