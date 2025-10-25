<template>
  <div class="main-layout">
    <!-- 主要内容区域 -->
    <main class="main-content">
      <router-view />
    </main>
    
    <!-- 底部导航 -->
    <BottomNav />
  </div>
</template>

<script setup>
import BottomNav from './BottomNav.vue'
</script>

<style scoped>
.main-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}
</style>