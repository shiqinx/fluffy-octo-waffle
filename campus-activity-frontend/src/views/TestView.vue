<template>
  <div class="test-view">
    <h1>校园活动平台</h1>
    <p>测试页面 - 如果这个能显示，说明基础配置正常</p>
    <van-button type="primary" @click="showToast">测试按钮</van-button>
    <router-link to="/login">去登录页</router-link>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Toast } from 'vant'

const router = useRouter()

const showToast = () => {
  Toast('测试成功！')
}
</script>

<style scoped>
.test-view {
  padding: 20px;
  text-align: center;
}
</style>