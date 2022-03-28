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

import { ComponentType, PureComponent, ReactNode, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export default function ErrorBoundary({
  children,
  fallback,
}: {
  children: ReactNode
  fallback: ComponentType<{ error: Error; reset: () => void }>
}) {
  const boundary = useRef<_ErrorBoundary>(null)
  const location = useLocation()

  useEffect(() => {
    boundary.current?.reset()
  }, [location])

  return (
    <_ErrorBoundary ref={boundary} fallback={fallback}>
      {children}
    </_ErrorBoundary>
  )
}

class _ErrorBoundary extends PureComponent<
  { fallback: ComponentType<{ error: Error; reset: () => void }> },
  { error?: Error }
> {
  override state = {
    error: undefined,
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  reset = () => this.setState({ error: undefined })

  override render() {
    const { error } = this.state
    const { fallback: Fallback } = this.props
    return error ? <Fallback error={error} reset={this.reset} /> : this.props.children
  }
}

ErrorBoundary.Root = _ErrorBoundary
