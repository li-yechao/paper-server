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
import { KeyboardArrowLeft, KeyboardArrowRight, MoreVert } from '@mui/icons-material'
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
import { Account, Object } from '@paper/core'
import * as React from 'react'
import { useCallback, useState } from 'react'
import { FormattedDate } from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'
import { useToggleNetworkIndicator } from '../../../components/NetworkIndicator'
import { useAccount } from '../../../state/account'
import { useDeleteObject, useObjectPagination } from '../../../state/object'
import { usePaper } from '../../../state/paper'
import useAsync from '../../../utils/useAsync'

export default function UserHomeView() {
  const userId = useParams<'userId'>().userId
  if (!userId) {
    throw new Error('Required params userId is not present')
  }

  const navigate = useNavigate()
  const toggleNetworkIndicator = useToggleNetworkIndicator({ autoClose: false })

  const { account } = useAccount()
  if (account.user.id !== userId) {
    throw new Error('Forbidden')
  }

  const pagination = useObjectPagination({ account, limit: 10 })
  const [menuState, setMenuState] = useState<{ anchorEl: Element; object: Object }>()

  const handleToDetail = useCallback((_: React.MouseEvent<Element>, object: Object) => {
    navigate(`/${userId}/${object.id}`)
  }, [])

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
  const paper = usePaper({ account, objectId })
  const info = useAsync(() => Promise.all([paper.info, paper.object.updatedAt]), [paper.info])

  if (info.loading) {
    return <ObjectItem.Skeleton />
  } else if (info.error) {
    return <ObjectItem.Skeleton error={info.error} />
  } else {
    const { title, tags } = info.value[0]
    const updatedAt = info.value[1]
    const time = updatedAt ?? paper.object.createdAt

    return (
      <_ListItemButton divider onClick={e => onClick(e, paper.object)}>
        <ListItemText
          primary={title || 'Untitled'}
          secondary={
            <>
              <Box component="span" mx={-0.5}>
                {tags?.map((tag, index) => (
                  <Chip
                    sx={{ m: 0.5 }}
                    key={index}
                    label={tag}
                    component="span"
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
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
          <IconButton edge="end" onClick={e => onMenuClick(e, paper.object)}>
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
