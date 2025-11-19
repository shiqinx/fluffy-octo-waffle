<!-- @/components/Layout/BottomNav.vue -->
<template>
  <div class="bottom-nav-container">
    <van-tabbar v-model="active" fixed @change="onTabChange">
      <van-tabbar-item name="home" to="/home" icon="home-o">
        首页
      </van-tabbar-item>
      <van-tabbar-item name="activities-teams" to="/activities-teams" icon="friends-o">
        活动/团队
      </van-tabbar-item>
      <van-tabbar-item name="messages" to="/messages" icon="chat-o">
        消息
      </van-tabbar-item>
      <van-tabbar-item name="profile" to="/profile" icon="user-o">
        我的
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const active = ref('home')

// 初始化时设置正确的激活状态
onMounted(() => {
  updateActiveTab()
  console.log('底部导航初始化完成，当前路径:', route.path)
})

// 根据当前路由更新激活状态
const updateActiveTab = () => {
  const path = route.path
  console.log('更新激活状态，当前路径:', path)
  
  if (path.includes('/home')) {
    active.value = 'home'
  } else if (path.includes('/activities') || path.includes('/teams')) {
    active.value = 'activities-teams'
  } else if (path.includes('/messages') || path.includes('/chat')) {
    active.value = 'messages'
  } else if (path.includes('/profile') || path.includes('/settings')) {
    active.value = 'profile'
  }
  
  console.log('激活的标签:', active.value)
}

// 监听路由变化
watch(
  () => route.path,
  () => {
    updateActiveTab()
  }
)

const onTabChange = (name) => {
  console.log('点击标签:', name)
  
  try {
    // 直接使用路由跳转
    let targetPath = ''
    
    switch (name) {
      case 'home':
        targetPath = '/home'
        break
      case 'activities-teams':
        targetPath = '/activities-teams'
        break
      case 'messages':
        targetPath = '/messages'
        break
      case 'profile':
        targetPath = '/profile'
        break
      default:
        targetPath = '/home'
    }
    
    console.log('尝试跳转到:', targetPath)
    router.push(targetPath)
  } catch (error) {
    console.error('导航失败:', error)
  }
}
</script>

<style scoped>
.bottom-nav-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background-color: #fff;
}

/* 减小底部导航的高度和图标大小 */
:deep(.van-tabbar) {
  height: 50px; /* 减小高度 */
  padding-bottom: env(safe-area-inset-bottom, 0); /* 适配全面屏 */
}

/* 减小图标大小 */
:deep(.van-icon) {
  font-size: 20px !important;
}

/* 减小文字大小 */
:deep(.van-tabbar-item__text) {
  font-size: 12px;
}

/* 确保内容区域有足够的底部间距，防止被导航栏遮挡 */
/* 注意：这个样式已经移到MainLayout.vue中统一管理 */
</style>