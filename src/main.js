import { createApp } from 'vue'
import App from './renderer/App.vue'
// import db from './common/dataStore'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './renderer/assets/qrcode'

const app = createApp(App)
// 把electron挂到app全局
app.config.globalProperties.$electron = window.electron
// 挂载lowdb
// app.config.globalProperties.$db = db

app.use(ElementPlus)
app.mount('#app')
