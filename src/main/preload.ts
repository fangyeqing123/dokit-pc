import {
  contextBridge,
  ipcRenderer,
} from 'electron'
// 通过preload 向 render进程暴露部分electron属性
contextBridge.exposeInMainWorld('electron', {
  onMulticontrolEmit: (fn: Function) => {
    ipcRenderer.on("multicontrol/front", (event, ...args) => fn(...args));
  },
  onMulticontrolConnection: (fn: Function) => {
    ipcRenderer.on("multicontrol/Connection", (event, ...args) => fn(...args));
  },
  onMulticontrolMessage: (fn: Function) => {
    ipcRenderer.on("multicontrol/message", (event, ...args) => fn(...args));
  },
  onMulticontrolNetWork: (fn: Function) => {
    ipcRenderer.on("multicontrol/network", (event, ...args) => fn(...args));
  },
  // startSocketServer: () => ipcRenderer.sendSync('startSocketServer'),
  getRealSize: () => ipcRenderer.send('realSize'),
  onResizeEmit: (fn: Function) => {
    ipcRenderer.on("resizeEvents", (event, ...args) => fn(...args));
  },
  getDataService: async (info: any) => {
    try {
      let data = await ipcRenderer.invoke('getDataService', info)
      return data
    } catch (error) {
      console.log(error);
      return null
    }
  },
  getSocketServerInfo: async () => {
    try {
      let data = await ipcRenderer.invoke('getSocketServerInfo')
      return data
    } catch (error) {
      console.log(error);
      return null
    }
  },
  getMulticontrolMachine: (info:any) => ipcRenderer.send('getMulticontrolMachine',info),
})