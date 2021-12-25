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

import styled from '@emotion/styled'
import { useMediaQuery } from '@mui/material'
import { Route, Routes } from 'react-router'
import { NotFoundViewLazy } from '../error'
import { UserHomeViewLazy } from './home'
import { ObjectViewLazy } from './object'

export default function UserView() {
  const large = useMediaQuery('(min-width: 600px)')
  const small = useMediaQuery('(max-width: 600px)')

  if (large) {
    return (
      <LargeContainer>
        <aside>
          <UserHomeViewLazy />
        </aside>
        <main>
          <Routes>
            <Route index element={<HomeView />} />
            <Route path=":objectId" element={<ObjectViewLazy />} />
            <Route path="*" element={<NotFoundViewLazy />} />
          </Routes>
        </main>
      </LargeContainer>
    )
  }

  if (small) {
    return (
      <Routes>
        <Route index element={<UserHomeViewLazy />} />
        <Route path=":objectId" element={<ObjectViewLazy />} />
        <Route path="*" element={<NotFoundViewLazy />} />
      </Routes>
    )
  }

  return null
}

const LargeContainer = styled.div`
  position: absolute;
  left: 0;
  top: ${props => props.theme.spacing(7)};
  width: 100%;
  bottom: 0;
  overflow: hidden;
  display: flex;

  > aside {
    position: relative;
    width: 200px;
    height: 100%;
    overflow: auto;
    background-color: ${props => props.theme.palette.background.default};

    @media (min-width: 1000px) {
      width: 300px;
    }
  }

  > main {
    position: relative;
    flex: 1;
    height: 100%;
    overflow: auto;
    background-color: ${props => props.theme.palette.background.paper};
  }
`

const HomeView = () => {
  return (
    <_HomeView>
      <img src="icons/Icon-500-transparent.png" />
    </_HomeView>
  )
}

const _HomeView = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  > img {
    width: 200px;
    filter: grayscale(100%);
    opacity: 0.5;
  }
`
