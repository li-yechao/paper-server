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
import { createContext, ReactElement, ReactNode, useContext, useEffect, useRef } from 'react'
import { useNumber } from 'react-use'

export interface NetworkIndicatorProps {
  in?: boolean
}

export default function NetworkIndicator(props: NetworkIndicatorProps = {}) {
  const ctx = useContext(networkIndicatorContext)
  const isIn = useRef(false)

  useEffect(() => {
    if (props.in && !isIn.current) {
      isIn.current = true
      ctx.inc()
    } else if (!props.in && isIn.current) {
      isIn.current = false
      ctx.dec()
    }
  }, [props.in])

  useEffect(() => {
    return () => {
      if (isIn.current) {
        isIn.current = false
        ctx.dec()
      }
    }
  }, [])

  return null
}

const networkIndicatorContext = createContext({
  count: 0,
  inc: () => {},
  dec: () => {},
})

NetworkIndicator.Provider = ({ children }: { children?: ReactNode }) => {
  const [count, actions] = useNumber(0, undefined, 0)

  return (
    <networkIndicatorContext.Provider
      value={{ count, inc: actions.inc, dec: actions.dec }}
      children={children}
    />
  )
}

NetworkIndicator.Renderer = ({ children }: { children: ReactElement<any, any> }) => {
  const { count } = useContext(networkIndicatorContext)

  return <Fade in={count > 0}>{children}</Fade>
}
