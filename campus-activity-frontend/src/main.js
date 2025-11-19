import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// 引入样式文件
import 'vant/lib/index.css'
import './main.css'
import './assets/line-clamp.css'
import { setupDevLocationCacheCleaner } from './utils/clearLocationCache'

// 引入 Vant 组件
import {
  Button,
  NavBar,
  Tabbar,
  TabbarItem,
  Form,
  Field,
  CellGroup,
  Search,
  List,
  PullRefresh,
  Picker,
  Popup,
  Checkbox,
  Toast,
  Dialog,
  Icon
} from 'vant'

const app = createApp(App)
const pinia = createPinia()

// 注册 Vant 组件
const components = [
  Button,
  NavBar,
  Tabbar,
  TabbarItem,
  Form,
  Field,
  CellGroup,
  Search,
  List,
  PullRefresh,
  Picker,
  Popup,
  Checkbox,
  Toast,
  Dialog,
  Icon
]

components.forEach(component => {
  app.use(component)
})

// 先注册pinia，确保store在路由之前初始化
console.log('🔄 正在注册pinia store...')
app.use(pinia)
console.log('✅ pinia注册完成，准备注册router...')
app.use(router)

// 设置开发环境的位置缓存清理工具
setupDevLocationCacheCleaner()

app.mount('#app')

console.log('App mounted, mock enabled:', import.meta.env.VITE_USE_MOCK)