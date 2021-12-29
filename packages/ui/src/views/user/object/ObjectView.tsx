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

import styled from '@emotion/styled'
import { CloudDownload } from '@mui/icons-material'
import { IconButton, ListItemIcon, ListSubheader, MenuItem } from '@mui/material'
import Editor from '@paper/editor'
import FileSaver from 'file-saver'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useBeforeUnload } from 'react-use'
import ArrowMenu from '../../../components/ArrowMenu'
import Markdown from '../../../components/Icons/Markdown'
import { useToggleNetworkIndicator } from '../../../components/NetworkIndicator'
import toMarkdown from '../../../editor/toMarkdown'
import { useAccount } from '../../../state/account'
import { HeaderAction, useHeaderActionsCtrl } from '../../../state/header'
import { Paper, usePaper } from '../../../state/paper'
import useOnSave from '../../../utils/useOnSave'

export default function ObjectView() {
  const { userId, objectId } = useParams<'userId' | 'objectId'>()
  if (!userId) {
    throw new Error('Required params userId is not present')
  }
  if (!objectId) {
    throw new Error('Required params objectId is not present')
  }

  const { account } = useAccount()
  if (account.user.id !== userId) {
    throw new Error('Forbidden')
  }

  const paper = usePaper({ account, objectId })

  useEffect(() => {
    return () => {
      paper.save()
    }
  }, [paper])

  useOnSave(() => paper.save(), [paper])

  useBeforeUnload(() => {
    return paper.changed
  }, 'Discard changes?')

  const headerActionsCtrl = useHeaderActionsCtrl()

  useEffect(() => {
    const exportButton: HeaderAction<React.ComponentProps<typeof MenuButton>> = {
      key: 'ObjectView-MenuButton',
      component: MenuButton,
      props: { paper },
    }
    headerActionsCtrl.set(exportButton)

    return () => headerActionsCtrl.remove(exportButton)
  }, [paper])

  return <_Editor state={paper.state} />
}

const _Editor = styled(Editor)`
  min-height: 100vh;
  padding: 8px;
  padding-bottom: 100px;
  max-width: 800px;
  margin: auto;
`

const MenuButton = ({ paper }: { paper: Paper }) => {
  const snackbar = useSnackbar()
  const toggleNetworkIndicator = useToggleNetworkIndicator({ autoClose: false })
  const [anchorEl, setAnchorEl] = useState<Element>()

  const handleMenuOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(undefined)
  }

  const handleExportToMarkdown = async () => {
    handleMenuClose()
    try {
      toggleNetworkIndicator(true)
      const doc = await paper.getContent()
      if (doc) {
        const markdown = toMarkdown(doc)
        const blob = new Blob([new TextEncoder().encode(markdown)])
        FileSaver.saveAs(blob, `${(await paper.info).title || 'Untitled'}.md`)
      }
    } catch (error) {
      snackbar.enqueueSnackbar(error.message, { variant: 'error' })
      console.error(error)
    } finally {
      toggleNetworkIndicator(false)
    }
  }

  return (
    <>
      <IconButton onClick={handleMenuOpen}>
        <CloudDownload />
      </IconButton>

      <ArrowMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        keepMounted
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        onClose={handleMenuClose}
      >
        <ListSubheader>Export To</ListSubheader>
        <MenuItem onClick={handleExportToMarkdown}>
          <ListItemIcon>
            <Markdown fontSize="small" />
          </ListItemIcon>
          Markdown
        </MenuItem>
      </ArrowMenu>
    </>
  )
}
