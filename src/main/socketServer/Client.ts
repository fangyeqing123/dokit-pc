
import * as WebSocket from 'ws'
import { EventEmitter } from 'events'

export class Client {
  private id: Number = 0;
  private name: String = '';
  private _clientSocket: WebSocket
  private _emit: EventEmitter
  public ip: String | undefined
  public requestPath: String | undefined

  // private _pages:Array = []

  constructor(id: Number, name: String, socket: WebSocket, emit: EventEmitter, ip:String | undefined, requestPath: String | undefined) {
    this.id = id
    this.name = name || 'Unknown'
    this._clientSocket = socket
    this._emit = emit
    this.ip = ip
    this.requestPath = requestPath
    // this._pages = [] // Tip: 页面管理
    this._addSocketHandler()
  }

  _addSocketHandler() {
    this._clientSocket.on('message', (message: any) => {
      try {
        message = JSON.parse(message);
        this._emit.emit('message', message, {
          id: this.id,
          name: this.name,
          requestPath: this.requestPath
        })
      } catch (error) {
        console.log(error)
      }
    })
  }

  sendMsgToClient(message: any) {
    try {
      // 向各个客户端进行数据推送
      console.log('===============向客户端进行数据推送start===============')
      console.log('原始数据', message)
      this._clientSocket.send(JSON.stringify(message))
      console.log('===============向客户端进行数据推送end===============')

    } catch (error) {
      console.log('_sendMessageToNative error', error)
    }
  }
}