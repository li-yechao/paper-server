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
  IconButton,
  List,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
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
import { accountSelector } from '../../../state/account'
import { ForbiddenViewLazy } from '../../error'
import useObjectPagination, { useDeleteDraft } from '../useObjectPagination'

export interface UserHomeViewProps extends Pick<RouteComponentProps<{ name: string }>, 'match'> {}

export default function UserHomeView(props: UserHomeViewProps) {
  const account = useRecoilValue(accountSelector)

  if (!account || account?.name !== props.match.params.name) {
    return <ForbiddenViewLazy />
  }

  return <ObjectList account={account} />
}

const ObjectList = ({ account }: { account: Account }) => {
  const pagination = useObjectPagination()
  const [menuState, setMenuState] = useState<{ anchorEl: Element; object: Object }>()

  const handleOpenMenu = (e: React.MouseEvent<Element>, object: Object) => {
    setMenuState({ anchorEl: e.currentTarget, object })
  }

  const handleCloseMenu = () => setMenuState(undefined)

  const deleteDraft = useDeleteDraft()
  const handleDelete = async () => {
    const object = menuState?.object
    handleCloseMenu()
    object && (await deleteDraft(object))
  }

  return (
    <Box maxWidth={800} margin="auto">
      <List>
        {pagination.list.map(object => (
          <ObjectItem
            key={object.path}
            account={account}
            object={object}
            openMenu={handleOpenMenu}
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
  object,
  openMenu,
}: {
  account: Account
  object: Object
  openMenu: (e: React.MouseEvent<Element>, object: Object) => void
}) {
  const history = useHistory()
  const info = useAsync(() => object.getInfo(), [object])

  const handleItemClick = () => {
    history.push(`/${account.name}/${object.path.split('/').slice(-1)[0]}`)
  }

  if (info.loading) {
    return <ObjectItem.Skeleton />
  } else if (info.error) {
    return <ObjectItem.Skeleton error={info.error} />
  } else if (info.value) {
    const { title, createdAt, updatedAt } = info.value
    const time = updatedAt ?? createdAt

    return (
      <_ListItemButton divider onClick={handleItemClick}>
        <ListItemText
          primary={title || 'Untitled'}
          secondary={
            <FormattedDate
              value={time}
              year="numeric"
              month="numeric"
              day="numeric"
              hour="numeric"
              hour12={false}
              minute="numeric"
            />
          }
        />

        <ListItemSecondaryAction>
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
