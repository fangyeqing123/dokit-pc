'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
import path from 'path'
import { startProxyServer } from './main/socketServer/start'
// import db from './main/dataStore'
import { init as multiControlInit, getMulticontrolMachine } from './main/multiControl'
import { addPassageway, getPassagewayList,deletePassageway } from './main/dataService'
// import { dns } from 'address'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: false, standard: true } }
])

let win: any = null
let serverInfo: any = {}

async function createWindow() {
  // Create the browser window.
  try {
    win = new BrowserWindow({
      width: 1400,
      height: 900,
      show: false,
      webPreferences: {
        // Use pluginOptions.nodeIntegration, leave this alone
        // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      }
    })
    console.log(process.env.WEBPACK_DEV_SERVER_URL)
    if (process.env.WEBPACK_DEV_SERVER_URL) {
      // Load the url of the dev server if in development mode
      win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
      serverInfo = await startProxyServer()
      if (serverInfo) multiControlInit(serverInfo, win.webContents);
      win.on('ready-to-show', async () => {
        win.show();
        if (!process.env.IS_TEST) win.webContents.openDevTools();
      })
    } else {
      createProtocol('app')
      // Load the index.html when not in development
      win.loadURL('app://./index.html')
      serverInfo = await startProxyServer()
      if (serverInfo) multiControlInit(serverInfo, win.webContents);
      win.on('ready-to-show', async () => {
        win.show();
        win.webContents.openDevTools()
      })
    }
    win.on('resize', () => {
      let sizeData = win.getContentBounds();
      win.webContents.send('resizeEvents', JSON.stringify(sizeData))
    })
    serverInfo.eventEmitter.on('background/machineConnection', (info: any) => {
      win.webContents.send('multicontrol/Connection', JSON.stringify(info))
    })
    serverInfo.eventEmitter.on('background/message', (message:string, clientInfo:any, type:string) => {
      win.webContents.send('multicontrol/message', JSON.stringify({message,clientInfo,type}))
    })
  } catch (error) {
    console.error(error)
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e: any) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

// ipcMain代码抽离
console.log(Object.keys(ipcMain))

ipcMain.on("realSize", () => {
  let sizeData = win.getContentBounds();
  win.webContents.send('resizeEvents', JSON.stringify(sizeData))
})
ipcMain.on('getMulticontrolMachine', async (event, arg) => {
  getMulticontrolMachine(win.webContents, arg)
})
ipcMain.handle('getDataService', async (event, arg) => {
  let data
  switch (arg.name) {
    case 'addPassageway':
      data = addPassageway(arg.data)
      return JSON.stringify(data)
    case 'getPassagewayList':
      data = getPassagewayList()
      return JSON.stringify(data)
    case 'deletePassageway':
      data = deletePassageway(arg.data.id)
      return JSON.stringify(data)
    default:
      return null
  }
})
ipcMain.handle('getSocketServerInfo', async (event, arg) => {
  return JSON.stringify(serverInfo)
})

