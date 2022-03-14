class requestPool {
    public data: Map<any, any>
    public toBeSentResponseclient:Map<any, any>
    public toBeSentRequestclient:Map<any, any>
    constructor() {
        this.data = new Map()
        this.toBeSentResponseclient = new Map()
        this.toBeSentRequestclient = new Map()
    }

}

export default new requestPool()