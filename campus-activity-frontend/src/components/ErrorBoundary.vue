<!-- src/components/ErrorBoundary.vue -->
<template>
  <div v-if="hasError" class="error-boundary">
    <van-empty description="页面加载出错">
      <van-button @click="handleReset">重新加载页面</van-button>
    </van-empty>
  </div>
  <div v-else>
    <slot />
  </div>
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'

const hasError = ref(false)

const handleReset = () => {
  hasError.value = false
  window.location.reload()
}

onErrorCaptured((error, instance, info) => {
  console.error('ErrorBoundary 捕获错误:', error)
  console.error('组件:', instance)
  console.error('信息:', info)
  
  if (error.message?.includes('insertBefore')) {
    console.warn('DOM操作错误已被捕获')
    hasError.value = true
    return false // 阻止错误继续传播
  }
  
  return true // 允许其他错误继续传播
})
</script>

<style scoped>
.error-boundary {
  padding: 40px 20px;
  text-align: center;
}
</style>