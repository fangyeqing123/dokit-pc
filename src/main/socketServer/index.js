"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runProxyServer = exports.ProxyServer = void 0;
const ProxyServer_1 = require("./ProxyServer");
Object.defineProperty(exports, "ProxyServer", { enumerable: true, get: function () { return ProxyServer_1.ProxyServer; } });
const utils_1 = require("./utils");
const { createServer } = require('http');
function runProxyServer(port) {
    port = port || (0, utils_1.getPort)();
    const proxyServer = new ProxyServer_1.ProxyServer();
    const httpServer = createServer();
    httpServer.listen({ port }, () => {
        console.log(`Web http server listening, you can connect http server by http://${(0, utils_1.getHost)()}:${port}/ ...`);
        proxyServer.addWebSocketListener(httpServer);
    });
    return {
        address: (0, utils_1.getHost)(),
        port,
        eventEmitter: proxyServer.eventEmitter
    };
}
exports.runProxyServer = runProxyServer;
