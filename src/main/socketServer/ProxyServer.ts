import * as WebSocket from 'ws'
import { EventEmitter } from 'events'
import type { Server as HttpServer, IncomingMessage } from 'http'
import type { AddressInfo } from 'net'
import { Client } from './Client'
import { getHost } from './utils'
import requestPool from './requestPool'
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
  private _clients: Map<number, Client> = new Map()
  private _serverAddressWithPort: String = ''
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
      console.log(this._clients)
      socket.on('close', (msg: any) => {
        console.log(`来自client端的socket已关闭,ClientId:${clientId}, CLOSE_CODE: ${msg}`)
        this.eventEmitter.emit('background/machineConnection', { type: 'CLOSE', connectSerial: (this._clients.get(clientId) as Client).connectSerial })
        const pathArray: Array<string> = Url.parse((this._clients.get(clientId) as Client).requestPath).pathname.split('/')
        this._clients.delete(clientId)
        this._clientInfo[pathArray[3]].delete(clientId);
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
    this.eventEmitter.on('multicontrol/proxyserver', (message, clientId) => {
      console.log('proxy recevie msg from background')
      this._handleBackgroundEmitMsg(message, clientId)
    })
    this.eventEmitter.on('multicontrol/machineConnection', (clientId) => {
      this.eventEmitter.emit('background/machineConnection', { type: 'ADD', connectSerial: (this._clients.get(clientId) as Client).connectSerial })
    })
  }

  _handleBackgroundEmitMsg(message: any, clientId: number) {
    if (message.type === 'LOGIN') {
      if (JSON.parse(message.data).connectSerial) {
        let _client = this._clients.get(clientId) as Client
        _client.connectSerial = JSON.parse(message.data).connectSerial
        this._clients.set(clientId, _client)
      }
      //@ts-ignore
      this._clients.get(clientId).sendMsgToClient(message)
    }
  }

  _handleClientEmitMsg(message: any, clientInfo: any) {
    const pathArray: Array<string> = Url.parse(clientInfo.requestPath).pathname.split('/')
    if (pathArray && pathArray[2] === 'multicontrol' && pathArray[3]) {
      switch (message.type) {
        // 已连接设备登录
        case 'LOGIN':
          // 触发eventEmitter 向background发送消息
          this.eventEmitter.emit('multicontrol/background', message, clientInfo.id, pathArray[3])
          this._clientInfo[pathArray[3]] = this._clientInfo[pathArray[3]] || new Map<number, Client>()
          this._clientInfo[pathArray[3]].set(clientInfo.id, this._clients.get(clientInfo.id))
          break;
        // 已登录设备广播数据
        case 'BROADCAST':
          console.log(Array.from(this._clientInfo[pathArray[3]].entries()))
          Array.from(this._clientInfo[pathArray[3]].entries()).forEach(
            // @ts-ignore
            ([clientId, client]) => {
              console.log(clientId, clientInfo.id)
              console.log('clientId', clientId, 'message', message)
              if (clientId !== clientInfo.id) {
                client.sendMsgToClient(message)
              }
            }
          )
          break;
        // 心跳
        case 'HEART_BEAT':
          // @ts-ignore
          this._clients.get(clientInfo.id).sendMsgToClient(message)
          break;
        case 'DATA':
          let dataInfo = JSON.parse(message.data)
          if (message.contentType === "request") {
            // 请求触发上报
            let pathObject: any = {}
            pathObject[`${dataInfo.path}`] = dataInfo
            requestPool.data.set(dataInfo.did, dataInfo)
            requestPool.data.set(dataInfo.aid, { ...requestPool.data.get(dataInfo.aid), ...pathObject })
            requestPool.data.set(dataInfo.path, dataInfo)
            console.log(`请求：${JSON.stringify(dataInfo)}`)
            console.log('toBeSentRequestclient', requestPool.toBeSentRequestclient);
            let aidHasPath = requestPool.toBeSentRequestclient.get(dataInfo.aid);
            let pathHasPath = requestPool.toBeSentRequestclient.get(dataInfo.path);
            if (aidHasPath && aidHasPath[dataInfo.path]) {
              let clientId = aidHasPath[dataInfo.path].clientInfo.id
              let pid = aidHasPath[dataInfo.path].pid
              clearTimeout(aidHasPath[dataInfo.path].requestTimer);
              var responseTimer = setTimeout(() => {
                // @ts-ignore
                this._clients.get(clientId).sendMsgToClient({ type: 'DATA', pid, code: 404, message: '找不到该请求' })
              }, 10 * 3600);
              console.log(`toBeSentRequestclient请求上传：${{ type: 'DATA', pid, data: JSON.stringify(aidHasPath[dataInfo.path]) }}`)
              delete requestPool.toBeSentRequestclient.get(dataInfo.aid)[dataInfo.path];
              let responsePathObject: any = {}
              responsePathObject[`${dataInfo.path}`] = { clientInfo: aidHasPath[dataInfo.path].clientInfo, dataInfo: aidHasPath[dataInfo.path].dataInfo, pid, responseTimer }
              requestPool.toBeSentResponseclient.set(dataInfo.aid, { ...requestPool.toBeSentResponseclient.get(dataInfo.aid), ...responsePathObject })
              requestPool.toBeSentResponseclient.set(dataInfo.path, responsePathObject[`${dataInfo.path}`])
            } else if (pathHasPath) {
              let clientId = pathHasPath[dataInfo.path].clientInfo.id
              let pid = pathHasPath[dataInfo.path].pid
              clearTimeout(pathHasPath.requestTimer);
              var responseTimer = setTimeout(() => {
                // @ts-ignore
                this._clients.get(clientId).sendMsgToClient({ type: 'DATA', pid, code: 404, message: '找不到该请求' })
              }, 10 * 3600);
              console.log(`toBeSentRequestclient请求上传${{ type: 'DATA', pid, data: JSON.stringify(pathHasPath) }}`)
              requestPool.toBeSentRequestclient.delete(dataInfo.path)
              let responsePathObject: any = {}
              responsePathObject[`${dataInfo.path}`] = { clientInfo: pathHasPath.clientInfo, dataInfo: pathHasPath.dataInfo, pid, responseTimer }
              requestPool.toBeSentResponseclient.set(dataInfo.aid, { ...requestPool.toBeSentResponseclient.get(dataInfo.aid), ...responsePathObject })
              requestPool.toBeSentResponseclient.set(dataInfo.path, responsePathObject[`${dataInfo.path}`])
            }
          } else if (message.contentType === "response") {
            // 请求响应上报
            let pathObject: any = {}
            requestPool.data.set(dataInfo.did, { ...requestPool.data.get(dataInfo.did), ...dataInfo })
            let data = requestPool.data.get(dataInfo.did)
            let aid = requestPool.data.get(dataInfo.did).aid
            pathObject[`${requestPool.data.get(dataInfo.did).path}`] = dataInfo
            requestPool.data.set(aid, { ...requestPool.data.get(aid), ...pathObject })
            requestPool.data.set(data.path, data)
            console.log(`请求上传：${JSON.stringify(dataInfo)}`)
            console.log(`合并数据${data.path}：${JSON.stringify(requestPool.data.get(data.path))}`)
            console.log(`pathObject:${JSON.stringify(pathObject)}`)
            console.log('toBeSentResponseclient', requestPool.toBeSentResponseclient);
            let aidHasPath = requestPool.toBeSentResponseclient.get(aid);
            let pathHasPath = requestPool.toBeSentResponseclient.get(data.path);
            if (aidHasPath && aidHasPath[data.path]) {
              let clientId = aidHasPath[data.path].clientInfo.id
              let pid = aidHasPath[data.path].pid
              clearTimeout(aidHasPath[data.path].responseTimer);
              // @ts-ignore
              this._clients.get(clientId).sendMsgToClient({ type: 'DATA', pid, data: JSON.stringify(requestPool.data.get(aid)[data.path]) })
              console.log(`请求返回：${{ type: 'DATA', pid, data: JSON.stringify({ type: 'DATA', pid, data: JSON.stringify(requestPool.data.get(aid)[data.path]) }) }}`)
              delete requestPool.toBeSentResponseclient.get(aid)[data.path];
            } else if (pathHasPath) {
              let clientId = pathHasPath[data.path].clientInfo.id
              let pid = pathHasPath[data.path].pid
              clearTimeout(pathHasPath.responseTimer);
              // @ts-ignore
              this._clients.get(clientId).sendMsgToClient({ type: 'DATA', pid, data: JSON.stringify(requestPool.data.get(data.path)) })
              console.log(`请求返回：${{ type: 'DATA', pid, data: JSON.stringify(requestPool.data.get(data.path)) }}`)
              requestPool.toBeSentResponseclient.delete(data.path)
            }
          } else if (message.contentType === "query") {
            // 查询请求
            let aidMapinfo = requestPool.data.get(dataInfo.aid)
            let pathMapInfo = requestPool.data.get(dataInfo.path)
            if (aidMapinfo && aidMapinfo[dataInfo.path].responseBody) {
              // @ts-ignore
              this._clients.get(clientInfo.id).sendMsgToClient({ type: 'DATA', pid: message.pid, data: JSON.stringify(aidMapinfo[dataInfo.path]) })
              console.log(`aid一样请求返回：${JSON.stringify({ type: 'DATA', pid: message.pid, data: JSON.stringify(aidMapinfo[dataInfo.path]) })}`)
            } else if (pathMapInfo && pathMapInfo.responseBody) {
              // @ts-ignore
              this._clients.get(clientInfo.id).sendMsgToClient({ type: 'DATA', pid: message.pid, data: JSON.stringify(pathMapInfo) })
              console.log(`aid不一样请求返回：${JSON.stringify({ type: 'DATA', pid: message.pid, data: JSON.stringify(pathMapInfo) })}`)
            } else if (aidMapinfo || pathMapInfo) {
              var responseTimer = setTimeout(() => {
                delete requestPool.toBeSentResponseclient.get(dataInfo.aid)[dataInfo.path];
                requestPool.toBeSentResponseclient.delete(dataInfo.path)
                // @ts-ignore
                this._clients.get(clientInfo.id).sendMsgToClient({ type: 'DATA', pid: message.pid, code: 404, message: '找不到该请求' })
              }, 10 * 3600);
              let pathObject: any = {}
              pathObject[`${dataInfo.path}`] = { clientInfo, dataInfo, pid: message.pid, responseTimer }
              requestPool.toBeSentResponseclient.set(dataInfo.aid, { ...requestPool.toBeSentResponseclient.get(dataInfo.aid), ...pathObject })
              requestPool.toBeSentResponseclient.set(dataInfo.path, pathObject[`${dataInfo.path}`])
            } else if (!aidMapinfo && !pathMapInfo) {
              var requestTimer = setTimeout(() => {
                delete requestPool.toBeSentRequestclient.get(dataInfo.aid)[dataInfo.path];
                requestPool.toBeSentRequestclient.delete(dataInfo.path)
                console.log('fyq:toBeSentRequestclient:', requestPool.toBeSentRequestclient.get(dataInfo.aid)[dataInfo.path])
                // @ts-ignore
                this._clients.get(clientInfo.id).sendMsgToClient({ type: 'DATA', pid: message.pid, code: 404, message: '找不到该请求' })
              }, 2000);
              let pathObject: any = {}
              pathObject[`${dataInfo.path}`] = { clientInfo, dataInfo, pid: message.pid, requestTimer }
              requestPool.toBeSentRequestclient.set(dataInfo.aid, { ...requestPool.toBeSentRequestclient.get(dataInfo.aid), ...pathObject })
              requestPool.toBeSentRequestclient.set(dataInfo.path, pathObject[`${dataInfo.path}`])
            }
          }
          break;
        default:
          break;
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

