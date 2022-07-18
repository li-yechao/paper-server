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

import { LoadingOutlined, MenuOutlined } from '@ant-design/icons'
import { cx } from '@emotion/css'
import styled from '@emotion/styled'
import { Button, Spin } from 'antd'
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Route, Routes, useParams } from 'react-router-dom'
import { useToggle } from 'react-use'
import { useCurrentUser } from '../../apollo/viewer'
import { HeaderAction, useHeaderActionsCtrl } from '../../components/AppBar'
import ErrorBoundary from '../../components/ErrorBoundary'
import Storage from '../../Storage'
import { ErrorViewLazy, NotFoundViewLazy } from '../error'
import CreateButton from './CreateButton'

export default function MainView() {
  const { userId } = useParams()
  if (!userId) {
    throw new Error('Missing required params `userId`')
  }

  const user = useCurrentUser()

  const isSmallScreen = useIsSmallScreen()
  const [collapsed, toggleCollapsed] = useToggle(
    typeof Storage.asideCollapsed === 'boolean' ? Storage.asideCollapsed : isSmallScreen
  )

  useEffect(() => {
    if (!isSmallScreen) {
      Storage.asideCollapsed = collapsed
    }
  }, [isSmallScreen, collapsed])

  useEffect(() => {
    if (isSmallScreen) {
      toggleCollapsed(isSmallScreen)
    }
  }, [isSmallScreen])

  const headerActionsCtl = useHeaderActionsCtrl()

  useEffect(() => {
    const action: HeaderAction = {
      key: 'ASIDE_VIEW_TRIGGER',
      placement: 'left',
      component: Button,
      props: {
        children: <MenuOutlined />,
        type: 'link',
        shape: 'circle',
        onClick: toggleCollapsed,
      },
    }

    headerActionsCtl.append(action)

    return () => headerActionsCtl.remove(action)
  }, [])

  if (user?.id === userId) {
    return (
      <_Container className={cx(collapsed && 'collapse', isSmallScreen && 'small-screen')}>
        <CreateObjectAction />

        <aside onClick={isSmallScreen ? toggleCollapsed : undefined}>
          <Routes>
            <Route index element={<ObjectListLazy />} />
            <Route path=":objectId/*" element={<ObjectListLazy />} />
          </Routes>
        </aside>

        <main>
          <ErrorBoundary fallback={ErrorViewLazy}>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route index element={<div />} />
                <Route path=":objectId" element={<ObjectEditorLazy />} />
                <Route path="*" element={<NotFoundViewLazy />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
      </_Container>
    )
  }

  return (
    <ErrorBoundary fallback={ErrorViewLazy}>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route index element={<Forbidden />} />
          <Route path=":objectId" element={<ObjectEditorLazy />} />
          <Route path="*" element={<NotFoundViewLazy />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

function useIsSmallScreen() {
  const mql = useMemo(() => window.matchMedia('(max-width: 800px)'), [])
  const [value, setValue] = useState(!!mql.matches)

  useEffect(() => {
    let mounted = true

    const listener = () => {
      if (!mounted) {
        return
      }
      setValue(!!mql.matches)
    }
    mql.addEventListener('change', listener)
    return () => {
      mounted = false
      mql.removeEventListener('change', listener)
    }
  }, [])

  return value
}

const Forbidden = () => {
  throw new Error('Forbidden')
}

const CreateObjectAction = () => {
  const headerCtl = useHeaderActionsCtrl()

  useEffect(() => {
    const action = {
      key: 'createObjectAction',
      component: CreateButton,
      props: {},
    }
    headerCtl.append(action)
    return () => headerCtl.remove(action)
  }, [])

  return null
}

const _Container = styled.div`
  padding-left: 200px;
  transition: all 0.3s ease-in-out;

  > aside {
    transition: all 0.3s ease-in-out;
    position: fixed;
    z-index: 50;
    left: 0;
    top: 48px;
    bottom: 0;
    width: 200px;
    border-right: 1px solid #efefef;
    background-color: #ffffff;
  }

  @media (min-width: 1000px) {
    padding-left: 300px;

    > aside {
      width: 300px;
    }
  }

  &.small-screen {
    padding-left: 0;

    > aside {
      width: 100%;
    }
  }

  &.collapse {
    padding-left: 0;

    > aside {
      left: -100%;
    }
  }
`

const _Loading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 40vh;
`

const Loading = () => {
  return (
    <_Loading>
      <Spin indicator={<LoadingOutlined spin />} />
    </_Loading>
  )
}

const ObjectListLazy = lazy(() => import('./ObjectList'))

const ObjectEditorLazy = lazy(() => import('./ObjectEditor'))
