// @/router/index.js - 临时调试版本
import { createRouter, createWebHistory } from 'vue-router'
import TestView from '@/views/TestView.vue'
import TestLocationView from '@/views/TestLocationView.vue'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/components/Layout/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/HomeView.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'activities-teams',
        name: 'ActivitiesTeams',
        component: () => import('@/views/activity/ActivityList.vue'),
        meta: { title: '活动/团队' }
      },
      {
        path: 'messages',
        name: 'Messages',
        component: () => import('@/views/chat/MessageList.vue'),
        meta: { title: '消息' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/ProfileView.vue'),
        meta: { title: '个人中心' }
      }
    ]
  },
  {
    path: '/test',
    name: 'test',
    component: TestView
  },
  {
    path: '/test-location',
    name: 'testLocation',
    component: TestLocationView,
    meta: {
      title: '位置功能测试'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/home'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 临时禁用路由守卫进行测试
// router.beforeEach((to, from, next) => {
//   console.log('🔄 路由变化:', from.path, '->', to.path)
//   
//   try {
//     // 获取authStore
//     const authStore = useAuthStore()
//     
//     // 检查是否需要认证
//     const requiresAuth = to.meta.requiresAuth !== false
//     const isAuthPage = to.path === '/login' || to.path === '/register'
//     
//     // 检查认证状态
//     let isAuthenticated = false
//     try {
//       isAuthenticated = authStore.isAuthenticated
//     } catch (error) {
//       console.warn('认证状态检查失败:', error)
//       isAuthenticated = false
//     }
//     
//     console.log('认证检查:', {
//       path: to.path,
//       requiresAuth,
//       isAuthenticated,
//       isAuthPage
//     })
//     
//     // 路由决策
//     if (requiresAuth && !isAuthenticated && !isAuthPage) {
//       console.log('🚫 需要认证但未登录，重定向到登录页')
//       next('/login')
//       return
//     }
//     
//     if (isAuthPage && isAuthenticated) {
//       console.log('✅ 已登录访问认证页面，重定向到首页')
//       next('/home')
//       return
//     }
//     
//     console.log('➡️ 允许访问')
//     next()
//     
//   } catch (error) {
//     console.error('路由守卫出错:', error)
//     // 出错时允许访问，避免阻塞
//     next()
//   }
// })

export default router