<template>
  <div class="not-found">
    <div class="error-content">
      <div class="error-icon">🔍</div>
      <h1>页面未找到</h1>
      <p>抱歉，您访问的页面不存在</p>
      <button class="back-btn" @click="$router.push('/')">返回首页</button>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.not-found {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.error-content {
  text-align: center;
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.error-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

h1 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 24px;
}

p {
  margin: 0 0 24px 0;
  color: #666;
  font-size: 16px;
}

.back-btn {
  padding: 12px 24px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.back-btn:hover {
  background: #40a9ff;
}
</style>