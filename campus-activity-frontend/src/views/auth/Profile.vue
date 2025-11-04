<template>
  <div class="profile-page">
    <van-nav-bar title="我的" />
    <div class="content">
      <p>个人中心页面开发中...</p>
      <van-button type="primary" @click="logout">退出登录</van-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>