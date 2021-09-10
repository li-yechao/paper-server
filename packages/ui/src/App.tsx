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
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material'
import { StylesProvider } from '@mui/styles'
import { useMemo } from 'react'
import { HashRouter, Route, Switch } from 'react-router-dom'
import { RecoilRoot } from 'recoil'
import { NotFoundViewLazy } from './views/error'
import { HomeViewLazy } from './views/home'

export default function App() {
  const theme = useMemo(() => createTheme(), [])

  return (
    <RecoilRoot>
      <StylesProvider injectFirst>
        <MuiThemeProvider theme={theme}>
          <EmotionThemeProvider theme={theme}>
            <HashRouter>
              <Switch>
                <Route path="/" exact component={HomeViewLazy} />
                <Route path="*" component={NotFoundViewLazy} />
              </Switch>
            </HashRouter>
          </EmotionThemeProvider>
        </MuiThemeProvider>
      </StylesProvider>
    </RecoilRoot>
  )
}
