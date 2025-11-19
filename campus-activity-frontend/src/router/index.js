// @/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
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
    path: '/auth-test',
    name: 'AuthTest',
    component: () => import('@/views/AuthTestView.vue'),
    meta: { title: '认证测试' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/change-password',
    name: 'ChangePassword',
    component: () => import('@/views/ChangePasswordView.vue'),
    meta: { title: '修改密码', requiresAuth: false }
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
      // 活动/团队主页面
      {
        path: 'activities-teams',
        name: 'ActivitiesTeams',
        component: () => import('@/views/activity/ActivityList.vue'),
        meta: { title: '活动/团队' }
     },
      // 活动相关路由
      {
        path: 'activities',
        name: 'Activities',
        component: () => import('@/views/activity/ActivityList.vue'),
       meta: { title: '活动列表' }
      },
     {
       path: 'activities/create',
        name: 'CreateActivity',
        component: () => import('@/views/activity/CreateActivity.vue'),
        meta: { title: '创建活动' }
      },
      {
        path: 'activities/edit/:id',
        name: 'EditActivity',
        component: () => import('@/views/activity/EditActivity.vue'),
        meta: { title: '编辑活动' }
      },
      {
        path: 'activities/:id',
        name: 'ActivityDetail',
        component: () => import('@/views/activity/ActivityDetail.vue'),
        meta: { title: '活动详情' }
      },
      // 团队相关路由
      {
        path: 'teams',
        name: 'Teams',
        component: () => import('@/views/team/TeamList.vue'),
        meta: { title: '团队列表' }
      },
      {
        path: 'teams/create',
        name: 'CreateTeam',
        component: () => import('@/views/team/CreateTeam.vue'),
        meta: { title: '创建团队' }
      },
      {
        path: 'teams/quick-match',
        name: 'QuickMatch',
        redirect: '/teams',
        meta: { title: '快速匹配' }
      },
      {
        path: 'teams/:id',
        name: 'TeamDetail',
        component: () => import('@/views/team/TeamManagement.vue'),
        meta: { title: '团队详情' }
      },
      // 消息相关路由
      {
        path: 'messages',
        name: 'Messages',
        component: () => import('@/views/chat/MessageList.vue'),
        meta: { title: '消息' }
      },
      {
        path: 'chat/:activityId',
        name: 'ActivityChat',
        component: () => import('@/views/chat/ActivityChat.vue'),
        meta: { title: '活动聊天' }
      },
      // 个人中心
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/ProfileView.vue'),
        meta: { title: '个人中心' }
      },
      {
        path: 'profile/edit',
        name: 'EditProfile',
        component: () => import('@/views/ProfileEditView.vue'),
        meta: { title: '编辑资料' }
      },
      {
        path: 'my-activities',
        name: 'MyActivities',
        component: () => import('@/views/MyActivitiesView.vue'),
        meta: { title: '我的活动' }
      },
      {
        path: 'my-created-activities',
        name: 'MyCreatedActivities',
        component: () => import('@/views/MyCreatedActivitiesView.vue'),
        meta: { title: '我发布的活动' }
      },
      {
        path: 'my-enrolled-activities',
        name: 'MyEnrolledActivities',
        component: () => import('@/views/MyEnrolledActivitiesView.vue'),
        meta: { title: '我报名的活动' }
      },
      {
        path: 'my-teams',
        name: 'MyTeams',
        component: () => import('@/views/MyTeamsView.vue'),
        meta: { title: '我的团队' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/SettingsView.vue'),
        meta: { title: '设置' }
      },
      {
        path: 'feedback',
        name: 'Feedback',
        component: () => import('@/views/FeedbackView.vue'),
        meta: { title: '帮助反馈' }
      },
      {
        path: 'about',
        name: 'About',
        component: () => import('@/views/AboutView.vue'),
        meta: { title: '关于我们' }
      },
      {
        path: 'test-bottom-nav',
        name: 'TestBottomNav',
        component: () => import('@/views/TestBottomNav.vue'),
        meta: { title: '底部导航测试' }
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
    path: '/test-map',
    name: 'testMap',
    component: () => import('@/views/TestMapView.vue'),
    meta: {
      title: '地图功能测试'
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

// 简化的路由守卫 - 避免卡顿
router.beforeEach((to, from, next) => {
  console.log('🔄 路由变化:', from.path, '->', to.path)
  
  // 简单的认证检查，避免复杂逻辑导致卡顿
  const publicPages = ['/login', '/register', '/change-password']
  const authRequired = !publicPages.includes(to.path)
  
  // 检查localStorage中的登录状态
  const token = localStorage.getItem('token')
  const isAuthenticated = !!token
  
  console.log('🔐 认证检查:', { path: to.path, authRequired, isAuthenticated, hasToken: !!token })
  
  if (authRequired && !isAuthenticated) {
    console.log('🚫 需要认证但未登录，重定向到登录页')
    next('/login')
    return
  }
  
  // 移除这个逻辑，允许已登录用户访问登录页面
  // if (!authRequired && isAuthenticated) {
  //   console.log('✅ 已登录访问认证页面，重定向到首页')
  //   next('/home')
  //   return
  // }
  
  console.log('➡️ 允许访问')
  next()
})

export default router