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
import { ConfigProvider } from 'antd'
import zhCN from 'antd/lib/locale/zh_CN'
import { Suspense, useMemo } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RecoilRoot } from 'recoil'
import { createClient } from './apollo'
import AppBar from './components/AppBar'
import ErrorBoundary from './components/ErrorBoundary'
import { useAccount } from './state/account'
import { AuthViewLazy } from './views/auth'
import { ErrorViewLazy, NotFoundViewLazy } from './views/error'
import { MainViewLazy } from './views/main'

export default function App() {
  const apolloClient = useMemo(() => createClient(), [])

  return (
    <ConfigProvider locale={zhCN}>
      <RecoilRoot>
        <ApolloProvider client={apolloClient}>
          <HashRouter>
            <Suspense fallback={<div />}>
              <ErrorBoundary fallback={ErrorViewLazy}>
                <AppBar />

                <ErrorBoundary fallback={ErrorViewLazy}>
                  <AppRoutes />
                </ErrorBoundary>
              </ErrorBoundary>
            </Suspense>
          </HashRouter>
        </ApolloProvider>
      </RecoilRoot>
    </ConfigProvider>
  )
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route index element={<Index />} />
      <Route path="/auth" element={<AuthViewLazy />} />
      <Route path="/:userId/*" element={<MainViewLazy />} />
      <Route path="*" element={<NotFoundViewLazy />} />
    </Routes>
  )
}

const Index = () => {
  const account = useAccount()
  if (!account) {
    return <Navigate to="/auth" replace />
  }
  return <Navigate to={`/${account.id}`} replace />
}
