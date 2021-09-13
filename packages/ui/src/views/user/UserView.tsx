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

import Ipfs from '@paper/ipfs'
import { useMemo } from 'react'
import { Route, RouteComponentProps, Switch } from 'react-router'
import { NotFoundViewLazy } from '../error'
import { UserHomeViewLazy } from './home'

export interface UserViewProps extends Pick<RouteComponentProps<{ name: string }>, 'match'> {}

export default function UserView(props: UserViewProps) {
  const { name } = props.match.params
  const id = useMemo(() => {
    try {
      return Ipfs.PeerId.parse(name)
    } catch {
      return null
    }
  }, [name])

  if (!id) {
    return <NotFoundViewLazy />
  }

  return (
    <Switch>
      <Route
        path={`${props.match.path}`}
        exact
        render={() => <UserHomeViewLazy match={props.match} />}
      />
      <Route path="*" component={NotFoundViewLazy} />
    </Switch>
  )
}
