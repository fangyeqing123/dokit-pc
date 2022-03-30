import db from './dataStore'
import {
  ipcMain
} from 'electron'


// 封装数据操作
const getClientList = (passageway: string) => {
  return db.read().get('multiControl.appList').find({ identification: passageway }).get('clientList')
}

export const init = (info: any, webContents: any) => {
  // 监听来自客户端的消息  用于管理设备
  info.eventEmitter.on('multicontrol/background', (message: any, clientId: any, passageway: string) => {
    try {
      if (message.type === 'LOGIN') {
        // 存储设备信息
        console.log('background收到的设备信息=======》', message)
        let clientInfo = JSON.parse(message.data)
        console.log(clientInfo)
        if (clientInfo.connectSerial) {
          if (getClientList(passageway).getById(clientInfo.connectSerial).value()) {
            info.eventEmitter.emit('multicontrol/proxyserver', message, clientId)
          } else {
            let newClientInfo = getClientList(passageway).insert({
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
          let newClientInfo = db.read().get('multiControl.appList').find({ identification: passageway }).get('clientList').insert({
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
        webContents.send('multicontrol/front', JSON.stringify({ passageway, info: db.read().get('multiControl.appList').find({ identification: passageway }).get('clientList').value() }))
        info.eventEmitter.emit('multicontrol/machineConnection', clientId)
      }
    } catch (error) {
      console.error(error);
    }
  })
}
export const getMulticontrolMachine = (webContents: any, passageway: string) => {
  webContents.send('multicontrol/front', JSON.stringify({ passageway, info: db.read().get('multiControl.appList').find({ identification: passageway }).get('clientList').value() }))
}