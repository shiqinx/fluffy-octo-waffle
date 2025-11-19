<template>
  <div class="auth-test">
    <h1>认证状态测试</h1>
    <div class="auth-info">
      <p><strong>认证状态:</strong> {{ authStore.isAuthenticated ? '已登录' : '未登录' }}</p>
      <p><strong>Token:</strong> {{ authStore.token || '无' }}</p>
      <p><strong>用户信息:</strong> {{ authStore.user || '无' }}</p>
      <p><strong>登录时间:</strong> {{ authStore.loginTime || '无' }}</p>
    </div>
    <div class="actions">
      <button @click="goToLogin">去登录</button>
      <button @click="goToChangePassword">去修改密码</button>
      <button @click="goToSettings">去设置</button>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const goToLogin = () => {
  router.push('/login')
}

const goToChangePassword = () => {
  router.push('/change-password')
}

const goToSettings = () => {
  router.push('/settings')
}
</script>

<style scoped>
.auth-test {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.auth-info {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.auth-info p {
  margin: 10px 0;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.actions button {
  padding: 10px 20px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.actions button:hover {
  background: #40a9ff;
}
</style>