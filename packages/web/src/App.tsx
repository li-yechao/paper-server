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
import { ReactNode, Suspense, useMemo } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { RecoilRoot } from 'recoil'
import { createClient } from './apollo'
import AppBar from './components/AppBar'
import { useAccount } from './state/account'
import { AuthViewLazy } from './views/auth'

export default function App() {
  const apolloClient = useMemo(() => createClient(), [])

  return (
    <ConfigProvider locale={zhCN}>
      <RecoilRoot>
        <ApolloProvider client={apolloClient}>
          <HashRouter>
            <Suspense fallback={<div />}>
              <AuthGuard>
                <AppRoutes />
              </AuthGuard>
            </Suspense>
          </HashRouter>
        </ApolloProvider>
      </RecoilRoot>
    </ConfigProvider>
  )
}

export const AuthGuard = ({ children }: { children?: ReactNode }) => {
  const account = useAccount()

  if (!account) {
    return <AuthViewLazy />
  }

  return <>{children}</>
}

const AppRoutes = () => {
  return (
    <>
      <AppBar />
      <Routes>
        <Route index element={<div>HOME</div>} />
        <Route path="*" element={<div>NOT FOUND</div>} />
      </Routes>
    </>
  )
}