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
import { forwardRef, memo, ReactNode, SVGProps } from 'react'

export default function createSvgIcon(path: ReactNode) {
  return memo(
    forwardRef<SVGSVGElement>((props, ref) => (
      <SvgIcon ref={ref} {...props}>
        {path}
      </SvgIcon>
    ))
  )
}

const SvgIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => {
  return <SvgIconRoot ref={ref} focusable="false" {...props} viewBox="0 0 24 24" />
})

const SvgIconRoot = styled.svg`
  user-select: none;
  width: 1em;
  height: 1em;
  line-height: 1em;
  font-size: inherit;
  display: inline-block;
  fill: currentColor;
  flex-shrink: 0;
  vertical-align: middle;
`
