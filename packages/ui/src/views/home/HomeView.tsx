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
import { RefreshOutlined, Visibility, VisibilityOff } from '@mui/icons-material'
import { Box, Button, IconButton, InputAdornment, TextField, Typography } from '@mui/material'
import { useToggle } from 'react-use'

export default function HomeView() {
  const [pwdVisible, togglePwdVisible] = useToggle(false)
  const [isNewAccount, toggleIsNewAccount] = useToggle(false)

  return (
    <_Card>
      <Typography variant="h5" color="primary" align="center">
        Paper
      </Typography>
      <Box my={2}>
        <Typography variant="subtitle1" align="center">
          {isNewAccount ? 'New Account' : 'Login'}
        </Typography>
      </Box>

      <Box component="form" maxWidth={300} mx="auto">
        <Box my={2}>
          <TextField
            label="Account"
            size="small"
            fullWidth
            autoComplete="username"
            inputProps={{ maxLength: 128 }}
            InputProps={{
              endAdornment: isNewAccount ? (
                <InputAdornment position="end">
                  <IconButton edge="end">
                    <RefreshOutlined />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </Box>

        <Box my={2}>
          <TextField
            label="Password"
            size="small"
            fullWidth
            autoComplete="current-password"
            type={pwdVisible ? 'text' : 'password'}
            inputProps={{ maxLength: 128 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton edge="end" onClick={togglePwdVisible}>
                    {pwdVisible ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box my={2} display="flex" alignItems="center" justifyContent="space-between">
          {isNewAccount ? (
            <>
              <Button variant="text" onClick={toggleIsNewAccount} size="small">
                Login
              </Button>
              <Button variant="contained">New Account</Button>
            </>
          ) : (
            <>
              <Button variant="text" onClick={toggleIsNewAccount} size="small">
                New Account
              </Button>
              <Button variant="contained">Login</Button>
            </>
          )}
        </Box>
      </Box>
    </_Card>
  )
}

const _Card = styled(Box)`
  max-width: 500px;
  margin: ${props => props.theme.spacing(4)} auto;
  padding: ${props => props.theme.spacing(2)};
  border: 1px solid ${props => props.theme.palette.divider};
  border-radius: ${props => props.theme.shape.borderRadius}px;
`
