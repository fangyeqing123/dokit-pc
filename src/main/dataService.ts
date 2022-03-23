import db from './dataStore'

// 新增通道
export const addPassageway = (data: any) => {
    return db.read().get('multiControl.appList').insert({
        passagewayName: data.passagewayName,
        identification: data.identification,
        clientList: [],
    }).write()
}
// 删除通道
export const deletePassageway = (id: any) => {
    db.removeById('multiControl.appList', id)
    return db.read().get('multiControl.appList')
}
// 获取通道列表
export const getPassagewayList = () => {
    return db.read().get('multiControl.appList')
}
// 修改设备名称
export const editMachineName = (passageway: string, id: any, identificationName: string) => {
    return db.read().get('multiControl.appList').find({ identification: passageway }).get('clientList').find({ id }).set('identificationName', identificationName).write()
}
// 删除设备
export const deleteMachine = (passageway: string, id: any) => {
    return db.read().get('multiControl.appList').find({ identification: passageway }).get('clientList').remove({ id }).write()
}