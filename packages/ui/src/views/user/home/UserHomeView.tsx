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
import { DeleteOutline, KeyboardArrowLeft, KeyboardArrowRight, MoreVert } from '@mui/icons-material'
import {
  Button,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
  MenuItem,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { Box } from '@mui/system'
import { Account } from '@paper/core'
import FileSaver from 'file-saver'
import { useSnackbar } from 'notistack'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { FormattedDate } from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'
import ArrowMenu from '../../../components/ArrowMenu'
import Markdown from '../../../components/Icons/Markdown'
import { useToggleNetworkIndicator } from '../../../components/NetworkIndicator'
import toMarkdown from '../../../editor/toMarkdown'
import { useAccount } from '../../../state/account'
import { useDeleteObject, useObjectPagination } from '../../../state/object'
import { Paper, usePaper } from '../../../state/paper'
import useAsync from '../../../utils/useAsync'

export default function UserHomeView() {
  const userId = useParams<'userId'>().userId
  if (!userId) {
    throw new Error('Required params userId is not present')
  }

  const snackbar = useSnackbar()
  const navigate = useNavigate()
  const toggleNetworkIndicator = useToggleNetworkIndicator({ autoClose: false })

  const accountState = useAccount()
  const { account } = accountState
  if (account.user.id !== userId) {
    throw new Error('Forbidden')
  }

  const pagination = useObjectPagination({ accountState, limit: 10 })
  const [menuState, setMenuState] = useState<{ anchorEl: Element; paper: Paper }>()

  const handleToDetail = (_: React.MouseEvent<Element>, paper: Paper) => {
    navigate(`/${userId}/${paper.object.id}`, {
      state: { before: pagination.before, after: pagination.after },
    })
  }

  const handleOpenMenu = (e: React.MouseEvent<Element>, paper: Paper) => {
    e.stopPropagation()
    setMenuState({ anchorEl: e.currentTarget, paper })
  }

  const handleCloseMenu = () => setMenuState(undefined)

  const deleteObject = useDeleteObject({ account })
  const handleDelete = async () => {
    try {
      toggleNetworkIndicator(true)
      const paper = menuState?.paper
      handleCloseMenu()
      paper && (await deleteObject(paper.object))
    } finally {
      toggleNetworkIndicator(false)
    }
  }

  const handleExportToMarkdown = async () => {
    const paper = menuState?.paper
    handleCloseMenu()
    if (paper) {
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
  }

  return (
    <Box maxWidth={800} pb={8} margin="auto">
      <List>
        {!pagination.list.length ? (
          pagination.loading ? (
            <>
              <ObjectItem.Skeleton />
              <ObjectItem.Skeleton />
              <ObjectItem.Skeleton />
            </>
          ) : (
            <Typography
              component="p"
              variant="h6"
              textAlign="center"
              sx={{ py: 10, color: 'text.secondary' }}
            >
              Nothing...
            </Typography>
          )
        ) : (
          pagination.list.map(objectId => (
            <ObjectItem
              key={objectId}
              account={account}
              objectId={objectId}
              onClick={handleToDetail}
              onMenuClick={handleOpenMenu}
            />
          ))
        )}
      </List>

      {pagination.list.length > 0 && (
        <Stack spacing={2} direction="row" justifyContent="center">
          <Button
            disabled={!pagination.hasPrevious}
            onClick={pagination.loadPrevious}
            startIcon={<KeyboardArrowLeft />}
          >
            Previous
          </Button>

          <Button
            disabled={!pagination.hasNext}
            onClick={pagination.loadNext}
            endIcon={<KeyboardArrowRight />}
          >
            Next
          </Button>
        </Stack>
      )}

      <ArrowMenu
        anchorEl={menuState?.anchorEl}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        open={Boolean(menuState)}
        onClose={handleCloseMenu}
      >
        <ListSubheader>Export To</ListSubheader>
        <MenuItem onClick={handleExportToMarkdown}>
          <ListItemIcon>
            <Markdown fontSize="small" />
          </ListItemIcon>
          Markdown
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteOutline fontSize="small" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </ArrowMenu>
    </Box>
  )
}

function ObjectItem({
  account,
  objectId,
  onClick,
  onMenuClick,
}: {
  account: Account
  objectId: string
  onClick: (e: React.MouseEvent<Element>, paper: Paper) => void
  onMenuClick: (e: React.MouseEvent<Element>, paper: Paper) => void
}) {
  const { objectId: currentObjectId } = useParams<'objectId'>()
  const [cid, setCID] = useState<string>()
  const paper = usePaper({ account, objectId })
  const info = useAsync(() => paper.info, [cid])
  const updatedAt = useAsync(() => paper.object.updatedAt, [])

  useEffect(() => {
    const onChange = (e: { cid: string }) => {
      setCID(e.cid)
    }
    paper.object.files.on('change', onChange)
    return () => {
      paper.object.files.off('change', onChange)
    }
  }, [paper])

  if (info.loading) {
    return <ObjectItem.Skeleton />
  } else if (info.error) {
    return <ObjectItem.Skeleton error={info.error} />
  } else {
    const { title } = info.value
    const time = updatedAt.value || paper.object.createdAt

    return (
      <_ListItemButton
        divider
        selected={objectId === currentObjectId}
        onClick={e => onClick(e, paper)}
      >
        <ListItemText
          primary={title || 'Untitled'}
          primaryTypographyProps={{ noWrap: true }}
          secondary={
            <Typography variant="caption">
              <FormattedDate
                value={time}
                year="numeric"
                month="numeric"
                day="numeric"
                hour="numeric"
                hour12={false}
                minute="numeric"
              />
            </Typography>
          }
        />

        <ListItemSecondaryAction>
          <IconButton edge="end" onClick={e => onMenuClick(e, paper)}>
            <MoreVert />
          </IconButton>
        </ListItemSecondaryAction>
      </_ListItemButton>
    )
  }
}

const _ListItemButton = styled(ListItemButton)`
  > .MuiListItemSecondaryAction-root {
    display: none;
  }

  &:hover {
    > .MuiListItemSecondaryAction-root {
      display: block;
    }
  }
`

ObjectItem.Skeleton = ({ error }: { error?: Error }) => {
  if (error) {
    return (
      <ListItemButton disabled divider>
        <ListItemText primary={error.message} primaryTypographyProps={{ color: 'error.main' }} />
      </ListItemButton>
    )
  }

  return (
    <ListItemButton disabled divider>
      <ListItemText primary={<Skeleton variant="text" />} secondary={<Skeleton variant="text" />} />
    </ListItemButton>
  )
}
