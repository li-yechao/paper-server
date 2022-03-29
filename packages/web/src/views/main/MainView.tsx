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

import styled from '@emotion/styled'
import { useEffect } from 'react'
import { Route, Routes, useParams } from 'react-router-dom'
import { AuthGuard } from '../../AuthGuard'
import { useHeaderActionsCtrl } from '../../components/AppBar'
import ErrorBoundary from '../../components/ErrorBoundary'
import { ErrorViewLazy, NotFoundViewLazy } from '../error'
import CreateButton from './CreateButton'
import ObjectEditor from './ObjectEditor'
import ObjectList from './ObjectList'

export default function MainView() {
  return (
    <AuthGuard>
      <CreateObjectAction />

      <_Container>
        <aside>
          <Routes>
            <Route index element={<ObjectList />} />
            <Route path=":objectId/*" element={<ObjectList />} />
          </Routes>
        </aside>

        <main>
          <ErrorBoundary fallback={ErrorViewLazy}>
            <Routes>
              <Route index element={<div />} />
              <Route path=":objectId" element={<_ObjectEditor />} />
              <Route path="*" element={<NotFoundViewLazy />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </_Container>
    </AuthGuard>
  )
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

const _ObjectEditor = () => {
  const { objectId } = useParams()

  return objectId ? <ObjectEditor objectId={objectId} /> : null
}

const _Container = styled.div`
  padding-left: 200px;

  > aside {
    position: fixed;
    left: 0;
    top: 48px;
    bottom: 0;
    width: 200px;
    border-right: 1px solid #efefef;
  }
`
