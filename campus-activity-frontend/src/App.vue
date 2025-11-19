<template>
  <div id="app">
    <!-- 全局位置错误提示 -->
    <van-popup v-model:show="showLocationError" position="top" duration="300" closeable>
      <div class="location-error-popup">
        <h3>位置获取失败</h3>
        <p class="error-message">{{ locationError.message }}</p>
        <div v-if="locationError.suggestion" class="error-suggestion">
          <p>{{ locationError.suggestion }}</p>
        </div>
        <div class="popup-actions">
          <van-button type="default" @click="handleLocationErrorAction('ignore')" size="small">
            忽略
          </van-button>
          <van-button type="primary" @click="handleLocationErrorAction('retry')" size="small">
            重试
          </van-button>
          <van-button v-if="locationError.canUseDefault" type="info" @click="handleLocationErrorAction('useDefault')" size="small">
            使用默认位置
          </van-button>
        </div>
      </div>
    </van-popup>
    
    <router-view />
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useLocationStore } from '@/stores/location'
import { showToast } from 'vant'
import { useAppStore } from '@/stores/appStore'

const authStore = useAuthStore()
const locationStore = useLocationStore()
const appStore = useAppStore()
const showLocationError = ref(false)
const locationError = ref({})
const locationRetryCount = ref(0)
const MAX_RETRY_COUNT = 3
const isAuthRecoveryComplete = ref(false)

// 处理位置错误
const handleLocationError = (error) => {
  console.error('位置获取错误:', error)
  
  // 转换错误格式为统一对象
  const formattedError = typeof error === 'string' 
    ? { message: error, code: 'UNKNOWN_ERROR', suggestion: '请稍后再试' }
    : { ...error }
  
  // 设置默认建议如果没有提供
  if (!formattedError.suggestion) {
    switch (formattedError.code) {
      case 'PERMISSION_DENIED':
        formattedError.suggestion = '请在浏览器设置中允许访问位置信息'
        break
      case 'POSITION_UNAVAILABLE':
        formattedError.suggestion = '当前位置不可用，请检查设备定位服务'
        break
      case 'TIMEOUT':
        formattedError.suggestion = '定位超时，请检查网络连接'
        break
      default:
        formattedError.suggestion = '请稍后再试或使用默认位置'
    }
  }
  
  formattedError.canUseDefault = true
  locationError.value = formattedError
  
  // 只在非测试页面显示错误提示
  const currentRoute = window.location.pathname
  if (!currentRoute.includes('/test-location') && !currentRoute.includes('/test')) {
    showLocationError.value = true
  }
}

// 初始化认证状态
async function initAuth() {
  console.log('🔄 开始初始化认证状态...')
  try {
    // 明确调用authStore的initialize方法确保状态正确恢复
    console.log('📋 显式初始化authStore...')
    authStore.initialize && typeof authStore.initialize === 'function' && authStore.initialize()
    
    // 验证token是否有效（可选）
    if (authStore.token) {
      console.log('🔍 检测到保存的token，验证是否有效...')
      // 检查登录时间和token是否过期
      console.log('⏰ 当前token信息:', {
        tokenExists: !!authStore.token,
        loginTimeExists: !!authStore.loginTime,
        userInfoExists: !!authStore.user
      })
      
      // 明确触发isAuthenticated计算属性来检查状态
      console.log('✅ 认证状态检查结果:', authStore.isAuthenticated ? '已认证' : '未认证')
    }
    
    isAuthRecoveryComplete.value = true
    console.log('✅ 认证恢复完成状态:', isAuthRecoveryComplete.value)
    
    return authStore.isAuthenticated
  } catch (error) {
    console.error('❌ 认证初始化过程中出错:', error)
    return false
  }
}

// 处理位置错误操作
const handleLocationErrorAction = (action) => {
  showLocationError.value = false
  
  switch (action) {
    case 'retry':
      if (locationRetryCount.value < MAX_RETRY_COUNT) {
        locationRetryCount.value++
        showToast('正在重新获取位置...')
        locationStore.initLocationService()
      } else {
        showToast('已达到最大重试次数，请稍后再试')
        locationRetryCount.value = 0
      }
      break
    case 'useDefault':
      const defaultLoc = locationStore.useDefaultLocation()
      showToast(`已使用默认位置 [${defaultLoc.longitude}, ${defaultLoc.latitude}]`)
      break
    case 'ignore':
    default:
      // 忽略错误，可能会使用缓存的位置或空位置
      break
  }
}

// 初始化位置服务
const initLocationService = async () => {
  try {
    console.log('正在初始化位置服务...')
    
    // 检查位置权限
    const hasPermission = await locationStore.checkLocationPermission()
    if (!hasPermission) {
      console.warn('位置权限未授予，将使用默认位置')
      locationStore.useDefaultLocation()
      return
    }
    
    // 初始化位置
    await locationStore.initLocationService()
    
    // 开始位置监听（如果需要）
    // locationStore.startWatchingLocation()
    
    console.log('位置服务初始化完成')
  } catch (error) {
    handleLocationError(error)
  }
}

// 监听位置错误变化
watch(
  () => locationStore.locationError,
  (newError) => {
    if (newError) {
      handleLocationError(newError)
    }
  },
  { deep: true }
)

onMounted(async () => {
    try {
      // 初始化认证状态
      console.log('🔄 开始初始化认证流程...')
      const isAuthenticated = await initAuth()
    
      // 初始化后检查登录状态
      console.log('👤 初始化后登录状态检查:', isAuthenticated ? '已登录' : '未认证')
      
      // 设置全局状态
      if (isAuthenticated) {
        console.log('👤 用户已登录，准备进入主页')
        appStore.setGlobalLoading(false)
      }
      
      // 初始化位置服务
      initLocationService()
    } catch (error) {
      console.error('❌ 认证初始化失败:', error)
    }
  })

// 导出方法供组件外部使用（如果需要）
defineExpose({
  handleLocationErrorAction
})
</script>

<style>
#app {
  min-height: 100vh;
  overflow: visible;
  position: relative;
}

/* 位置错误弹窗样式 */
.location-error-popup {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
}

.location-error-popup h3 {
  margin: 0 0 10px 0;
  color: #e74c3c;
  font-size: 18px;
}

.error-message {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 14px;
}

.error-suggestion {
  padding: 10px;
  background: #fff3cd;
  border-radius: 4px;
  margin-bottom: 15px;
}

.error-suggestion p {
  margin: 0;
  color: #856404;
  font-size: 13px;
}

.popup-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style>