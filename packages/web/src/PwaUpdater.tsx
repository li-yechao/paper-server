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

import { Modal } from 'antd'
import { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export default function PwaUpdater() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  useEffect(() => {
    if (needRefresh) {
      Modal.confirm({
        title: 'New Version',
        content: 'A new version of Paper is available, Upgrade now?',
        onOk: () => updateServiceWorker(true),
      })
    }
  }, [needRefresh])

  return null
}
