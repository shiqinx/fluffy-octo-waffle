<template>
  <div class="home-page">
    <!-- 顶部导航栏 -->
    <div class="header">
      <div class="header-content">
        <h1 class="title">校园活动地图</h1>
        <div class="header-actions">
          <van-button 
            type="primary" 
            size="small"
            @click="createActivity"
            class="action-btn"
          >
            ➕ 创建活动
          </van-button>
          <van-button 
            type="default" 
            size="small"
            @click="showLogoutConfirm"
            class="action-btn logout-btn"
          >
            🚪 退出
          </van-button>
          <!-- 临时测试按钮 -->
          <van-button 
            type="warning" 
            size="small"
            @click="testLogout"
            class="action-btn"
            style="background: #ff976a; color: white;"
          >
            🧪 测试退出
          </van-button>
        </div>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-section">
      <van-search
        v-model="searchKeyword"
        placeholder="搜索活动、地点..."
        shape="round"
        background="#f5f5f5"
        @search="onSearch"
      />
    </div>

    <!-- 地图区域 -->
    <div class="map-area">
      <MapContainer />
    </div>

    <!-- 底部导航 -->
    <div class="bottom-nav">
      <div class="nav-item active">
        <span class="icon">🗺️</span>
        <span class="text">地图</span>
      </div>
      <div class="nav-item" @click="goToActivities">
        <span class="icon">📋</span>
        <span class="text">活动</span>
      </div>
      <div class="nav-item" @click="goToMessages">
        <span class="icon">💬</span>
        <span class="text">消息</span>
      </div>
      <div class="nav-item" @click="goToProfile">
        <span class="icon">👤</span>
        <span class="text">我的</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { showConfirmDialog, Toast } from 'vant'
import MapContainer from '@/components/Map/MapContainer.vue'

const router = useRouter()
const authStore = useAuthStore()
const searchKeyword = ref('')

console.log('🗺️ 地图首页加载完成')

// 退出登录 - 添加详细调试
const showLogoutConfirm = async () => {
  console.log('🔄 开始退出登录流程')
  
  try {
    await showConfirmDialog({
      title: '确认退出',
      message: '您确定要退出登录吗？',
      confirmButtonText: '确定退出',
      cancelButtonText: '取消'
    })
    
    console.log('✅ 用户确认退出')
    
    // 检查当前认证状态
    const tokenBefore = localStorage.getItem('token')
    console.log('退出前 token:', tokenBefore)
    
    // 执行退出登录
    await authStore.logout()
    
    // 检查退出后的认证状态
    const tokenAfter = localStorage.getItem('token')
    console.log('退出后 token:', tokenAfter)
    
    Toast.success('退出登录成功')
    
    console.log('🛣️ 准备跳转到登录页，当前路由:', router.currentRoute.value.path)
    
    // 跳转到登录页 - 添加详细调试
    try {
      await router.push('/login')
      console.log('✅ 路由跳转成功')
    } catch (error) {
      console.error('❌ 路由跳转失败:', error)
      
      // 如果路由跳转失败，尝试其他方法
      console.log('🔄 尝试使用 replace 方法')
      router.replace('/login').then(() => {
        console.log('✅ replace 跳转成功')
      }).catch(error2 => {
        console.error('❌ replace 也失败:', error2)
        
        // 最后尝试原生跳转
        console.log('🔄 尝试使用原生跳转')
        window.location.href = '/login'
      })
    }
    
  } catch (error) {
    // 用户取消退出
    console.log('用户取消退出登录', error)
  }
}

// 添加一个测试退出按钮（临时）
const testLogout = () => {
  console.log('🧪 测试退出登录（无确认对话框）')
  
  // 直接清除存储
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  localStorage.removeItem('rememberedAccount')
  
  console.log('🗑️ 存储已清除')
  Toast.success('测试退出成功')
  
  // 直接跳转
  router.push('/login').then(() => {
    console.log('✅ 测试跳转成功')
  }).catch(error => {
    console.error('❌ 测试跳转失败:', error)
    window.location.href = '/login'
  })
}

// 创建活动
const createActivity = () => {
  router.push('/activities/create')
}

// 搜索
const onSearch = () => {
  if (searchKeyword.value.trim()) {
    console.log('搜索:', searchKeyword.value)
    Toast(`搜索: ${searchKeyword.value}`)
  }
}

// 底部导航跳转
const goToActivities = () => {
  router.push('/activities')
}

const goToMessages = () => {
  router.push('/messages')
}

const goToProfile = () => {
  router.push('/profile')
}
</script>

<style scoped>
.home-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  border-radius: 16px;
  font-weight: 500;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.search-section {
  background: white;
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
}

.map-area {
  flex: 1;
  background: #f5f5f5;
  position: relative;
}

.bottom-nav {
  background: white;
  padding: 10px 0;
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #eee;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 5px 15px;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.nav-item.active {
  background: #f0f7ff;
  color: #1989fa;
}

.nav-item:hover {
  background: #f5f5f5;
}

.icon {
  font-size: 20px;
}

.text {
  font-size: 12px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .header {
    padding: 12px;
  }
  
  .title {
    font-size: 16px;
  }
  
  .header-actions {
    gap: 6px;
  }
  
  .action-btn {
    font-size: 12px;
    padding: 4px 8px;
  }
}
</style>