import { ProxyServer } from './ProxyServer';
import { getHost, getPort } from './utils';
const { createServer } = require('http');

function runProxyServer(port?: Number) {
  port = port || getPort()
  const proxyServer = new ProxyServer()
  const httpServer = createServer()
  httpServer.listen({ port }, () => {
    console.log(`Web http server listening, you can connect http server by http://${getHost()}:${port}/ ...`)
    proxyServer.addWebSocketListener(httpServer)
    
  })
  return {
    address: getHost(),
    port,
    eventEmitter: proxyServer.eventEmitter
  }
}

export { ProxyServer, runProxyServer }

