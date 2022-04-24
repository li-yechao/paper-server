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

import { MenuOutlined } from '@ant-design/icons'
import { cx } from '@emotion/css'
import styled from '@emotion/styled'
import { Button } from 'antd'
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Route, Routes, useParams } from 'react-router-dom'
import { useToggle } from 'react-use'
import { HeaderAction, useHeaderActionsCtrl } from '../../components/AppBar'
import ErrorBoundary from '../../components/ErrorBoundary'
import { useAccount } from '../../state/account'
import { ErrorViewLazy, NotFoundViewLazy } from '../error'
import CreateButton from './CreateButton'

export default function MainView() {
  const { userId } = useParams()
  if (!userId) {
    throw new Error('Missing required params `userId`')
  }

  const account = useAccount()

  const isSmallScreen = useIsSmallScreen()
  const [collapse, toggleCollapse] = useToggle(isSmallScreen)

  useEffect(() => {
    toggleCollapse(isSmallScreen)
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
        onClick: toggleCollapse,
      },
    }

    headerActionsCtl.append(action)

    return () => headerActionsCtl.remove(action)
  }, [])

  if (account?.id === userId) {
    return (
      <_Container className={cx(collapse && 'collapse', isSmallScreen && 'small-screen')}>
        <CreateObjectAction />

        <aside onClick={isSmallScreen ? toggleCollapse : undefined}>
          <Routes>
            <Route index element={<ObjectListLazy />} />
            <Route path=":objectId/*" element={<ObjectListLazy />} />
          </Routes>
        </aside>

        <main>
          <ErrorBoundary fallback={ErrorViewLazy}>
            <Suspense fallback={<div />}>
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
    <Routes>
      <Route index element={<Forbidden />} />
      <Route path=":objectId" element={<ObjectEditorLazy />} />
      <Route path="*" element={<NotFoundViewLazy />} />
    </Routes>
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

const ObjectListLazy = lazy(() => import('./ObjectList'))

const ObjectEditorLazy = lazy(() => import('./ObjectEditor'))
