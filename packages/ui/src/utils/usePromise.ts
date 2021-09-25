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

import { DependencyList } from 'react'

interface PromiseCache {
  promise: Promise<any>
  deps: DependencyList
  result?: any
  error?: Error
}

const CACHES: Set<PromiseCache> = new Set()

export default function usePromise<T>(factory: () => Promise<T>, deps: DependencyList): T {
  let cache!: PromiseCache

  for (const value of CACHES) {
    if (equal(value.deps, deps)) {
      cache = value
      break
    }
  }

  if (!cache) {
    const promise = factory()
    cache = {
      promise,
      deps,
      result: undefined,
      error: undefined,
    }
    promise
      .then(res => {
        cache.result = res
      })
      .catch(err => {
        cache.error = err
      })

    CACHES.add(cache)
  }

  if (cache.result) {
    return cache.result
  } else if (cache.error) {
    throw cache.error
  } else {
    throw cache.promise
  }
}

function equal(a: DependencyList, b: DependencyList): boolean {
  if (a.length !== b.length) {
    return false
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false
    }
  }
  return true
}
