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
import { useNavigate, useSearchParams } from 'react-router-dom'

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
  before: string | null
  after: string | null
  list: Object[]
  hasPrevious: boolean
  hasNext: boolean
}

const objectPaginationState = memoize(
  (account: Account) => {
    return atom<ObjectPagination>({
      key: `objectPaginationState-${account.user.id}`,
      default: {
        loading: false,
        before: null,
        after: null,
        list: [],
        hasPrevious: false,
        hasNext: false,
      },
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
  loadPrevious: () => void
  loadNext: () => void
} {
  const navigate = useNavigate()
  const [search] = useSearchParams()
  const before = search.get('before')
  const after = search.get('after')
  const [pagination, setPagination] = useRecoilState(objectPaginationState(account))

  const loadFirstPage = () => {
    const s = new URLSearchParams(search)
    s.delete('after')
    s.delete('before')
    navigate({ search: s.toString() }, { replace: true })
  }

  const loadPrevious = () => {
    const first = pagination.list[0]
    if (!first) {
      return
    }
    const s = new URLSearchParams(search)
    s.set('after', first.id)
    s.delete('before')
    navigate({ search: s.toString() }, { replace: true })
  }

  const loadNext = () => {
    const last = pagination.list[pagination.list.length - 1]
    if (!last) {
      return
    }
    const s = new URLSearchParams(search)
    s.set('before', last.id)
    s.delete('after')
    navigate({ search: s.toString() }, { replace: true })
  }

  const loadPagination = async () => {
    setPagination(v => ({ ...v, loading: true }))
    try {
      const page = await getObjectPagination({ account, before, after, limit })

      if (page.list.length < limit && page.hasNext) {
        loadFirstPage()
        return
      }
      const cid = await account.cid
      setPagination(v => ({ ...v, ...page, accountCID: cid }))
    } finally {
      setPagination(v => ({ ...v, loading: false }))
    }
  }

  useEffect(() => {
    loadPagination()
  }, [before, after, sync?.cid, pagination.accountCID])

  return {
    ...pagination,
    loadPrevious,
    loadNext,
  }
}

export function useDeleteObject({ account }: { account: Account }) {
  const paginationState = objectPaginationState(account)

  return useRecoilCallback(
    ({ set }) =>
      async (object: Object) => {
        await account.deleteObject(object.id)
        const accountCID = await account.cid
        set(paginationState, v => v && { ...v, accountCID })
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
        const accountCID = await account.cid
        set(paginationState, v => v && { ...v, accountCID })
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

async function getObjectPagination({
  account,
  before,
  after,
  limit,
}: {
  account: Account
  before?: string | null
  after?: string | null
  limit: number
}) {
  let hasPrevious: boolean, hasNext: boolean, list: Object[]

  if (before) {
    const objects = await account.objects({
      before: increaseObjectId(before),
      limit: limit + 2,
    })
    const startIndex = objects.findIndex(i => i.id >= before)
    hasPrevious = startIndex >= 0
    list = objects.slice(startIndex + 1)
    hasNext = list.length > limit
    if (hasNext) {
      list = list.slice(0, limit)
    }
  } else if (after) {
    const objects = await account.objects({
      after: decreaseObjectId(after),
      limit: limit + 2,
    })
    const endIndex = objects.findIndex(i => i.id <= after)
    hasNext = endIndex >= 0
    list = objects.slice(0, endIndex)
    hasPrevious = list.length > limit
    if (hasPrevious) {
      list = list.slice(-limit)
    }
  } else {
    const objects = await account.objects({
      limit: limit + 1,
    })
    hasPrevious = false
    hasNext = objects.length > limit
    list = objects.slice(0, limit)
  }
  return { hasPrevious, hasNext, list }
}
