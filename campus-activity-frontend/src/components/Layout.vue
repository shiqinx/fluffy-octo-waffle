<template>
  <div class="layout">
    <!-- 顶部导航 -->
    <van-nav-bar
      :title="title"
      fixed
      placeholder
    >
      <template #right>
        <van-icon name="user-circle-o" size="20" @click="$router.push('/login')" />
      </template>
    </van-nav-bar>
    
    <!-- 页面内容 -->
    <main class="main-content">
      <slot />
    </main>
    
    <!-- 底部导航 -->
    <van-tabbar v-model="activeTab" fixed placeholder>
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="search" to="/discover">发现</van-tabbar-item>
      <van-tabbar-item icon="plus" to="/create-activity">创建</van-tabbar-item>
      <van-tabbar-item icon="chat-o" to="/messages">消息</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  title: {
    type: String,
    default: '校园活动平台'
  }
})

const activeTab = ref(0)
</script>

<style scoped>
.layout {
  min-height: 100vh;
  background: #f5f5f5;
}

.main-content {
  padding-bottom: 50px; /* 为底部导航留出空间 */
}
</style>