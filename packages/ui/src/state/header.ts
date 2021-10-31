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

import { ComponentType } from 'react'
import { atom, useRecoilCallback, useRecoilValue } from 'recoil'

export interface HeaderAction<P = any, C = ComponentType<P>> {
  key: string | number
  component: C
  props: P
}

const headerActionsState = atom<HeaderAction[]>({
  key: 'headerActionsState',
  default: [],
})

export function useHeaderActions() {
  return useRecoilValue(headerActionsState)
}

export function useHeaderActionsCtrl() {
  const setAction = useRecoilCallback(
    ({ set }) =>
      (action: HeaderAction<any>) => {
        set(headerActionsState, actions => {
          const as = [...actions]
          const a = as.find(i => i.key === action.key)
          if (a) {
            Object.assign(a, action)
          } else {
            as.push(action)
          }
          return as
        })
      },
    []
  )

  const removeAction = useRecoilCallback(
    ({ set }) =>
      (action: HeaderAction<any>) => {
        set(headerActionsState, v => v.filter(i => i !== action))
      },
    []
  )

  return {
    set: setAction,
    remove: removeAction,
  }
}
