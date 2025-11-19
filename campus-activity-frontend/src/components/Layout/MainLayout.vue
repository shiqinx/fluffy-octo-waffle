<!-- @/components/Layout/MainLayout.vue -->
<template>
  <div class="main-layout">
    <!-- 主要内容区域 -->
    <div class="main-content">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>
    
    <!-- 底部导航 -->
    <SimpleBottomNav />
  </div>
</template>

<script setup>
import SimpleBottomNav from './SimpleBottomNav.vue'
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  position: relative;
}

.main-content {
  min-height: 100vh;
  padding-bottom: 80px; /* 增加底部间距，确保内容不被导航栏遮挡 */
}
</style>