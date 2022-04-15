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

import { css, Global } from '@emotion/react'
import styled from '@emotion/styled'
import ReactDOM from 'react-dom'
import Editor from './Editor'

const App = () => {
  return (
    <>
      <Global
        styles={css`
          body {
            margin: 0;
            background-color: #f0f0f0;
          }
        `}
      />
      <Container>
        <_Editor />
      </Container>
    </>
  )
}

const Container = styled.div`
  background-color: #ffffff;
  margin: 32px;
  border-radius: 8px;
  padding: 16px;
`

const _Editor = styled(Editor)`
  min-height: 80vh;
`

ReactDOM.render(<App />, document.getElementById('root'))
