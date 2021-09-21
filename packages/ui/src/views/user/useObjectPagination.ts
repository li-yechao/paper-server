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

import Object from '@paper/core/src/object'
import { useEffect } from 'react'
import { atom, useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil'
import { accountSelector } from '../../state/account'

interface AccountObjectsState {
  iterator: AsyncIterator<Object>
  list: Object[]
  hasNext: boolean

  page: number
  limit: number
}

const accountObjectsState = atom<AccountObjectsState | null>({
  key: 'accountObjectsState',
  default: null,
  dangerouslyAllowMutability: true,
})

export interface ObjectPagination {
  list: Object[]
  page: number
  hasPrevious: boolean
  hasNext: boolean
  loadPrevious: () => Promise<void>
  loadNext: () => Promise<void>
}

export default function useObjectPagination({
  limit = 10,
}: { limit?: number } = {}): ObjectPagination {
  const account = useRecoilValue(accountSelector)
  const [state, setState] = useRecoilState(accountObjectsState)

  const withState = (cb: (s: AccountObjectsState) => Promise<void>) => {
    return async () => {
      const s =
        state ??
        (account && {
          iterator: account.drafts(),
          list: [],
          hasNext: true,
          page: 0,
          limit,
        })
      s && (await cb(s))
    }
  }

  const loadPrevious = withState(async state => {
    if (state.page > 0) {
      setState({ ...state, page: state.page - 1 })
    }
  })

  const loadNext = withState(async state => {
    const loadMore = async <T>(iterator: AsyncIterator<T>, limit: number) => {
      const list: Object[] = []
      while (list.length < limit) {
        const next = await iterator.next()
        if (next.value) {
          list.push(next.value)
        } else {
          break
        }
      }
      return list
    }

    const { iterator, page, limit, list } = state
    const newPage = page === 0 && list.length < limit ? 0 : page + 1
    // NOTE: Load one more to determine if there is a next page.
    const needLoadCount = (newPage + 1) * limit - list.length + 1
    const newList = needLoadCount > 0 ? list.concat(await loadMore(iterator, needLoadCount)) : list
    const hasNext = newList.length - list.length >= needLoadCount

    setState({
      ...state,
      list: newList,
      page: Math.min(Math.ceil(list.length / limit), newPage),
      hasNext,
    })
  })

  useEffect(() => {
    if (!state || state.list.length === 0) {
      loadNext()
    }
  }, [account])

  if (!state) {
    return {
      list: [],
      page: 0,
      hasPrevious: false,
      hasNext: false,
      loadPrevious,
      loadNext,
    }
  }

  const offset = state.page * state.limit

  return {
    list: state.list.slice(offset, offset + state.limit),
    page: state.page,
    hasPrevious: state.page > 0,
    hasNext: state.hasNext || state.page < Math.ceil(state.list.length / state.limit) - 1,
    loadPrevious,
    loadNext,
  }
}

export function useCreateDraft() {
  return useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const account = await snapshot.getPromise(accountSelector)
        if (account) {
          const draft = await account.createDraft()
          set(
            accountObjectsState,
            v =>
              v && {
                ...v,
                list: [draft].concat(v.list),
              }
          )
        }
      },
    []
  )
}
