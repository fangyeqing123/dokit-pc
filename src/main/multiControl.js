import db from './dataStore'
import {
  ipcMain
} from 'electron'


// 封装数据操作
const getClientList = () => {
  return db.read().get('multiControl.appList').getById('thisisdefault').get('clientList')
}


export const init = (info, webContents) => {
  // 监听来自客户端的消息  用于管理设备
  info.eventEmitter.on('multicontrol/background', (message, clientId) => {
    try {
      if (message.type === 'LOGIN') {
        // 存储设备信息
        console.log('background收到的设备信息=======》', message)
        let clientInfo = JSON.parse(message.data)
        console.log(clientInfo)
        if (clientInfo.connectSerial) {
          if (getClientList.getById(clientInfo.connectSerial).value()) {
            info.eventEmitter.emit('multicontrol/proxyserver', message, clientId)
          } else {
            let newClientInfo = getClientList.insert({
              ...JSON.parse(message.data)
            }).write()
            info.eventEmitter.emit('multicontrol/proxyserver', {
              ...message,
              data: JSON.stringify({
                ...clientInfo,
                connectSerial: newClientInfo.id
              })
            }, clientId)
          }
        } else {
          let newClientInfo = db.read().get('multiControl.appList').getById('thisisdefault').get('clientList').insert({
            ...JSON.parse(message.data)
          }).write()
          info.eventEmitter.emit('multicontrol/proxyserver', {
            ...message,
            data: JSON.stringify({
              ...clientInfo,
              connectSerial: newClientInfo.id
            })
          }, clientId)
        }
        // console.log(Object.keys(ipcMain))


        webContents.send('multicontrol/front', db.read().get('multiControl.appList').getById('thisisdefault').get('clientList').value())
      }
    } catch (error) {
      console.error(error);
    }
  })
}