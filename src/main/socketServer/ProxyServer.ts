import * as WebSocket from 'ws'
import { EventEmitter } from 'events'
import type { Server as HttpServer, IncomingMessage } from 'http'
import type { AddressInfo } from 'net'
import { Client } from './Client'
import { getHost } from './utils'
const Url = require('url')

const WS_CLENT_URL = '/proxy/YOUR_PLUGIN/YOUR_APP';
const INTERNAL_ERROR_CODE = 1011;

// interface Msg {
//   type?:string
//   method?:string
//   params: any
// }

export class ProxyServer {
  public eventEmitter: EventEmitter = new EventEmitter()
  private _serverAddressWithPort: String = ''
  private _clients: Map<number, Client> = new Map()
  private _clientCount: number = 1
  // private _clientSocket?: WebSocket
  //@ts-ignore
  private _nativeSocket?: WebSocket
  private _clientInfo: any = new Object()

  constructor() {
    this._addClientEmitListener()
    this._addBackgroundListener()
  }

  addWebSocketListener(server: HttpServer) {
    const { port } = server.address() as AddressInfo
    this._serverAddressWithPort = `${getHost()}:${port}`;
    this._addConnectionHandler(server)
  }
  // @ts-ignore
  _addConnectionHandler(server: HttpServer) {
    const wss = new WebSocket.Server({ noServer: true })
    console.warn(`web socket server listening, clients can connect ws server by ws://${this._serverAddressWithPort}${WS_CLENT_URL} ...`)

    wss.on('connection', (socket: WebSocket, request: IncomingMessage) => {
      console.log('wss connection', socket.url, request.url)
      // @ts-ignore
      this._addClientMsgListener(socket, request)
    })
    server.on('upgrade', (request, socket, head) => {
      const { pathname } = Url.parse(request.url)
      if (pathname) {
        wss.handleUpgrade(request, socket as any, head, (ws) => {
          wss.emit('connection', ws, request)
        })
      } else {
        socket.destroy()
      }
    })
  }
   // @ts-ignore
   _addClientMsgListener(socket: WebSocket, request: IncomingMessage) {
    try {
      const ip = request.socket.remoteAddress;  // 获取远程ip 区分设备
      // 记录 native 端
      const clientId = this._clientCount++
      this._clients.set(
        clientId,
        new Client(clientId, '', socket, this.eventEmitter, ip, request.url)
      )

      socket.on('close', (msg: any) => {
        console.log(`来自client端的socket已关闭,ClientId:${clientId}, CLOSE_CODE: ${msg}`)
        this._clients.delete(clientId)
      })
    } catch (error) {
      console.error('error', error);
      socket.close(INTERNAL_ERROR_CODE, error as string);
    }
  }

  _addClientEmitListener() {
    this.eventEmitter.on('message', (message, clientInfo) => {
      // 接受Client侧消息
      console.log('proxy recevie msg from client')
      this._handleClientEmitMsg(message, clientInfo)
    })
  }

  // 处理来自electron background的消息通知
  _addBackgroundListener() {
    this.eventEmitter.on('multicontrol/proxyserver', (message, clentId) => {
      console.log('proxy recevie msg from background')
      this._handleBackgroundEmitMsg(message, clentId)
    })
  }
  
  _handleBackgroundEmitMsg(message: any, clientId: number) {
    if (message.type === 'LOGIN') {
      //@ts-ignore
      this._clients.get(clientId).sendMsgToClient(message)
    }
  }

  _handleClientEmitMsg(message: any, clientInfo: any) {
    let pathArray:Array<string> = Url.parse(clientInfo.requestPath).pathname.split('/')
    if (pathArray && pathArray[2] === 'multicontrol' && pathArray[3]) {
      // 已连接设备登录
      if (message.type === 'LOGIN') {
        // 触发eventEmitter 向background发送消息
        this.eventEmitter.emit('multicontrol/background', message, clientInfo.id)
        this._clientInfo[pathArray[3]] = this._clientInfo[pathArray[3]] || new Map<number, Client>()
        this._clientInfo[pathArray[3]].set(clientInfo.id, this._clients.get(clientInfo.id))
      }
      // 已登录设备广播数据
      if (message.type === 'BROADCAST') {
        Array.from(this._clientInfo[pathArray[3]].entries()).forEach(
          // @ts-ignore
          ([clientId, client]) => {
            console.log('clientId', clientId, 'message', message)
            if (clientId !== clientInfo.id) {
              client.sendMsgToClient(message)
            }
          }
        )
      }
    }
  }

  // @ts-ignore
  // _pushMsgToClient(message: any, clientInfo?: any) {
  //   this._clientSocket && this._clientSocket.send(JSON.stringify(message))
  // }


  // _setNotify(notifyConfig: any) {
  //   !notifyConfig.title && (notifyConfig.title = '提示')
  //   const msg = {
  //     type: 'page',
  //     method: 'setNotify',
  //     params: {
  //       notifyConfig
  //     }
  //   }
  //   this._pushMsgToClient(msg)
  // }
}

