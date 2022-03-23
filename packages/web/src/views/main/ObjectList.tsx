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

import { gql, QueryHookOptions, useQuery } from '@apollo/client'
import styled from '@emotion/styled'
import { useNavigate } from 'react-router-dom'

export default function ObjectList({ objectId }: { objectId?: string }) {
  const navigate = useNavigate()
  const { data: { viewer } = {} } = useObjects({ variables: { first: 10 } })

  return (
    <_List>
      {viewer?.objects.edges.map(edge => (
        <_Item
          key={edge.node.id}
          className={objectId === edge.node.id ? 'selected' : ''}
          onClick={() => navigate(`/me/${edge.node.id}`)}
        >
          {edge.node.meta?.title || 'Untitled'}
        </_Item>
      ))}
    </_List>
  )
}

const _List = styled.div`
  height: 100%;
  overflow-y: auto;
`

const _Item = styled.div`
  height: 32px;
  line-height: 32px;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 8px;
  cursor: pointer;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &.selected {
    background-color: rgba(0, 0, 0, 0.1);
  }
`

const OBJECTS_QUERY = gql`
  query Objects($first: Int) {
    viewer {
      id

      objects(first: $first) {
        edges {
          cursor
          node {
            id
            createdAt
            updatedAt
            meta
          }
        }
      }
    }
  }
`

const useObjects = (
  options?: QueryHookOptions<
    {
      viewer: {
        id: string
        objects: {
          edges: {
            cursor: string
            node: { id: string; createdAt: string; updatedAt: string; meta?: { title?: string } }
          }[]
        }
      }
    },
    { first?: number }
  >
) => {
  return useQuery(OBJECTS_QUERY, options)
}
