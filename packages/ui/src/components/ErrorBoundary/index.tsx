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

import * as React from 'react'

export default class ErrorBoundary extends React.PureComponent<
  { fallback: React.ComponentType<{ error: Error; reset: () => void }> },
  { error?: Error }
> {
  state = {
    error: undefined,
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  reset = () => this.setState({ error: undefined })

  render() {
    const { error } = this.state
    const { fallback: Fallback } = this.props
    return error ? <Fallback error={error} reset={this.reset} /> : this.props.children
  }
}
