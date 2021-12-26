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
import Editor, { EditorState } from '@paper/editor'
import FileSaver from 'file-saver'
import { debounce } from 'lodash'
import { useSnackbar } from 'notistack'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useBeforeUnload, useMountedState, useToggle } from 'react-use'
import ArrowMenu from '../../../components/ArrowMenu'
import Markdown from '../../../components/Icons/Markdown'
import NetworkIndicator, { useToggleNetworkIndicator } from '../../../components/NetworkIndicator'
import { defaultMarks, defaultNodes, defaultPlugins } from '../../../editor/schema'
import toMarkdown from '../../../editor/toMarkdown'
import { useAccount } from '../../../state/account'
import { HeaderAction, useHeaderActionsCtrl } from '../../../state/header'
import { Paper, usePaper } from '../../../state/paper'
import useAsync from '../../../utils/useAsync'
import useOnSave from '../../../utils/useOnSave'

const AUTO_SAVE_WAIT_MS = 5 * 1000
const AUTO_SAVE_MAX_WAIT_MS = 30 * 1000

export default function ObjectView() {
  const mounted = useMountedState()

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

  const ref = useRef<{ state?: EditorState; version: number; savedVersion: number }>({
    state: undefined,
    version: 0,
    savedVersion: 0,
  })

  const [changed, toggleChanged] = useToggle(false)

  const save = useCallback(async () => {
    if (!mounted()) {
      return
    }
    const { state, version, savedVersion } = ref.current
    if (paper && state && version !== savedVersion) {
      const title = state.doc.firstChild?.textContent.slice(0, 100)

      await paper.setContent(state.doc.toJSON())
      await paper.setInfo({ title })

      ref.current.savedVersion = version
      if (mounted()) {
        toggleChanged(false)
      }
    }
  }, [paper])

  useEffect(() => {
    return () => {
      save()
    }
  }, [userId, objectId])

  useEffect(() => {
    if (changed) {
      document.title = document.title.replace(/^\**/, '*')
    } else {
      document.title = document.title.replace(/^\**/, '')
    }
  }, [changed])

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

  const extensions = useAsync(async () => {
    const autoSave = debounce(save, AUTO_SAVE_WAIT_MS, { maxWait: AUTO_SAVE_MAX_WAIT_MS })

    const content = await paper.getContent()

    const uploadOptions: Parameters<typeof defaultNodes>[0]['imageBlockOptions'] = {
      upload: async (file: File) => {
        const files = [new File([file], 'image'), new File([file], `original/${file.name}`)]
        return paper.addResource(files)
      },
      getSrc: async cid => {
        const file = await paper.getResource(cid, 'image')
        return URL.createObjectURL(file)
      },
      thumbnail: {
        maxSize: 1024,
      },
    }

    return [
      ...defaultNodes({ imageBlockOptions: uploadOptions }),
      ...defaultMarks(),
      ...defaultPlugins({
        imageBlockOptions: uploadOptions,
        valueOptions: {
          defaultValue: content,
          editable: true,
          onDispatchTransaction: (view, tr) => {
            if (tr.docChanged) {
              ref.current.version += 1
              ref.current.state = view.state
              toggleChanged(true)
              autoSave()
            }
          },
        },
      }),
    ]
  }, [paper])

  useOnSave(save, [save])

  useBeforeUnload(() => {
    return ref.current.version !== ref.current.savedVersion
  }, 'Discard changes?')

  if (extensions.error) {
    throw extensions.error
  }

  return extensions.loading ? <NetworkIndicator in /> : <_Editor extensions={extensions.value} />
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
