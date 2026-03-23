import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用插件
app.use(ElementPlus)
app.use(createPinia())
app.use(router)

// 全局配置
app.config.globalProperties.$api = {
  baseURL: process.env.VUE_APP_API_BASE_URL || '/api',
  timeout: 30000
}

// 挂载应用
app.mount('#app')