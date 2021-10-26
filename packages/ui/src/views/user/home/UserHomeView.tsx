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
import * as React from 'react'
import { useState } from 'react'
import { FormattedDate } from 'react-intl'
import { RouteComponentProps, useHistory } from 'react-router-dom'
import { useAsync } from 'react-use'
import { useRecoilValue } from 'recoil'
import { useToggleNetworkIndicator } from '../../../components/NetworkIndicator'
import { accountSelector } from '../../../state/account'
import { ForbiddenViewLazy } from '../../error'
import useObjectPagination, { useDeleteObject } from '../useObjectPagination'

export interface UserHomeViewProps extends Pick<RouteComponentProps<{ userId: string }>, 'match'> {}

export default function UserHomeView(props: UserHomeViewProps) {
  const account = useRecoilValue(accountSelector)

  if (account.userId !== props.match.params.userId) {
    return <ForbiddenViewLazy />
  }

  return <ObjectList />
}

const ObjectList = () => {
  const account = useRecoilValue(accountSelector)
  const pagination = useObjectPagination()
  const [menuState, setMenuState] = useState<{ anchorEl: Element; object: Object }>()

  const handleOpenMenu = (e: React.MouseEvent<Element>, object: Object) => {
    e.stopPropagation()
    setMenuState({ anchorEl: e.currentTarget, object })
  }

  const handleCloseMenu = () => setMenuState(undefined)

  const deleteObject = useDeleteObject()
  const handleDelete = async () => {
    const object = menuState?.object
    handleCloseMenu()
    object && (await deleteObject(object))
  }

  return (
    <Box maxWidth={800} margin="auto">
      <List>
        {pagination.list.map(object => (
          <ObjectItem key={object.id} account={account} object={object} openMenu={handleOpenMenu} />
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
  object,
  openMenu,
}: {
  account: Account
  object: Object
  openMenu: (e: React.MouseEvent<Element>, object: Object) => void
}) {
  const history = useHistory()
  const info = useAsync(() => object.info, [object])
  const toggleNetworkIndicator = useToggleNetworkIndicator({ autoClose: false })

  const handleItemClick = () => {
    history.push(`/${account.userId}/${object.id}`)
  }

  const handlePublish = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      toggleNetworkIndicator(true)
      await object.publish()
    } finally {
      toggleNetworkIndicator(false)
    }
  }

  if (info.loading) {
    return <ObjectItem.Skeleton />
  } else if (info.error) {
    return <ObjectItem.Skeleton error={info.error} />
  } else if (info.value) {
    const { title, updatedAt } = info.value
    const time = updatedAt ?? object.createdAt

    return (
      <_ListItemButton divider onClick={handleItemClick}>
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
            <IconButton onClick={e => handlePublish(e)}>
              <Publish />
            </IconButton>
          )}
          <IconButton edge="end" onClick={e => openMenu(e, object)}>
            <MoreVert />
          </IconButton>
        </ListItemSecondaryAction>
      </_ListItemButton>
    )
  }
  return null
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
