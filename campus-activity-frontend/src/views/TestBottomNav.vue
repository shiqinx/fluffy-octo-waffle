<template>
  <div class="test-page">
    <h1>底部导航测试页面</h1>
    <p>如果你能看到这个页面，说明路由正常工作。</p>
    <p>底部导航应该显示在页面底部。</p>
    
    <div class="debug-info">
      <h2>调试信息：</h2>
      <p>当前路径：{{ $route.path }}</p>
      <p>页面高度：{{ pageHeight }}px</p>
      <button @click="scrollToBottom">滚动到底部</button>
    </div>
    
    <div class="content-spacer">
      <p>这是额外的内容用来测试滚动...</p>
      <p>这是额外的内容用来测试滚动...</p>
      <p>这是额外的内容用来测试滚动...</p>
      <p>这是额外的内容用来测试滚动...</p>
      <p>这是额外的内容用来测试滚动...</p>
      <p>这是额外的内容用来测试滚动...</p>
      <p>这是额外的内容用来测试滚动...</p>
      <p>这是额外的内容用来测试滚动...</p>
      <p>这是额外的内容用来测试滚动...</p>
      <p>这是额外的内容用来测试滚动...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const pageHeight = ref(0)

onMounted(() => {
  pageHeight.value = document.documentElement.scrollHeight
  console.log('测试页面加载完成，页面高度:', pageHeight.value)
})

const scrollToBottom = () => {
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: 'smooth'
  })
}
</script>

<style scoped>
.test-page {
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
}

.debug-info {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.content-spacer {
  margin-top: 50px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.content-spacer p {
  margin: 10px 0;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
}
</style>