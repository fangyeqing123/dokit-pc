"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
class Client {
    constructor(id, name, socket, emit, ip, requestPath) {
        this.id = 0;
        this.name = '';
        this.id = id;
        this.name = name || 'Unknown';
        this._clientSocket = socket;
        this._emit = emit;
        this.ip = ip;
        this.requestPath = requestPath;
        this._addSocketHandler();
    }
    _addSocketHandler() {
        this._clientSocket.on('message', (message) => {
            try {
                message = JSON.parse(message);
                this._emit.emit('message', message, {
                    id: this.id,
                    name: this.name,
                    requestPath: this.requestPath
                });
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    sendMsgToClient(message) {
        try {
            console.log('===============向客户端进行数据推送start===============');
            console.log('原始数据', message);
            this._clientSocket.send(JSON.stringify(message));
            console.log('===============向客户端进行数据推送end===============');
        }
        catch (error) {
            console.log('_sendMessageToNative error', error);
        }
    }
}
exports.Client = Client;
