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

import { gql, QueryHookOptions, useQuery } from '@apollo/client'

export interface Viewer {
  id: string
  name?: string
}

export const VIEWER_QUERY = gql`
  query Viewer {
    viewer {
      id
      name
    }
  }
`

export const useViewer = (options?: QueryHookOptions<{ viewer: Viewer }>) => {
  return useQuery(VIEWER_QUERY, options)
}

export const useCurrentUser = () => {
  const viewer = useViewer()
  if (!viewer.data) {
    throw viewer.error || new Error('Unauthorized')
  }
  return viewer.data.viewer
}
