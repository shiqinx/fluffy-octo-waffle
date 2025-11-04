<template>
  <div id="app">
    <!-- 登录注册页面：不包裹 MainLayout -->
    <router-view v-if="isAuthPage" />
    
    <!-- 其他页面：使用完整布局 -->
    <MainLayout v-else>
      <router-view />
    </MainLayout>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from '@/components/Layout/MainLayout.vue'

const route = useRoute()

const isAuthPage = computed(() => {
  return route.name === 'login' || route.name === 'register'
})
</script>

<style>
/* 全局重置样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}
</style>