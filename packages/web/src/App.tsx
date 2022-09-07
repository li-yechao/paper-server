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

import { ApolloProvider } from '@apollo/client'
import { css, Global } from '@emotion/react'
import { ConfigProvider } from 'antd'
import enUS from 'antd/lib/locale/en_US'
import { Suspense, useMemo } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RecoilRoot } from 'recoil'
import { createClient } from './apollo'
import { useViewer } from './apollo/viewer'
import AppBar from './components/AppBar'
import ErrorBoundary from './components/ErrorBoundary'
import { AuthViewLazy, GithubAuthViewLazy } from './views/auth'
import { ErrorViewLazy, NotFoundViewLazy } from './views/error'
import { MainViewLazy } from './views/main'

export default function App() {
  const apolloClient = useMemo(() => createClient(), [])

  return (
    <ConfigProvider locale={enUS}>
      <Global
        styles={css`
          @media (prefers-color-scheme: dark) {
            body {
              background-color: #202124;
              color: #bdc1c6;

              /* overwrite antd styles */
              h1,
              h2,
              h3,
              h4,
              h5,
              h6 {
                color: #bdc1c6;
              }
            }
          }
        `}
      />

      <RecoilRoot>
        <ApolloProvider client={apolloClient}>
          <BrowserRouter>
            <Suspense fallback={<div />}>
              <ErrorBoundary fallback={ErrorViewLazy}>
                <AppBar />

                <ErrorBoundary fallback={ErrorViewLazy}>
                  <AppRoutes />
                </ErrorBoundary>
              </ErrorBoundary>
            </Suspense>
          </BrowserRouter>
        </ApolloProvider>
      </RecoilRoot>
    </ConfigProvider>
  )
}

const AppRoutes = () => {
  const viewer = useViewer()

  if (viewer.loading) {
    return null
  }

  return (
    <Routes>
      <Route index element={<Index />} />
      <Route path="/auth" element={<AuthViewLazy />} />
      <Route path="/auth/:type/github" element={<GithubAuthViewLazy />} />
      <Route path="/:userId/*" element={<MainViewLazy />} />
      <Route path="*" element={<NotFoundViewLazy />} />
    </Routes>
  )
}

const Index = () => {
  const viewer = useViewer()

  if (viewer.error) {
    return <Navigate to="/auth" replace />
  } else if (viewer.data) {
    return <Navigate to={`/${viewer.data.viewer.id}`} replace />
  }
  return null
}
