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

const { app, BrowserWindow, nativeTheme } = require('electron')
const windowStateKeeper = require('electron-window-state')

try {
  require('electron-reloader')(module)
} catch {}

const isDev = !app.isPackaged

/**
 * @type {BrowserWindow | undefined}
 */
let mainWindow

/**
 * @param {string | number} port
 */
function loadVitePage(port) {
  mainWindow?.loadURL(`http://localhost:${port}`).catch(() => {
    console.log('VITE NOT READY, WILL TRY AGAIN IN 200ms')
    setTimeout(() => {
      // do it again as the vite build can take a bit longer the first time
      loadVitePage(port)
    }, 200)
  })
}

function createMainWindow() {
  mainWindow = createWindow({ show: false })
  mainWindow.once('close', () => {
    mainWindow = undefined
  })

  const port = process.env.PORT || 3000
  if (isDev) {
    loadVitePage(port)
  } else {
    mainWindow.loadFile('dist/index.html')
  }

  // if main window is ready to show, then destroy the splash window and show up the main window
  mainWindow.once('ready-to-show', () => {
    console.log('READY')
    mainWindow?.show()
    mainWindow?.focus()
  })
}

/**
 *
 * @param {import('electron').BrowserWindowConstructorOptions} options
 * @returns
 */
function createWindow(options = {}) {
  const minWidth = 800
  const minHeight = 600

  let windowState = windowStateKeeper({
    defaultWidth: minWidth,
    defaultHeight: minHeight,
  })

  const win = new BrowserWindow({
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#363B40' : '#FFFFFF',
    minWidth,
    minHeight,
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
    trafficLightPosition: {
      x: 20,
      y: 20,
    },
    ...options,
    webPreferences: {
      contextIsolation: false,
      devTools: isDev,
      spellcheck: false,
      nodeIntegration: false,
      ...(options.webPreferences || {}),
    },
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
  })

  windowState.manage(win)
  return win
}

app.once('ready', createMainWindow)
app.on('activate', () => {
  if (!mainWindow) {
    createMainWindow()
  }
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
