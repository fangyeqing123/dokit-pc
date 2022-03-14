import db from './dataStore'

export const addPassageway = (data: any) => {
    return db.read().get('multiControl.appList').insert({
        passagewayName: data.passagewayName,
        identification: data.identification,
        clientList: [],
    }).write()
}

export const deletePassageway = (id: any) => {
    db.removeById('multiControl.appList',id)
    return db.read().get('multiControl.appList')
}

export const getPassagewayList = () => {
    return db.read().get('multiControl.appList')
}
