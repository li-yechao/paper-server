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

import { ComponentType, LazyExoticComponent, PropsWithoutRef, Suspense } from 'react'

export default function LazyView<P>(C: LazyExoticComponent<ComponentType<P>>) {
  return (props: PropsWithoutRef<P>) => {
    return (
      <Suspense fallback={<Loading />}>
        <C {...props} />
      </Suspense>
    )
  }
}

const Loading = () => {
  return <></>
}
