import { contextBridge, ipcRenderer } from 'electron'

// 通过preload 向 render进程暴露部分electron属性
contextBridge.exposeInMainWorld('electron', {
  onMulticontrolEmit: (fn) => {
      ipcRenderer.on("multicontrol/front", (event, ...args) => fn(...args));
  },
  startSocketServer: () => ipcRenderer.sendSync('startSocketServer')
})