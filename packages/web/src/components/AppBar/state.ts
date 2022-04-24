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

import produce from 'immer'
import { ComponentType } from 'react'
import { atom, useRecoilCallback, useRecoilValue } from 'recoil'

export interface HeaderAction<P = unknown, C = ComponentType<P>> {
  placement?: 'left' | 'right'
  key: string | number
  component: C
  props: P
}

const headerActionsState = atom<{ left: HeaderAction[]; right: HeaderAction[] }>({
  key: 'headerActionsState',
  default: {
    left: [],
    right: [],
  },
  dangerouslyAllowMutability: true,
})

export function useHeaderActions() {
  return useRecoilValue(headerActionsState)
}

export function useHeaderActionsCtrl() {
  const append = useRecoilCallback(
    ({ set }) =>
      (action: HeaderAction<unknown>) => {
        set(headerActionsState, state => {
          return produce(state, draft => {
            const placement = action.placement || 'right'
            const actions = draft[placement]
            const a = actions.find(i => i.key === action.key)
            if (a) {
              Object.assign(a, action)
            } else {
              actions.push(action)
            }
          })
        })
      },
    []
  )

  const remove = useRecoilCallback(
    ({ set }) =>
      (action: HeaderAction<unknown>) => {
        set(headerActionsState, state => {
          return produce(state, draft => {
            const placement = action.placement || 'right'
            const actions = draft[placement]
            const index = actions.findIndex(i => i.key === action.key)
            if (index >= 0) {
              actions.splice(index, 1)
            }
          })
        })
      },
    []
  )

  return {
    append,
    remove,
  }
}
