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
import { useCallback, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useVirtual } from 'react-virtual'
import { useObjectCreated, useObjects } from './apollo'
import ObjectMenuButton from './ObjectMenuButton'

const PAGE_SIZE = 10

export default function ObjectList() {
  const { userId, objectId } = useParams()
  if (!userId) {
    throw new Error('Missing required params `userId`')
  }
  const navigate = useNavigate()
  const {
    data: { user } = {},
    error,
    fetchMore,
    loading,
  } = useObjects({ variables: { userId, first: PAGE_SIZE } })

  if (error) {
    throw error
  }

  const { data: { objectCreated } = {} } = useObjectCreated()

  useEffect(() => {
    const first = user?.objects.edges.at(0)
    if (objectCreated) {
      if (first) {
        fetchMore({ variables: { before: first.cursor, last: PAGE_SIZE, first: null } })
      } else {
        fetchMore({ variables: { first: PAGE_SIZE } })
      }
    }
  }, [objectCreated, user])

  const parentRef = useRef<HTMLDivElement>(null)

  const virtual = useVirtual({
    size: user?.objects.edges.length || 0,
    parentRef,
    estimateSize: useCallback(() => 32, []),
  })

  useEffect(() => {
    if (loading) {
      return
    }

    const last = virtual.virtualItems.at(-1)
    const { edges, pageInfo } = user?.objects ?? {}
    const after = edges?.at(-1)?.cursor
    if (!last || !edges || !after || !pageInfo) {
      return
    }

    if (last.index >= edges.length - 1 && pageInfo.hasNextPage) {
      fetchMore({ variables: { after, first: PAGE_SIZE, last: null } })
    }
  }, [loading, virtual.virtualItems])

  return (
    <_List ref={parentRef}>
      <div style={{ height: `${virtual.totalSize}px`, position: 'relative' }}>
        {virtual.virtualItems.map(row => {
          const edge = user?.objects.edges[row.index]
          if (!edge) {
            throw new Error('The edges index overflow')
          }

          return (
            <_Item
              key={edge.node.id}
              className={objectId === edge.node.id ? 'selected' : ''}
              style={{
                height: `${row.size}px`,
                transform: `translateY(${row.start}px)`,
              }}
              onClick={() => navigate(`/${userId}/${edge.node.id}`)}
            >
              <_ItemTitle>{edge.node.meta?.title || 'Untitled'}</_ItemTitle>

              <ObjectMenuButton className="hover_visible" object={edge.node} />
            </_Item>
          )
        })}
      </div>
    </_List>
  )
}

const _List = styled.div`
  height: 100%;
  overflow-y: auto;
`

const _Item = styled.div`
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  cursor: pointer;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 32px;
  line-height: 32px;
  padding: 0 8px;

  > .hover_visible {
    display: none;
  }

  @media (hover: hover) {
    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
      padding-right: 0;

      @media (prefers-color-scheme: dark) {
        background-color: rgba(232, 234, 237, 0.08);
      }

      > .hover_visible {
        display: block;
      }
    }
  }

  &.selected {
    background-color: rgba(0, 0, 0, 0.1);
    padding-right: 0;

    @media (prefers-color-scheme: dark) {
      background-color: rgba(232, 234, 237, 0.08);
    }

    > .hover_visible {
      display: block;
    }
  }
`

const _ItemTitle = styled.div`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
`
