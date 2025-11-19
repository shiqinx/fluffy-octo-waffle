<template>
  <div class="simple-bottom-nav">
    <div class="nav-item" :class="{ active: active === 'home' }" @click="navigate('home')">
      <van-icon name="home-o" />
      <span>首页</span>
    </div>
    <div class="nav-item" :class="{ active: active === 'activities-teams' }" @click="navigate('activities-teams')">
      <van-icon name="friends-o" />
      <span>活动/团队</span>
    </div>
    <div class="nav-item" :class="{ active: active === 'messages' }" @click="navigate('messages')">
      <van-icon name="chat-o" />
      <span>消息</span>
    </div>
    <div class="nav-item" :class="{ active: active === 'profile' }" @click="navigate('profile')">
      <van-icon name="user-o" />
      <span>我的</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const active = ref('home')

const updateActive = () => {
  const path = route.path
  if (path.includes('/home')) {
    active.value = 'home'
  } else if (path.includes('/activities') || path.includes('/teams')) {
    active.value = 'activities-teams'
  } else if (path.includes('/messages') || path.includes('/chat')) {
    active.value = 'messages'
  } else if (path.includes('/profile') || path.includes('/settings')) {
    active.value = 'profile'
  }
}

const navigate = (name) => {
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
  router.push(targetPath)
}

onMounted(() => {
  updateActive()
})

watch(() => route.path, updateActive)
</script>

<style scoped>
.simple-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: white;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 9999;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 12px;
  cursor: pointer;
  transition: color 0.2s;
  flex: 1;
}

.nav-item.active {
  color: #667eea;
}

.nav-item .van-icon {
  font-size: 20px;
  margin-bottom: 2px;
}

.nav-item span {
  font-size: 12px;
}

.nav-item:hover {
  background: #f9f9f9;
}
</style>