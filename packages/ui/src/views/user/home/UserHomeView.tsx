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

import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material'
import { Button, List, ListItemButton, ListItemText, Stack } from '@mui/material'
import { Box } from '@mui/system'
import Object from '@paper/core/src/object'
import { useEffect, useState } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import { accountSelector } from '../../../state/account'
import { ForbiddenViewLazy } from '../../error'
import useObjectPagination from '../useObjectPagination'

export interface UserHomeViewProps extends Pick<RouteComponentProps<{ name: string }>, 'match'> {}

export default function UserHomeView(props: UserHomeViewProps) {
  const account = useRecoilValue(accountSelector)

  if (!account || account?.name !== props.match.params.name) {
    return <ForbiddenViewLazy />
  }

  return <ObjectList />
}

const ObjectList = () => {
  const pagination = useObjectPagination()

  return (
    <Box maxWidth={800} margin="auto">
      <List>
        {pagination.list.map(object => (
          <ObjectItem key={object.path} object={object} />
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
    </Box>
  )
}

const ObjectItem = ({ object }: { object: Object }) => {
  const [title, setTitle] = useState<string | null>()

  useEffect(() => {
    object.getInfo().then(info => {
      setTitle(info.title)
    })
  }, [object])

  return (
    <ListItemButton divider>
      <ListItemText primary={title || 'Untitled'} />
    </ListItemButton>
  )
}
