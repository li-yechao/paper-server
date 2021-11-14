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

import { LoadingButton } from '@mui/lab'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import { useCallback } from 'react'
import { useToggle } from 'react-use'
import { useRegisterSW } from 'virtual:pwa-register/react'

export default function ServiceWorkerPrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  const [cancelled, toggleCancelled] = useToggle(false)
  const [refreshing, toggleRefreshing] = useToggle(false)

  const refresh = useCallback(async () => {
    try {
      toggleRefreshing(true)
      await updateServiceWorker(true)
    } finally {
      toggleRefreshing(false)
    }
  }, [])

  const close = useCallback(() => {
    if (refreshing) {
      return
    }
    toggleCancelled(true)
  }, [refreshing])

  return (
    <Dialog open={!cancelled && needRefresh} onClose={close}>
      <DialogTitle>New Version</DialogTitle>
      <DialogContent>
        <DialogContentText>A new version of Paper is available，Upgrade now?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={refreshing}>
          Cancel
        </Button>
        <LoadingButton onClick={refresh} autoFocus loading={refreshing}>
          Upgrade
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
