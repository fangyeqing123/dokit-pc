// inspire by PicGo 
import Low from 'lowdb'
import LodashId from 'lodash-id'
import FileSync from 'lowdb/adapters/FileSync'
import { app } from 'electron'
import fs from 'fs-extra'
import path from 'path'

const STORE_PATH = app.getPath('userData')
const CONFIG_PATH = path.join(STORE_PATH, 'data.json')

console.log('存储地址', CONFIG_PATH)
if (!fs.pathExistsSync(STORE_PATH)) {
  fs.mkdirpSync(STORE_PATH)
}

class ConfigStore {
  constructor () {
    const adapter = new FileSync(CONFIG_PATH)

    this.db = Low(adapter)
    this.db._.mixin(LodashId)

    // 一机多控 专用
    if (!this.db.has('multiControl').value()) {
      this.db.set('multiControl', {
        appList: [
          {
            appName: 'default',
            clientList: [],
            id: 'thisisdefault'
          }
        ]
      }).write()
    }
  }

  read () {
    return this.db.read()
  }

  get (key = '') {
    return this.read().get(key).value()
  }

  set (key, value) {
    return this.read().set(key, value).write()
  }

  has (key) {
    return this.read().has(key).value()
  }

  insert (key, value) {
    return this.read().get(key).insert(value).write()
  }

  unset (key, value) {
    return this.read().get(key).unset(value).value()
  }

  getById (key, id) {
    return this.read().get(key).getById(id).value()
  }

  removeById (key, id) {
    return this.read().get(key).removeById(id).write()
  }

  getConfigPath () {
    return CONFIG_PATH
  }
}

export default new ConfigStore()