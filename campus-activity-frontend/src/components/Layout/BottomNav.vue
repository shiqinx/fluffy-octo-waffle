<template>
  <van-tabbar v-model="active">
    <van-tabbar-item name="home" icon="home-o" to="/">首页</van-tabbar-item>
    <van-tabbar-item name="activities" icon="apps-o" to="/activities">活动</van-tabbar-item>
    <van-tabbar-item name="messages" icon="chat-o" to="/messages">消息</van-tabbar-item>
    <van-tabbar-item name="profile" icon="user-o" to="/profile">我的</van-tabbar-item>
  </van-tabbar>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const active = ref('home')

watch(() => route.path, (newPath) => {
  const pathToTabMap = {
    '/': 'home',
    '/activities': 'activities',
    '/messages': 'messages',
    '/profile': 'profile'
  }
  active.value = pathToTabMap[newPath] || 'home'
}, { immediate: true })
</script>