"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyServer = void 0;
const WebSocket = __importStar(require("ws"));
const events_1 = require("events");
const Client_1 = require("./Client");
const utils_1 = require("./utils");
const Url = require('url');
const WS_CLENT_URL = '/proxy/YOUR_PLUGIN/YOUR_APP';
const INTERNAL_ERROR_CODE = 1011;
class ProxyServer {
    constructor() {
        this.eventEmitter = new events_1.EventEmitter();
        this._serverAddressWithPort = '';
        this._clients = new Map();
        this._clientCount = 1;
        this._clientInfo = new Object();
        this._addClientEmitListener();
        this._addBackgroundListener();
    }
    addWebSocketListener(server) {
        const { port } = server.address();
        this._serverAddressWithPort = `${(0, utils_1.getHost)()}:${port}`;
        this._addConnectionHandler(server);
    }
    _addConnectionHandler(server) {
        const wss = new WebSocket.Server({ noServer: true });
        console.warn(`web socket server listening, clients can connect ws server by ws://${this._serverAddressWithPort}${WS_CLENT_URL} ...`);
        wss.on('connection', (socket, request) => {
            console.log('wss connection', socket.url, request.url);
            this._addClientMsgListener(socket, request);
        });
        server.on('upgrade', (request, socket, head) => {
            const { pathname } = Url.parse(request.url);
            if (pathname) {
                wss.handleUpgrade(request, socket, head, (ws) => {
                    wss.emit('connection', ws, request);
                });
            }
            else {
                socket.destroy();
            }
        });
    }
    _addClientMsgListener(socket, request) {
        try {
            const ip = request.socket.remoteAddress;
            const clientId = this._clientCount++;
            this._clients.set(clientId, new Client_1.Client(clientId, '', socket, this.eventEmitter, ip, request.url));
            socket.on('close', (msg) => {
                console.log(`来自client端的socket已关闭,ClientId:${clientId}, CLOSE_CODE: ${msg}`);
                this._clients.delete(clientId);
            });
        }
        catch (error) {
            console.error('error', error);
            socket.close(INTERNAL_ERROR_CODE, error);
        }
    }
    _addClientEmitListener() {
        this.eventEmitter.on('message', (message, clientInfo) => {
            console.log('proxy recevie msg from client');
            this._handleClientEmitMsg(message, clientInfo);
        });
    }
    _addBackgroundListener() {
        this.eventEmitter.on('multicontrol/proxyserver', (message, clentId) => {
            console.log('proxy recevie msg from background');
            this._handleBackgroundEmitMsg(message, clentId);
        });
    }
    _handleBackgroundEmitMsg(message, clientId) {
        if (message.type === 'LOGIN') {
            this._clients.get(clientId).sendMsgToClient(message);
        }
    }
    _handleClientEmitMsg(message, clientInfo) {
        let pathArray = Url.parse(clientInfo.requestPath).pathname.split('/');
        if (pathArray && pathArray[2] === 'multicontrol' && pathArray[3]) {
            if (message.type === 'LOGIN') {
                this.eventEmitter.emit('multicontrol/background', message, clientInfo.id);
                this._clientInfo[pathArray[3]] = this._clientInfo[pathArray[3]] || new Map();
                this._clientInfo[pathArray[3]].set(clientInfo.id, this._clients.get(clientInfo.id));
            }
            if (message.type === 'BROADCAST') {
                Array.from(this._clientInfo[pathArray[3]].entries()).forEach(([clientId, client]) => {
                    console.log('clientId', clientId, 'message', message);
                    if (clientId !== clientInfo.id) {
                        client.sendMsgToClient(message);
                    }
                });
            }
        }
    }
}
exports.ProxyServer = ProxyServer;
