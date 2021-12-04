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

import { createTheme, PaletteMode, ThemeOptions } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'

export default function useMyTheme() {
  const mode = useThemeMode()

  return useMemo(
    () =>
      createTheme(
        {
          palette: { mode },
          typography: {
            button: {
              textTransform: 'none',
            },
          },
        },
        mode === 'light' ? lightTheme : darkTheme
      ),
    [mode]
  )
}

const lightTheme: ThemeOptions = {}

const darkTheme: ThemeOptions = {
  palette: {
    background: {
      paper: '#2E3033',
      default: '#363B40',
    },
  },
}

const getThemeMode = () =>
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

function useThemeMode() {
  const [mode, setMode] = useState<PaletteMode>(getThemeMode())

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const cb = (e: MediaQueryListEvent) => {
      setMode(e.matches ? 'dark' : 'light')
    }
    media.addEventListener('change', cb)
    return () => media.removeEventListener('change', cb)
  }, [])

  return mode
}
