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

import { RouteComponentProps } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import { accountSelector } from '../../../state/account'
import { ForbiddenViewLazy } from '../../error'

export interface UserHomeViewProps extends Pick<RouteComponentProps<{ name: string }>, 'match'> {}

export default function UserHomeView(props: UserHomeViewProps) {
  const account = useRecoilValue(accountSelector)

  if (account?.name !== props.match.params.name) {
    return <ForbiddenViewLazy />
  }

  return (
    <div>
      <div>Welcome {account.name}</div>
    </div>
  )
}
