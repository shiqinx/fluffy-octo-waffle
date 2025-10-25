import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'

console.log('🚀 开始初始化校园活动平台')

const app = createApp(App)
app.use(router)
app.use(pinia)
app.mount('#app')

console.log('✅ 应用初始化完成')