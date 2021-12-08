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

import { Account, Object } from '@paper/core'
import { atom, useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil'
import { memoize } from 'lodash'
import { useEffect } from 'react'
import { AccountState } from './account'

const objectState = memoize(
  (account: Account, objectId: string) => {
    return atom({
      key: `objectState-${account.user.id}-${objectId}`,
      default: account.object(objectId),
    })
  },
  (account, objectId) => `objectState-${account.user.id}-${objectId}`
)

export function useObject({ account, objectId }: { account: Account; objectId: string }) {
  const state = objectState(account, objectId)
  return useRecoilValue(state)
}

export interface ObjectPagination {
  accountCID?: string
  loading: boolean
  list: Object[]
  hasPrevious: boolean
  hasNext: boolean
}

const objectPaginationState = memoize(
  (account: Account) => {
    return atom<ObjectPagination>({
      key: `objectPaginationState-${account.user.id}`,
      default: { loading: false, list: [], hasPrevious: false, hasNext: false },
    })
  },
  account => account.user.id
)

export function useObjectPagination({
  accountState: { account, sync },
  limit,
}: {
  accountState: AccountState
  limit: number
}): ObjectPagination & {
  loadPrevious: () => Promise<void>
  loadNext: () => Promise<void>
} {
  const [pagination, setPagination] = useRecoilState(objectPaginationState(account))

  const loadPrevious = async () => {
    try {
      setPagination(v => ({ ...v, loading: true }))
      const firstId = pagination?.list.length ? pagination.list[0].id : undefined
      let objects = await account.objects({
        after: firstId ? decreaseObjectId(firstId) : undefined,
        limit: limit + 2,
      })

      const index = firstId ? objects.findIndex(i => i.id <= firstId) : -1
      let hasNext = index >= 0
      objects = hasNext ? objects.slice(0, index) : objects

      const hasPrevious = objects.length > limit
      objects = hasPrevious ? objects.slice(-limit) : objects

      if (objects.length < limit && hasNext) {
        const moreLimit = limit - objects.length
        const moreObjects = await account.objects({
          before: objects[objects.length - 1]?.id,
          limit: moreLimit + 1,
        })
        hasNext = moreObjects.length > moreLimit
        objects.push(...moreObjects.slice(0, moreLimit))
      }

      setPagination(v => ({
        ...v,
        list: objects,
        hasPrevious,
        hasNext,
      }))
    } finally {
      setPagination(v => ({
        ...v,
        loading: false,
        accountCID: sync?.cid,
      }))
    }
  }

  const loadNext = async () => {
    try {
      setPagination(v => ({ ...v, loading: true }))
      const lastId = pagination?.list.length
        ? pagination.list[pagination.list.length - 1].id
        : undefined
      let objects = await account.objects({
        before: lastId ? increaseObjectId(lastId) : undefined,
        limit: limit + 2,
      })

      const start = lastId ? objects.findIndex(i => i.id >= lastId) : -1
      const hasPrevious = start >= 0
      objects = hasPrevious ? objects.slice(start + 1) : objects

      const hasNext = objects.length > limit
      objects = hasNext ? objects.slice(0, limit) : objects

      setPagination(v => ({
        ...v,
        list: objects,
        hasPrevious,
        hasNext,
      }))
    } finally {
      setPagination(v => ({
        ...v,
        loading: false,
        accountCID: sync?.cid,
      }))
    }
  }

  useEffect(() => {
    if (pagination.list.length === 0) {
      loadNext()
    }
  }, [account])

  return {
    ...pagination,
    loadPrevious,
    loadNext,
  }
}

export function useAutoRefreshObjectPagination({
  accountState: { account, sync },
  limit,
}: {
  accountState: AccountState
  limit: number
}) {
  const [pagination, setPagination] = useRecoilState(objectPaginationState(account))

  useEffect(() => {
    ;(async () => {
      if (sync?.cid && sync.cid === pagination.accountCID) {
        return
      }

      const firstId = pagination.list[0]?.id

      const hasPrevious = firstId
        ? (await account.objects({ after: firstId, limit: 1 })).length > 0
        : false

      let objects = await account.objects({
        before: firstId ? increaseObjectId(firstId) : undefined,
        limit: limit + 1,
      })

      const hasNext = objects.length > limit
      objects = hasNext ? objects.slice(0, limit) : objects

      setPagination(v => ({
        ...v,
        list: objects,
        hasPrevious,
        hasNext,
        accountCID: sync?.cid,
      }))
    })()
  }, [sync?.cid])
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
              list: v.list.filter(i => i.id !== object.id),
            }
        )
        await account.deleteObject(object.id)
      },
    []
  )
}

export function useCreateObject({ account }: { account: Account }) {
  const paginationState = objectPaginationState(account)

  return useRecoilCallback(
    ({ set }) =>
      async () => {
        const object = await account.object()
        set(
          paginationState,
          v =>
            v && {
              ...v,
              list: [object].concat(v.list),
            }
        )
        return object
      },
    []
  )
}

function increaseObjectId(id: string): string {
  const a = id.split('')

  let i = a.length
  while (i > 0) {
    i--
    const c = a[i].charCodeAt(0)

    if (c === 57) {
      a[i] = '0'
    } else if (c === 90) {
      a[i] = 'A'
    } else if (c === 122) {
      a[i] = 'a'
    } else if ((c >= 48 && c < 57) || (c >= 65 && c < 90) || (c >= 97 && c < 122)) {
      a[i] = String.fromCharCode(c + 1)
      break
    } else {
      throw new Error(`Invalid object id ${id}`)
    }
  }

  const newId = a.join('')
  if (newId === id) {
    throw new Error(`Can not increase object id ${id}`)
  }

  return newId
}

function decreaseObjectId(id: string): string {
  const a = id.split('')

  let i = a.length
  while (i > 0) {
    i--
    const c = a[i].charCodeAt(0)

    if (c === 48) {
      a[i] = '9'
    } else if (c === 65) {
      a[i] = 'Z'
    } else if (c === 97) {
      a[i] = 'z'
    } else if ((c > 48 && c <= 57) || (c > 65 && c <= 90) || (c > 97 && c <= 122)) {
      a[i] = String.fromCharCode(c - 1)
      break
    } else {
      throw new Error(`Invalid object id ${id}`)
    }
  }

  const newId = a.join('')
  if (newId === id) {
    throw new Error(`Can not decrease object id ${id}`)
  }

  return newId
}
