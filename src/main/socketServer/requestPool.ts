class requestPool {
    public data: Map<any, any>
    public toBeSentResponseclient: Map<any, any>
    public toBeSentRequestclient: Map<any, any>
    constructor() {
        this.data = new Map()
        this.toBeSentResponseclient = new Map()
        this.toBeSentRequestclient = new Map()
    }

    requestMessageManagement(dataInfo: any, clients: any, clientInfo: any) {
        const aidKey = dataInfo.aid + clientInfo.channelSerial
        const didKey = dataInfo.did + clientInfo.channelSerial
        const pathKey = dataInfo.searchKey + clientInfo.channelSerial
        let pathObject: any = {}
        pathObject[`${dataInfo.searchKey}`] = dataInfo
        this.data.set(didKey, dataInfo)
        this.data.set(aidKey, { ...this.data.get(dataInfo.aid), ...pathObject })
        this.data.set(pathKey, dataInfo)
        console.log(`请求：${JSON.stringify(dataInfo)}`)
        console.log('toBeSentRequestclient', this.toBeSentRequestclient);
        let aidHasPath = this.toBeSentRequestclient.get(aidKey);
        let pathHasPath = this.toBeSentRequestclient.get(pathKey);
        let responsePathObject: any = {};
        if (aidHasPath && aidHasPath[dataInfo.searchKey]) {
            let clientArray = aidHasPath[dataInfo.searchKey]
            clientArray.forEach((item:any) => {
                let clientId = item.clientInfo.id
                let pid = item.pid
                clearTimeout(item.requestTimer);
                let responseTimer = setTimeout(() => {
                    clients.has(clientId) && clients.get(clientId).sendMsgToClient({ type: 'DATA', pid, code: 404, data: JSON.stringify(item.dataInfo), contentType:'queryResponse', message: '找不到该请求' })
                }, 10 * 3600);
                console.log(`toBeSentRequestclient请求上传：${JSON.stringify({ type: 'DATA', pid, data: JSON.stringify(item) })}`)
                responsePathObject[`${dataInfo.searchKey}`] = [{ clientInfo: item.clientInfo, dataInfo: item.dataInfo, pid, responseTimer },...(this.toBeSentResponseclient.get(aidKey)?this.toBeSentResponseclient.get(aidKey)[`${dataInfo.searchKey}`]:[])]
                this.toBeSentResponseclient.set((aidKey), { ...this.toBeSentResponseclient.get(dataInfo.aid), ...responsePathObject })
                this.toBeSentResponseclient.set(pathKey, responsePathObject[`${dataInfo.searchKey}`])
            });
            delete this.toBeSentRequestclient.get(aidKey)[dataInfo.searchKey];
        } else if (pathHasPath) {
            pathHasPath.forEach((item:any) => {
                let clientId = item.clientInfo.id
                let pid = item.pid
                clearTimeout(item.requestTimer);
                let responseTimer = setTimeout(() => {
                    clients.has(clientId) && clients.get(clientId).sendMsgToClient({ type: 'DATA', pid, code: 404, data: JSON.stringify(item.dataInfo), contentType:'queryResponse', message: '找不到该请求' })
                }, 10 * 3600);
                console.log(`toBeSentRequestclient请求上传${{ type: 'DATA', pid, data: JSON.stringify(item) }}`)
                responsePathObject[`${dataInfo.searchKey}`] = [{ clientInfo: item.clientInfo, dataInfo: item.dataInfo, pid, responseTimer },...(this.toBeSentResponseclient.get(aidKey)?this.toBeSentResponseclient.get(aidKey)[`${dataInfo.searchKey}`]:[])]
                this.toBeSentResponseclient.set((aidKey), { ...this.toBeSentResponseclient.get(dataInfo.aid), ...responsePathObject })
                this.toBeSentResponseclient.set(pathKey, responsePathObject[`${dataInfo.searchKey}`])
            });
            this.toBeSentRequestclient.delete(pathKey)
        }
    }

    responseMessageManagement(dataInfo: any, clients: any, clientInfo: any) {
        const didKey = dataInfo.did + clientInfo.channelSerial
        const pathObject: any = {}
        this.data.set(didKey, { ...this.data.get(didKey), ...dataInfo })
        const data = this.data.get(didKey)
        const aid = data.aid
        const aidKey = aid + clientInfo.channelSerial
        const pathKey = data.searchKey + clientInfo.channelSerial
        const oldAidMapInfo = this.data.get(aidKey)
        pathObject[`${data.searchKey}`] = { ...(oldAidMapInfo[`${data.searchKey}`] || {}), ...dataInfo }
        this.data.set(aidKey, { ...this.data.get(aidKey), ...pathObject })
        this.data.set(pathKey, data)
        // console.log(`请求上传：${JSON.stringify(dataInfo)}`)
        console.log(`合并数据${data.searchKey}：${JSON.stringify(this.data.get(pathKey))}`)
        // console.log(`pathObject:${JSON.stringify(pathObject)}`)
        // console.log('toBeSentResponseclient', this.toBeSentResponseclient);
        let aidHasPath = this.toBeSentResponseclient.get(aidKey);
        let pathHasPath = this.toBeSentResponseclient.get(pathKey);
        console.log('aidHasPath:',aidHasPath)
        console.log('pathHasPath:',pathHasPath)
        if (aidHasPath && aidHasPath[data.searchKey]) {
            let clientArray = aidHasPath[data.searchKey]
            clientArray.forEach((item:any) => {
                let clientId = item.clientInfo.id
                let pid = item.pid
                clearTimeout(item.responseTimer);
                clients.has(clientId) && clients.get(clientId).sendMsgToClient({ type: 'DATA', pid, contentType:'queryResponse', data: JSON.stringify(this.data.get(aidKey)[data.searchKey]) })
                console.log(`请求返回：${JSON.stringify({ type: 'DATA', pid, data: JSON.stringify({ type: 'DATA', pid, data: JSON.stringify(this.data.get(aidKey)[data.searchKey]) }) })}`)
            });
            delete this.toBeSentResponseclient.get(aidKey)[data.searchKey];
        } else if (pathHasPath) {
            pathHasPath.forEach((item:any) => {
                let clientId = item.clientInfo.id
                let pid = item.pid
                clearTimeout(item.responseTimer);
                clients.has(clientId) && clients.get(clientId).sendMsgToClient({ type: 'DATA', pid,contentType:'queryResponse', data: JSON.stringify(this.data.get(pathKey)) })
                console.log(`请求返回：${JSON.stringify({ type: 'DATA', pid, data: JSON.stringify(this.data.get(pathKey)) })}`)
            });
            this.toBeSentResponseclient.delete(pathKey)
        }
    }
    queryMessageManagement(message: any, clients: any, clientInfo: any) {
        console.log('channelSerialasd:',clientInfo.channelSerial)
        const dataInfo = JSON.parse(message.data)
        const aidKey = dataInfo.aid + clientInfo.channelSerial
        const pathKey = dataInfo.searchKey + clientInfo.channelSerial
        let aidMapinfo = this.data.get(aidKey)
        let pathMapInfo = this.data.get(pathKey)
        let responseTimer,requestTimer,pathObject: any = {}
        if (aidMapinfo && aidMapinfo[dataInfo.searchKey] && aidMapinfo[dataInfo.searchKey].responseBody) {
            clients.has(clientInfo.id) && clients.get(clientInfo.id).sendMsgToClient({ type: 'DATA', pid: message.pid,contentType:'queryResponse', data: JSON.stringify(aidMapinfo[dataInfo.searchKey]) })
            console.log(`aid一样请求返回：${JSON.stringify({ type: 'DATA', pid: message.pid, data: JSON.stringify(aidMapinfo[dataInfo.searchKey]) })}`)
        } else if (pathMapInfo && pathMapInfo.responseBody) {
            clients.has(clientInfo.id) && clients.get(clientInfo.id).sendMsgToClient({ type: 'DATA', pid: message.pid,contentType:'queryResponse', data: JSON.stringify(pathMapInfo) })
            console.log(`aid不一样请求返回：${JSON.stringify({ type: 'DATA', pid: message.pid, data: JSON.stringify(pathMapInfo) })}`)
        } else if (aidMapinfo || pathMapInfo) {
            responseTimer = setTimeout(() => {
                console.log('fyq:toBeSentResponseclient:', this.toBeSentResponseclient.get(aidKey)[dataInfo.searchKey])
                delete this.toBeSentResponseclient.get(aidKey)[dataInfo.searchKey];
                this.toBeSentResponseclient.delete(pathKey)
                clients.has(clientInfo.id) && clients.get(clientInfo.id).sendMsgToClient({ type: 'DATA', pid: message.pid,data:JSON.stringify(dataInfo), code: 404,contentType:'queryResponse', message: '找不到该请求' })
            }, 10 * 3600);
            pathObject[`${dataInfo.searchKey}`] = [{ clientInfo, dataInfo, pid: message.pid, responseTimer },...(this.toBeSentResponseclient.get(aidKey)?this.toBeSentResponseclient.get(aidKey)[`${dataInfo.searchKey}`]:[])]
            this.toBeSentResponseclient.set(aidKey, { ...this.toBeSentResponseclient.get(aidKey), ...pathObject })
            this.toBeSentResponseclient.set(pathKey, pathObject[`${dataInfo.searchKey}`])
        } else if (!aidMapinfo && !pathMapInfo) {
            requestTimer = setTimeout(() => {
                console.log('fyq:toBeSentRequestclient:', this.toBeSentRequestclient.get(aidKey)[dataInfo.searchKey])
                delete this.toBeSentRequestclient.get(aidKey)[dataInfo.searchKey];
                this.toBeSentRequestclient.delete(pathKey)
                clients.has(clientInfo.id) && clients.get(clientInfo.id).sendMsgToClient({ type: 'DATA', pid: message.pid,data:JSON.stringify(dataInfo), code: 404,contentType:'queryResponse', message: '找不到该请求' })
            }, 4000);
            pathObject[`${dataInfo.searchKey}`] = [{ clientInfo, dataInfo, pid: message.pid, requestTimer },...(this.toBeSentRequestclient.get(aidKey)?this.toBeSentRequestclient.get(aidKey)[`${dataInfo.searchKey}`]:[])]
            // console.log('fyq:pathObject:', JSON.stringify(pathObject))
            this.toBeSentRequestclient.set(aidKey, { ...this.toBeSentRequestclient.get(aidKey), ...pathObject })
            this.toBeSentRequestclient.set(pathKey, pathObject[`${dataInfo.searchKey}`])
            console.log('fyq:toBeSentRequestclient:', JSON.stringify(this.toBeSentRequestclient.get(aidKey)))
        }
    }
}

export default new requestPool()