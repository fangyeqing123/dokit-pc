import { createApp } from 'vue'
import App from './renderer/App.vue'
// import db from './common/dataStore'
import router from './renderer/router/index'
import ElementPlus from 'element-plus'
import JsonViewer from "vue3-json-viewer"
import { registerStore } from './renderer/store/index'
import './renderer/styles/index.scss'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/display.css'
import './renderer/assets/qrcode'
import { createPinia } from 'pinia';
import { move } from './renderer/utils/move' 
const app = createApp(App)
// 把electron挂到app全局
// @ts-ignore
app.config.globalProperties.$electron = window.electron

// 挂载lowdb
// app.config.globalProperties.$db = db
app.directive('move', move)
app.use(ElementPlus).use(JsonViewer)

// 注册Pinia
app.use(createPinia())
registerStore();

app.use(router).mount('#app')
