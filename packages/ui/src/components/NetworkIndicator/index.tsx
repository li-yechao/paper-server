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

import { Fade } from '@mui/material'
import {
  createContext,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react'
import { useNumber } from 'react-use'

export interface NetworkIndicatorProps {
  in?: boolean
}

export default function NetworkIndicator(props: NetworkIndicatorProps = {}) {
  const toggle = useToggleNetworkIndicator()

  useEffect(() => {
    toggle(Boolean(props.in))
  }, [props.in])

  return null
}

const networkIndicatorContext = createContext({ count: 0 })

const networkIndicatorActionsContext = createContext({ inc: () => {}, dec: () => {} })

export function useToggleNetworkIndicator({ autoClose = true }: { autoClose?: boolean } = {}) {
  const actions = useContext(networkIndicatorActionsContext)
  const visible = useRef(false)

  const toggle = useCallback((on?: boolean) => {
    const b =
      on === true && visible.current === false
        ? true
        : on === false && visible.current === true
        ? false
        : on === undefined
        ? !visible.current
        : undefined

    if (b !== undefined) {
      b ? actions.inc() : actions.dec()
      visible.current = b
    }
  }, [])

  useEffect(() => {
    return () => {
      if (autoClose && visible.current) {
        toggle(false)
      }
    }
  }, [autoClose])

  return toggle
}

NetworkIndicator.Provider = ({ children }: { children?: ReactNode }) => {
  const [count, actions] = useNumber(0, undefined, 0)

  return (
    <networkIndicatorActionsContext.Provider value={actions}>
      <networkIndicatorContext.Provider value={{ count }} children={children} />
    </networkIndicatorActionsContext.Provider>
  )
}

NetworkIndicator.Renderer = ({ children }: { children: ReactElement<any, any> }) => {
  const { count } = useContext(networkIndicatorContext)

  return <Fade in={count > 0}>{children}</Fade>
}
