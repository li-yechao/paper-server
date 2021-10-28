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

import { Account } from '@paper/core'
import Object from '@paper/core/src/object'
import { atom, useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil'
import { memoize } from 'lodash'
import { useEffect } from 'react'

const objectState = memoize(
  (account: Account, objectId: string) => {
    return atom<{ object: Object }>({
      key: `objectState-${account.userId}-${objectId}`,
      default: account.object(objectId).then(object => ({ object })),
    })
  },
  (account, objectId) => `objectState-${account.userId}-${objectId}`
)

export function useObject({ account, objectId }: { account: Account; objectId: string }) {
  const state = objectState(account, objectId)
  const object = useRecoilValue(state).object

  const publish = useRecoilCallback(
    ({ set, snapshot }) => {
      return async () => {
        await (await snapshot.getPromise(state)).object.publish()
        set(state, value => ({ ...value }))
      }
    },
    [state]
  )

  return { object, publish }
}

const objectPaginationState = memoize(
  (account: Account) => {
    return atom<{
      iterator: AsyncIterator<Object>
      list: string[]
      hasNext: boolean
      page: number
      limit: number
    } | null>({
      key: `objectPaginationState-${account.userId}`,
      default: null,
    })
  },
  account => account.userId
)

export interface ObjectPagination {
  list: string[]
  page: number
  hasPrevious: boolean
  hasNext: boolean
  loadPrevious: () => Promise<void>
  loadNext: () => Promise<void>
}

export function useObjectPagination({
  account,
  limit = 10,
}: {
  account: Account
  limit?: number
}): ObjectPagination {
  const [pagination, setPagination] = useRecoilState(objectPaginationState(account))

  const withState = (cb: (s: NonNullable<typeof pagination>) => Promise<void>) => {
    return async () => {
      const s = pagination ?? {
        iterator: account.objects(),
        list: [],
        hasNext: true,
        page: 0,
        limit,
      }
      s && (await cb(s))
    }
  }

  const loadPrevious = withState(async state => {
    if (state.page > 0) {
      setPagination({ ...state, page: state.page - 1 })
    }
  })

  const loadMore = async (iterator: AsyncIterator<Object>, limit: number) => {
    const list: string[] = []
    while (list.length < limit) {
      const next = await iterator.next()
      if (next.value) {
        list.push(next.value.id)
      } else {
        break
      }
    }
    return list
  }

  const loadNext = withState(async state => {
    const { iterator, page, limit, list } = state
    const newPage = page === 0 && list.length < limit ? 0 : page + 1
    // NOTE: Load one more to determine if there is a next page.
    const needLoadCount = (newPage + 1) * limit - list.length + 1
    const newList = needLoadCount > 0 ? list.concat(await loadMore(iterator, needLoadCount)) : list
    const hasNext = newList.length - list.length >= needLoadCount

    setPagination({
      ...state,
      list: newList,
      page: Math.max(0, Math.min(Math.ceil(list.length / limit) - 1, newPage)),
      hasNext,
    })
  })

  useEffect(() => {
    if (!pagination || pagination.list.length === 0) {
      loadNext()
    }
  }, [account])

  useEffect(() => {
    if (pagination && pagination.hasNext) {
      const needLoadCount = (pagination.page + 1) * pagination.limit - pagination.list.length + 1
      if (needLoadCount > 0) {
        loadMore(pagination.iterator, needLoadCount).then(objects => {
          setPagination({
            ...pagination,
            list: pagination.list.concat(objects),
            hasNext: objects.length >= needLoadCount,
          })
        })
      }
    }
  }, [pagination])

  if (!pagination) {
    return {
      list: [],
      page: 0,
      hasPrevious: false,
      hasNext: false,
      loadPrevious,
      loadNext,
    }
  }

  const page = Math.max(0, Math.min(Math.ceil(pagination.list.length / limit) - 1, pagination.page))
  const offset = page * pagination.limit

  return {
    list: pagination.list.slice(offset, offset + pagination.limit),
    page,
    hasPrevious: page > 0,
    hasNext: pagination.hasNext || page < Math.ceil(pagination.list.length / pagination.limit) - 1,
    loadPrevious,
    loadNext,
  }
}

export function useDeleteObject({ account }: { account: Account }) {
  const paginationState = objectPaginationState(account)

  return useRecoilCallback(
    ({ set }) =>
      async (object: Object) => {
        set(
          paginationState,
          v =>
            v && {
              ...v,
              list: v.list.filter(i => i !== object.id),
            }
        )
        await object.delete()
      },
    []
  )
}

export function useCreateObject({ account }: { account: Account }) {
  const paginationState = objectPaginationState(account)

  return useRecoilCallback(
    ({ set }) =>
      async () => {
        const object = await account.createObject()
        set(
          paginationState,
          v =>
            v && {
              ...v,
              list: [object.id].concat(v.list),
            }
        )
        return object
      },
    []
  )
}