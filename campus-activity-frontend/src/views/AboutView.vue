<template>
  <div class="about-view">
    <van-nav-bar title="关于我们" left-arrow @click-left="$router.back()" />

    <div class="about-content">
      <!-- 应用信息 -->
      <div class="app-info">
        <div class="app-logo">
          <van-image
            round
            width="80"
            height="80"
            src="/logo.png"
            fallback="/default-logo.png"
          />
        </div>
        <div class="app-details">
          <h2>校园活动平台</h2>
          <p>版本 v1.0.0</p>
          <p>基于位置的校园活动与组队平台</p>
        </div>
      </div>

      <!-- 功能特性 -->
      <van-cell-group title="功能特性">
        <van-cell title="活动发布与管理" icon="orders-o" />
        <van-cell title="基于位置的活动发现" icon="location-o" />
        <van-cell title="在线组队匹配" icon="friends-o" />
        <van-cell title="实时聊天沟通" icon="chat-o" />
        <van-cell title="智能推荐系统" icon="flower-o" />
      </van-cell-group>

      <!-- 开发团队 -->
      <van-cell-group title="开发团队">
        <van-cell title="孙金瑶" label="2330502143 - 全栈开发" />
        <van-cell title="卢敏婷" label="2330502134 - 全栈开发" />
        <van-cell title="指导老师" label="郭富勇" />
      </van-cell-group>

      <!-- 技术栈 -->
      <van-cell-group title="技术栈">
        <van-cell title="前端" value="Vue3 + Vant + Vite" />
        <van-cell title="后端" value="Spring Boot + MySQL" />
        <van-cell title="地图服务" value="高德地图 API" />
        <van-cell title="实时通信" value="WebSocket" />
      </van-cell-group>

      <!-- 联系信息 -->
      <van-cell-group title="联系信息">
        <van-cell title="官方网站" value="campus-activity.com" is-link />
        <van-cell title="客服邮箱" value="support@campus-activity.com" is-link />
        <van-cell title="反馈QQ群" value="123456789" is-link />
      </van-cell-group>

      <!-- 版权信息 -->
      <div class="copyright">
        <p>© 2024 广东药科大学 医药信息工程学院</p>
        <p>版权所有</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { showToast } from 'vant'

// 可以添加点击联系信息的处理函数
const handleContactClick = (type, value) => {
  switch (type) {
    case 'website':
      window.open(`https://${value}`, '_blank')
      break
    case 'email':
      window.location.href = `mailto:${value}`
      break
    case 'qq':
      showToast(`QQ群: ${value}`)
      break
  }
}
</script>

<style scoped>
.about-view {
  background: #f5f5f5;
  min-height: 100vh;
}

.about-content {
  padding: 20px 0;
}

.app-info {
  background: white;
  padding: 30px 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.app-details h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #333;
}

.app-details p {
  margin: 4px 0;
  font-size: 14px;
  color: #666;
}

.copyright {
  text-align: center;
  padding: 30px 20px;
  color: #999;
  font-size: 12px;
}

.copyright p {
  margin: 4px 0;
}
</style>