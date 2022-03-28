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

export default function ErrorView({ error }: { error?: { name?: string; message?: string } }) {
  return (
    <_Container>
      <_Title>{error?.name || 'Error'}</_Title>

      <_Message>{error?.message || 'Unknown Error'}</_Message>
    </_Container>
  )
}

const _Container = styled.div`
  text-align: center;
  margin-top: 40px;
`

const _Title = styled.h1`
  word-wrap: break-word;
  font-weight: normal;
  color: #999;
`

const _Message = styled.h5`
  word-wrap: break-word;
  font-weight: normal;
  color: #999;
`
