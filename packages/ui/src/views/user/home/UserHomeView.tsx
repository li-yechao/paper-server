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
import { KeyboardArrowLeft, KeyboardArrowRight, MoreVert, Publish } from '@mui/icons-material'
import {
  Button,
  Chip,
  IconButton,
  List,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { Box } from '@mui/system'
import { Account } from '@paper/core'
import Object from '@paper/core/src/object'
import { useSnackbar } from 'notistack'
import * as React from 'react'
import { useState } from 'react'
import { FormattedDate } from 'react-intl'
import { RouteComponentProps } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import { useToggleNetworkIndicator } from '../../../components/NetworkIndicator'
import { accountSelector } from '../../../state/account'
import { useDeleteObject, useObject, useObjectPagination } from '../../../state/object'
import useAsync from '../../../utils/useAsync'

export interface UserHomeViewProps extends RouteComponentProps<{ userId: string }> {}

export default function UserHomeView(props: UserHomeViewProps) {
  const { userId } = props.match.params
  const toggleNetworkIndicator = useToggleNetworkIndicator({ autoClose: false })

  const account = useRecoilValue(accountSelector)
  if (account.userId !== userId) {
    throw new Error('Forbidden')
  }

  const pagination = useObjectPagination({ account, limit: 10 })
  const [menuState, setMenuState] = useState<{ anchorEl: Element; object: Object }>()

  const handleToDetail = (_: React.MouseEvent<Element>, object: Object) => {
    props.history.push(`/${userId}/${object.id}`)
  }

  const handleOpenMenu = (e: React.MouseEvent<Element>, object: Object) => {
    e.stopPropagation()
    setMenuState({ anchorEl: e.currentTarget, object })
  }

  const handleCloseMenu = () => setMenuState(undefined)

  const deleteObject = useDeleteObject({ account })
  const handleDelete = async () => {
    try {
      toggleNetworkIndicator(true)
      const object = menuState?.object
      handleCloseMenu()
      object && (await deleteObject(object))
    } finally {
      toggleNetworkIndicator(false)
    }
  }

  return (
    <Box maxWidth={800} margin="auto">
      <List>
        {pagination.list.map(objectId => (
          <ObjectItem
            key={objectId}
            account={account}
            objectId={objectId}
            onClick={handleToDetail}
            onMenuClick={handleOpenMenu}
          />
        ))}
      </List>

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

      <Menu
        anchorEl={menuState?.anchorEl}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        open={Boolean(menuState)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>
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
  onClick: (e: React.MouseEvent<Element>, object: Object) => void
  onMenuClick: (e: React.MouseEvent<Element>, object: Object) => void
}) {
  const snackbar = useSnackbar()
  const { object, publish } = useObject({ account, objectId })
  const info = useAsync(() => object.info, [object.version])
  const toggleNetworkIndicator = useToggleNetworkIndicator({ autoClose: false })

  const handlePublish = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      toggleNetworkIndicator(true)
      await publish()
      snackbar.enqueueSnackbar('Publish Success', { variant: 'success' })
    } catch (error) {
      snackbar.enqueueSnackbar(`Publish Failed: ${error.message}`, { variant: 'error' })
      throw error
    } finally {
      toggleNetworkIndicator(false)
    }
  }

  if (info.loading) {
    return <ObjectItem.Skeleton />
  } else if (info.error) {
    return <ObjectItem.Skeleton error={info.error} />
  } else {
    const { title, updatedAt } = info.value
    const time = updatedAt ?? object.createdAt

    return (
      <_ListItemButton divider onClick={e => onClick(e, object)}>
        <ListItemText
          primary={title || 'Untitled'}
          secondary={
            <>
              {info.value.isDraft && (
                <Chip label="unpublished" component="span" size="small" variant="outlined" />
              )}
              <br />
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
            </>
          }
        />

        <ListItemSecondaryAction>
          {info.value.isDraft && (
            <IconButton onClick={handlePublish}>
              <Publish />
            </IconButton>
          )}
          <IconButton edge="end" onClick={e => onMenuClick(e, object)}>
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
