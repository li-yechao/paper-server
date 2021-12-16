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
import {
  Box,
  Button,
  Fade,
  IconButton,
  InputAdornment,
  LinearProgress,
  TextField,
  Typography,
} from '@mui/material'
import { Account } from '@paper/core'
import { useSnackbar } from 'notistack'
import { useCallback, useEffect, useState } from 'react'
import { useToggle } from 'react-use'
import { PromiseType } from 'react-use/lib/misc/types'
import { accountOptions } from '../../constants'
import { useSetAccount } from '../../state/account'

export default function AuthView() {
  const snackbar = useSnackbar()
  const setAccount = useSetAccount()
  const [pwdVisible, togglePwdVisible] = useToggle(false)
  const [isNewAccount, toggleIsNewAccount] = useToggle(false)
  const [loading, toggleLoading] = useToggle(false)

  const [key, setKey] = useState<PromiseType<ReturnType<typeof Account.generateKey>>>()
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')

  const regenerateKey = useCallback(async () => {
    setKey(await Account.generateKey())
  }, [])

  const newAccount = useCallback(async () => {
    if (loading || !key || !password.trim()) {
      return
    }
    toggleLoading(true)
    try {
      const account = await Account.create({ key: key.key, password }, accountOptions)
      setAccount(account)
    } catch (error) {
      snackbar.enqueueSnackbar(error.message, { variant: 'error' })
      console.error(error)
    } finally {
      toggleLoading(false)
    }
  }, [loading, key, password])

  const login = useCallback(async () => {
    if (loading || !userId.trim() || !password.trim()) {
      return
    }
    toggleLoading(true)
    try {
      const account = await Account.create({ id: userId, password }, accountOptions)
      setAccount(account)
    } catch (error) {
      snackbar.enqueueSnackbar(error.message, { variant: 'error' })
      console.error(error)
    } finally {
      toggleLoading(false)
    }
  }, [loading, userId, password])

  useEffect(() => {
    if (isNewAccount) {
      if (!key) {
        Account.generateKey().then(key => {
          setKey(key)
        })
      } else {
        setUserId(key.id)
      }
    }
  }, [isNewAccount, key])

  return (
    <_Card position="relative" overflow="hidden">
      <Box position="absolute" left={0} top={0} right={0}>
        <Fade in={loading}>
          <LinearProgress />
        </Fade>
      </Box>

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
            value={userId}
            onChange={e => setUserId(e.currentTarget.value)}
            size="small"
            fullWidth
            autoComplete="username"
            inputProps={{ maxLength: 128 }}
            InputProps={{
              readOnly: loading,
              endAdornment: isNewAccount ? (
                <InputAdornment position="end">
                  <IconButton edge="end" onClick={regenerateKey} disabled={loading}>
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
            value={password}
            onChange={e => setPassword(e.currentTarget.value)}
            size="small"
            fullWidth
            autoComplete="current-password"
            type={pwdVisible ? 'text' : 'password'}
            inputProps={{ maxLength: 128 }}
            InputProps={{
              readOnly: loading,
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
              <Button variant="text" onClick={toggleIsNewAccount} disabled={loading} size="small">
                Login
              </Button>
              <Button
                variant="contained"
                onClick={newAccount}
                disabled={loading || !userId || !password}
              >
                New Account
              </Button>
            </>
          ) : (
            <>
              <Button variant="text" onClick={toggleIsNewAccount} disabled={loading} size="small">
                New Account
              </Button>
              <Button
                variant="contained"
                onClick={login}
                disabled={loading || !userId || !password}
              >
                Login
              </Button>
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
