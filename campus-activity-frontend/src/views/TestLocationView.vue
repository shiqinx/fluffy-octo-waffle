<template>
  <div class="test-location-container">
    <h1>位置功能测试</h1>
    
    <!-- 状态卡片 -->
    <div class="status-card" :class="locationStatusClass">
      
      <div class="status-header">
        <h2>位置服务状态</h2>
        <div class="status-badge" :class="locationStatusClass">
          {{ locationStatusText }}
        </div>
      </div>
      
      <div class="location-info">
        <div v-if="locationStore.currentLocation" class="location-details">
          <div class="location-main">
            <div class="location-coords">
              <div class="coord-group">
                <span class="coord-label">纬度:</span>
                <span class="coord-value">{{ locationStore.currentLocation.latitude.toFixed(6) }}</span>
              </div>
              <div class="coord-group">
                <span class="coord-label">经度:</span>
                <span class="coord-value">{{ locationStore.currentLocation.longitude.toFixed(6) }}</span>
              </div>
            </div>
            <div class="location-accuracy">
              <span class="accuracy-label">精度:</span>
              <span class="accuracy-value" :class="accuracyClass">
                {{ locationStore.currentLocation.accuracy }} 米
                <span class="accuracy-level">({{ locationAccuracyText }})</span>
              </span>
            </div>
          </div>
          
          <div class="location-meta">
            <div class="meta-item">
              <span class="meta-label">获取时间:</span>
              <span class="meta-value">{{ formatTimestamp(locationStore.currentLocation.timestamp) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">位置类型:</span>
              <span class="meta-value type-badge" :class="locationTypeClass">
                {{ locationStore.currentLocation.isDefault ? '默认位置' : locationStore.currentLocation.isMock ? '模拟位置' : '实际位置' }}
              </span>
            </div>
            <div class="meta-item" v-if="locationAge > 0">
              <span class="meta-label">位置年龄:</span>
              <span class="meta-value cache-badge">
                {{ locationAge.toFixed(1) }} 分钟
              </span>
            </div>
          </div>
        </div>
        
        <div v-else-if="locationStore.isLocating" class="location-loading">
          <div class="loading-spinner"></div>
          <div class="loading-text">正在获取位置信息...</div>
        </div>
        
        <div v-else class="no-location">
          <p>位置信息尚未获取</p>
        </div>
      </div>
    </div>
    
    <!-- 错误信息展示 -->
    <div class="error-info" v-if="locationStore.locationError">
      <div class="error-header">
        <h3>位置获取失败 <span class="error-code">({{ getErrorCode(locationStore.locationError) }})</span></h3>
        <button @click="clearError" class="clear-error-btn">
          清除错误
        </button>
      </div>
      
      <div v-if="typeof locationStore.locationError === 'string'">
        <p class="error-message">{{ locationStore.locationError }}</p>
      </div>
      <div v-else>
        <p class="error-message">{{ locationStore.locationError.message }}</p>
        <p v-if="locationStore.locationError.suggestion" class="suggestion">
          💡 {{ locationStore.locationError.suggestion }}
        </p>
        <p v-if="locationStore.locationError.detailedMessage" class="detailed-error">
          详细信息: {{ locationStore.locationError.detailedMessage }}
        </p>
        <!-- 显示开发环境的调试信息 -->
        <div v-if="isDev && locationStore.locationError.debugInfo" class="debug-info">
          <details>
            <summary>调试信息 (开发环境)</summary>
            <pre>{{ JSON.stringify(locationStore.locationError.debugInfo, null, 2) }}</pre>
          </details>
        </div>
      </div>
      
      <!-- 错误恢复建议 -->
      <div class="error-recovery">
        <h4>尝试解决问题:</h4>
        <ul>
          <li v-if="isPermissionError(locationStore.locationError)">
            请确保已授权位置权限
            <button @click="requestPermissionManually" class="recovery-btn">
              重新请求权限
            </button>
          </li>
          <li v-if="isTimeoutError(locationStore.locationError)">
            尝试在信号更好的地方重新获取位置
          </li>
          <li v-if="isUserFriendlyError(locationStore.locationError)">
            这是一个友好的错误消息，应用已处理错误避免崩溃
          </li>
          <li>
            定位超时，请重试
            <button @click="refreshLocation" class="recovery-btn">
              立即重试
            </button>
          </li>
          <li>
            尝试使用默认位置
            <button @click="useDefaultLocation" class="recovery-btn">
              使用默认位置
            </button>
          </li>
        </ul>
      </div>
    </div>
    
    <!-- 操作按钮区域 - 分为主要操作和辅助操作 -->
    <div class="test-actions">
      <div class="action-group primary">
        <button @click="testLocationPermission" :disabled="locationStore.isLocating" class="btn-primary">
          <span class="btn-icon">📍</span>
          {{ locationStore.isLocating ? '定位中...' : '获取位置' }}
        </button>
        
        <button @click="refreshLocation" :disabled="locationStore.isLocating" class="btn-secondary">
          <span class="btn-icon">🔄</span>
          刷新位置
        </button>
        
        <button @click="useDefaultLocation" :disabled="locationStore.isLocating" class="btn-secondary">
          <span class="btn-icon">🏫</span>
          默认位置
        </button>
      </div>
      
      <div class="action-group">
        <button @click="startWatching" v-if="!isWatching" :disabled="locationStore.isLocating" class="btn-secondary">
          <span class="btn-icon">👁️</span>
          开始监听
        </button>
        
        <button @click="stopWatching" v-else class="btn-danger">
          <span class="btn-icon">🛑</span>
          停止监听
        </button>
        
        <button @click="clearLocation" :disabled="locationStore.isLocating" class="btn-outline">
          <span class="btn-icon">🗑️</span>
          清除位置
        </button>
        
        <button @click="checkLocationSupport" :disabled="locationStore.isLocating" class="btn-outline">
          <span class="btn-icon">ℹ️</span>
          检查支持
        </button>
      </div>
    </div>
    
    <!-- 开发模式功能 -->
    <div v-if="locationStore.isDevMode" class="dev-mode-section">
      <h2>开发模式功能</h2>
      <div class="dev-controls">
        <div class="toggle-switch">
          <label>
            <input 
              type="checkbox" 
              v-model="locationStore.useMockLocation"
              @change="onMockLocationToggle"
            >
            使用模拟位置
          </label>
        </div>
        
        <div v-if="locationStore.useMockLocation" class="mock-locations">
          <h3>选择模拟位置:</h3>
          <div class="location-buttons">
            <button
              v-for="(loc, index) in locationStore.mockLocationList"
              :key="index"
              @click="selectMockLocation(index)"
              :class="{ active: isCurrentMockLocation(index) }"
            >
              {{ loc.name }}
            </button>
          </div>
        </div>
        
        <div class="validation-config">
          <h3>验证配置:</h3>
          <label>
            <input 
              type="checkbox" 
              v-model="locationStore.locationValidationConfig.useStrictValidation"
            >
            使用严格验证
          </label>
          <div class="config-details">
            <p>最大纬度差: {{ locationStore.locationValidationConfig.maxLatDiff }}</p>
            <p>最大经度差: {{ locationStore.locationValidationConfig.maxLngDiff }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 调试信息和日志 -->
    <div class="debug-section">
      <div class="debug-info">
        <h3>位置状态信息</h3>
        <div class="debug-grid">
          <div class="debug-item">
            <span class="debug-label">权限状态:</span>
            <span class="debug-value" :class="permissionClass">
              {{ permissionStatus }}
            </span>
          </div>
          <div class="debug-item">
            <span class="debug-label">定位进行中:</span>
            <span class="debug-value" :class="locationStore.isLocating ? 'status-yes' : 'status-no'">
              {{ locationStore.isLocating ? '是' : '否' }}
            </span>
          </div>
          <div class="debug-item">
            <span class="debug-label">位置监听:</span>
            <span class="debug-value" :class="isWatching ? 'status-yes' : 'status-no'">
              {{ isWatching ? '开启' : '关闭' }}
            </span>
          </div>
          <div class="debug-item">
            <span class="debug-label">浏览器支持:</span>
            <span class="debug-value" :class="isGeolocationSupported ? 'status-yes' : 'status-no'">
              {{ isGeolocationSupported ? '支持' : '不支持' }}
            </span>
          </div>
          <div class="debug-item">
            <span class="debug-label">模拟位置:</span>
            <span class="debug-value" :class="locationStore.useMockLocation ? 'status-yes' : 'status-no'">
              {{ locationStore.useMockLocation ? '开启' : '关闭' }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="log-container">
        <h3>操作日志</h3>
        <div class="logs">
          <div v-for="(log, index) in logs" :key="index" class="log-item" :class="getLogClass(log)">
            {{ log }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, watch } from 'vue'
import { useLocationStore } from '@/stores/location'
import { showToast, showDialog } from 'vant'

const locationStore = useLocationStore()
const logs = ref([])
const isWatching = ref(false)
const permissionStatus = ref('unknown')
const isGeolocationSupported = ref(navigator.geolocation !== undefined)
const lastLocationTime = ref(null)

// 监听位置变化，更新最后更新时间
watch(() => locationStore.currentLocation, (newLocation) => {
  if (newLocation) {
    lastLocationTime.value = newLocation.timestamp
  }
}, { immediate: true })

// 格式化时间戳
const formatTimestamp = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 计算属性：是否为开发环境
const isDev = computed(() => import.meta.env.DEV)

// 位置状态相关计算属性
const locationStatusClass = computed(() => {
  if (locationStore.locationError) return 'status-error'
  if (locationStore.isLocating) return 'status-loading'
  if (!locationStore.currentLocation) return 'status-pending'
  if (locationStore.currentLocation.isDefault) return 'status-warning'
  if (locationStore.currentLocation.isMock) return 'status-info'
  return 'status-success'
})

const locationStatusText = computed(() => {
  if (locationStore.locationError) return '错误'
  if (locationStore.isLocating) return '获取中'
  if (!locationStore.currentLocation) return '未获取'
  if (locationStore.currentLocation.isDefault) return '默认位置'
  if (locationStore.currentLocation.isMock) return '模拟位置'
  return '正常'
})

// 位置精度文本
const locationAccuracyText = computed(() => {
  const accuracyMap = {
    'high': '高精度',
    'medium': '中等精度',
    'low': '低精度',
    'unknown': '未知'
  }
  return accuracyMap[locationStore.locationAccuracy] || '未知'
})

// 精度类名
const accuracyClass = computed(() => {
  if (!locationStore.currentLocation) return ''
  if (locationStore.currentLocation.accuracy <= 10) return 'accuracy-high'
  if (locationStore.currentLocation.accuracy <= 50) return 'accuracy-medium'
  return 'accuracy-low'
})

// 位置类型类名
const locationTypeClass = computed(() => {
  if (!locationStore.currentLocation) return ''
  if (locationStore.currentLocation.isDefault) return 'type-default'
  if (locationStore.currentLocation.isMock) return 'type-mock'
  return 'type-real'
})

// 位置年龄（分钟）
const locationAge = computed(() => {
  if (!locationStore.currentLocation || !locationStore.currentLocation.timestamp) return 0
  const now = Date.now()
  const ageMs = now - locationStore.currentLocation.timestamp
  return ageMs / (1000 * 60)
})

// 权限状态类名
const permissionClass = computed(() => {
  switch (permissionStatus.value) {
    case 'granted': return 'permission-granted'
    case 'denied': return 'permission-denied'
    case 'prompt': return 'permission-prompt'
    default: return ''
  }
})

// 添加日志，支持不同级别的日志
const addLog = (message, level = 'info') => {
  const timestamp = new Date().toLocaleTimeString('zh-CN')
  logs.value.unshift(`[${timestamp}] [${level.toUpperCase()}] ${message}`)
  // 限制日志数量
  if (logs.value.length > 50) {
    logs.value = logs.value.slice(0, 50)
  }
}

// 判断日志级别，用于样式
const getLogClass = (log) => {
  if (log.includes('[ERROR]')) return 'log-error'
  if (log.includes('[WARN]')) return 'log-warning'
  if (log.includes('[SUCCESS]')) return 'log-success'
  return 'log-info'
}

// 获取错误码
const getErrorCode = (error) => {
  if (!error) return 'UNKNOWN'
  if (typeof error === 'string') return 'UNKNOWN'
  return error.code || error.type || 'UNKNOWN'
}

// 判断是否为权限错误
const isPermissionError = (error) => {
  if (!error) return false
  if (typeof error === 'string') return error.includes('permission') || error.includes('权限')
  return error.code === 1 || error.message.includes('permission') || error.message.includes('权限')
}

// 判断是否为超时错误
const isTimeoutError = (error) => {
  if (!error) return false
  if (typeof error === 'string') return error.includes('timeout') || error.includes('超时')
  return error.code === 3 || error.message.includes('timeout') || error.message.includes('超时')
}

// 检测用户友好的错误
const isUserFriendlyError = (error) => {
  if (!error) return false
  return error.isUserFriendly === true
}

// 清除错误
const clearError = () => {
  locationStore.locationError = null
  addLog('错误已清除')
}

// 清除位置
const clearLocation = () => {
  locationStore.clearLocation()
  isWatching.value = false
  lastLocationTime.value = null
  addLog('位置数据已清除')
  showToast('位置数据已清除')
}

// 检查地理位置支持
const checkLocationSupport = () => {
  isGeolocationSupported.value = navigator.geolocation !== undefined
  addLog(`浏览器位置服务支持: ${isGeolocationSupported.value ? '是' : '否'}`)
  
  if (!isGeolocationSupported.value) {
    showDialog({
      title: '位置服务不可用',
      message: '您的浏览器不支持地理位置服务，请使用现代浏览器访问此页面。',
      confirmButtonText: '知道了'
    })
  }
}

// 测试位置权限
const testLocationPermission = async () => {
  try {
    addLog('开始测试位置权限...', 'info')
    
    // 先检查浏览器支持
    if (!navigator.geolocation) {
      throw new Error('浏览器不支持地理位置服务')
    }
    
    // 检查权限状态
    if (navigator.permissions) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' })
        permissionStatus.value = result.state
        addLog(`浏览器权限状态: ${result.state}`, 'info')
        
        // 如果权限被拒绝，提前提示用户
        if (result.state === 'denied') {
          await showDialog({
            title: '权限被拒绝',
            message: '位置权限已被拒绝，请在浏览器设置中允许位置访问，然后重试。',
            confirmButtonText: '知道了'
          })
          return
        }
      } catch (permError) {
        addLog('无法检查权限状态，将直接请求位置', 'warn')
      }
    }
    
    // 请求位置信息，设置超时处理
    const location = await Promise.race([
      locationStore.requestLocationPermission(),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('位置请求超时，请检查设备定位是否开启')), 20000)
      })
    ])
    
    if (location) {
      addLog(`位置获取成功，精度: ${location.accuracy}米`, 'success')
      showToast({
        type: 'success',
        message: `位置获取成功，精度: ${location.accuracy}米`
      })
    }
  } catch (error) {
    addLog(`位置获取失败: ${error.message}`, 'error')
    console.error('位置获取错误详情:', error)
    
    // 根据错误类型显示不同的提示
    let errorMessage = '位置获取失败'
    let errorSuggestion = ''
    
    if (error.message.includes('permission') || error.message.includes('权限')) {
      errorMessage = '位置权限被拒绝'
      errorSuggestion = '请在浏览器设置中允许位置访问，或使用默认位置'
    } else if (error.message.includes('timeout') || error.message.includes('超时')) {
      errorMessage = '位置获取超时'
      errorSuggestion = '请检查设备定位是否开启，并确保在信号良好的环境中'
    } else if (error.message.includes('position') || error.message.includes('位置')) {
      errorMessage = '无法获取位置'
      errorSuggestion = '请确保设备定位已开启，并允许网站访问位置'
    }
    
    showToast({
      type: 'fail',
      message: errorMessage,
      duration: 3000
    })
    
    // 显示详细错误和建议
    if (errorSuggestion) {
      setTimeout(() => {
        showDialog({
          title: errorMessage,
          message: errorSuggestion,
          confirmButtonText: '使用默认位置',
          showCancelButton: true,
          cancelButtonText: '取消',
          async confirm() {
            useDefaultLocation()
          }
        })
      }, 1500)
    }
  }
}

// 手动请求权限
const requestPermissionManually = async () => {
  try {
    addLog('尝试手动请求位置权限...', 'info')
    
    // 直接调用位置请求，这会触发浏览器的权限提示
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          addLog('位置权限授予成功', 'success')
          showToast('位置权限已授予')
          // 重新获取位置
          refreshLocation()
        },
        (error) => {
          // 改进的 GeolocationPositionError 处理
          const errorMessage = error && typeof error === 'object' ? 
            `${error.name || 'GeolocationPositionError'} (${error.code}): ${error.message}` : 
            String(error)
          addLog(`权限请求失败: ${errorMessage}`, 'error')
          
          // 根据错误类型提供更具体的提示
          let userMessage = '权限请求失败'
          if (error && error.code === 1) {
            userMessage = '位置权限被拒绝，请手动在浏览器设置中允许位置访问'
            addLog('  → 用户拒绝了位置权限', 'warn')
          } else if (error && error.code === 2) {
            userMessage = '位置信息不可用，请检查GPS是否开启'
            addLog('  → 位置信息不可用（GPS信号弱或关闭）', 'warn')
          } else if (error && error.code === 3) {
            userMessage = '获取位置超时，请重试'
            addLog('  → 获取位置超时', 'warn')
          }
          
          showToast(userMessage)
        },
        {
          timeout: 10000
        }
      )
    }
  } catch (error) {
    addLog(`手动请求权限时出错: ${error.message}`, 'error')
  }
}

// 刷新位置
const refreshLocation = async () => {
  try {
    addLog('开始刷新位置...', 'info')
    
    // 清除之前的错误
    if (locationStore.locationError) {
      locationStore.locationError = null
    }
    
    const location = await Promise.race([
      locationStore.refreshLocation(),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('位置刷新超时')), 15000)
      })
    ])
    
    addLog(`位置刷新成功，精度: ${location.accuracy}米`, 'success')
    showToast({
      type: 'success',
      message: '位置刷新成功'
    })
  } catch (error) {
    addLog(`位置刷新失败: ${error.message}`, 'error')
    showToast({
      type: 'fail',
      message: '位置刷新失败'
    })
  }
}

// 开始位置监听
const startWatching = () => {
  try {
    addLog('开始位置监听...', 'info')
    
    // 检查浏览器支持
    if (!navigator.geolocation) {
      throw new Error('浏览器不支持位置监听')
    }
    
    // 检查权限状态
    if (permissionStatus.value === 'denied') {
      throw new Error('位置权限被拒绝，无法开始监听')
    }
    
    const watchOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 3000,
      distanceFilter: 5 // 移动超过5米触发更新
    }
    
    locationStore.startLocationWatch(
      watchOptions,
      (newLocation) => {
        addLog(`位置更新: [${newLocation.longitude}, ${newLocation.latitude}]，精度: ${newLocation.accuracy}米`, 'success')
      },
      (error) => {
        addLog(`位置监听错误: ${error.message}`, 'error')
        showToast({
          type: 'fail',
          message: `位置监听错误: ${error.message}`
        })
      }
    )
    
    isWatching.value = true
    addLog('位置监听已启动', 'success')
    showToast({
      type: 'success',
      message: '位置监听已启动'
    })
  } catch (error) {
    addLog(`位置监听启动失败: ${error.message}`, 'error')
    showToast({
      type: 'fail',
      message: '位置监听启动失败'
    })
  }
}

// 停止位置监听
const stopWatching = () => {
  locationStore.stopLocationWatch()
  isWatching.value = false
  addLog('位置监听已停止', 'info')
  showToast('位置监听已停止')
}

// 使用默认位置
const useDefaultLocation = () => {
  try {
    const location = locationStore.useDefaultLocation()
    addLog(`使用默认位置: [${location.longitude}, ${location.latitude}]`, 'info')
    showToast({
      type: 'success',
      message: '已使用默认位置'
    })
  } catch (error) {
    addLog(`使用默认位置失败: ${error.message}`, 'error')
    showToast({
      type: 'fail',
      message: '使用默认位置失败'
    })
  }
}

// 模拟位置切换事件
const onMockLocationToggle = () => {
  addLog(locationStore.useMockLocation 
    ? '启用模拟位置功能' 
    : '禁用模拟位置功能')
}

// 选择模拟位置
const selectMockLocation = (index) => {
  const success = locationStore.setMockLocation(index)
  if (success) {
    const loc = locationStore.mockLocationList[index]
    addLog(`切换到模拟位置: ${loc.name} [${loc.longitude}, ${loc.latitude}]`, 'info')
    showToast(`已切换到 ${loc.name}`)
  }
}

// 检查是否为当前模拟位置
const isCurrentMockLocation = (index) => {
  if (!locationStore.currentLocation?.isMock || !locationStore.currentMockLocation) {
    return false
  }
  const loc = locationStore.mockLocationList[index]
  return loc.name === locationStore.currentMockLocation.name
}

// 初始化检查位置支持
checkLocationSupport()

// 组件卸载时清理
onUnmounted(() => {
  if (isWatching.value) {
    stopWatching()
  }
})
</script>

<style scoped>
.test-location-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  color: #333;
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
}

h2, h3, h4 {
  color: #555;
  margin-top: 20px;
}

h2 {
  font-size: 20px;
}

h3 {
  font-size: 18px;
  color: #555;
  margin-bottom: 15px;
}

h4 {
  font-size: 16px;
  color: #666;
  margin-top: 15px;
  margin-bottom: 10px;
}

/* 状态卡片 */
.status-card {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.status-success { border-color: #4caf50; box-shadow: 0 2px 8px rgba(76, 175, 80, 0.1); }
.status-warning { border-color: #ff9800; box-shadow: 0 2px 8px rgba(255, 152, 0, 0.1); }
.status-error { border-color: #f44336; box-shadow: 0 2px 8px rgba(244, 67, 54, 0.1); }
.status-info { border-color: #2196f3; box-shadow: 0 2px 8px rgba(33, 150, 243, 0.1); }
.status-pending { border-color: #9e9e9e; box-shadow: 0 2px 8px rgba(158, 158, 158, 0.1); }
.status-loading { border-color: #2196f3; box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2); }

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.status-header h2 {
  margin: 0;
  font-size: 18px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.status-success { background: #e8f5e9; color: #4caf50; }
.status-badge.status-warning { background: #fff8e1; color: #ff9800; }
.status-badge.status-error { background: #ffebee; color: #f44336; }
.status-badge.status-info { background: #e3f2fd; color: #2196f3; }
.status-badge.status-pending { background: #f5f5f5; color: #757575; }
.status-badge.status-loading { background: #e3f2fd; color: #2196f3; }

/* 位置信息 */
.location-info {
  margin-top: 10px;
}

.location-main {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 15px;
}

.location-coords {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.coord-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.coord-label, .location-accuracy .accuracy-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  font-weight: 500;
}

.coord-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  font-family: monospace;
}

.location-accuracy {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.accuracy-value {
  font-size: 16px;
  font-weight: 600;
}

.accuracy-level {
  font-size: 12px;
  margin-left: 5px;
  font-weight: normal;
}

.accuracy-high { color: #4caf50; }
.accuracy-medium { color: #ff9800; }
.accuracy-low { color: #f44336; }

.location-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 10px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.meta-label {
  color: #666;
  font-size: 12px;
  text-transform: uppercase;
  font-weight: 500;
}

.meta-value {
  font-weight: 500;
  color: #333;
}

.type-badge {
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.type-default { background: #fff8e1; color: #ff9800; }
.type-mock { background: #e3f2fd; color: #2196f3; }
.type-real { background: #e8f5e9; color: #4caf50; }

.cache-badge {
  background: #f5f5f5; 
  color: #757575;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
}

/* 加载和未获取状态 */
.location-loading, .no-location {
  padding: 30px 0;
  text-align: center;
  color: #757575;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #2196f3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 16px;
  color: #616161;
}

/* 错误信息 */
.error-info {
  background: #ffebee;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #ffcdd2;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.1);
}

.error-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.error-header h3 {
  margin: 0;
  color: #c62828;
  font-size: 16px;
  font-weight: 600;
}

.error-code {
  font-size: 12px;
  color: #e57373;
  font-weight: normal;
}

.clear-error-btn {
  background: none;
  border: 1px solid #e57373;
  color: #c62828;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-error-btn:hover {
  background: #c62828;
  color: white;
  border-color: #c62828;
}

.error-message {
  color: #b71c1c;
  font-weight: 500;
  margin-bottom: 10px;
  font-size: 15px;
  line-height: 1.6;
}

.suggestion {
  color: #7f0000;
  font-size: 14px;
  margin-bottom: 10px;
  padding: 10px;
  background: rgba(229, 57, 53, 0.05);
  border-radius: 4px;
  border-left: 3px solid #c62828;
}

.detailed-error {
  color: #616161;
  font-size: 13px;
  font-style: italic;
  padding: 10px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  border-left: 3px solid #9e9e9e;
  margin-top: 10px;
  font-family: monospace;
  word-break: break-all;
}

/* 错误恢复建议 */
.error-recovery {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #ffcdd2;
}

.error-recovery h4 {
  margin-top: 0;
  color: #c62828;
}

.error-recovery ul {
  padding-left: 20px;
}

.error-recovery li {
  margin-bottom: 10px;
  color: #616161;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.recovery-btn {
  padding: 4px 12px;
  font-size: 12px;
  background: #c62828;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.recovery-btn:hover {
  background: #b71c1c;
}

/* 操作按钮 */
.test-actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 25px;
}

.action-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.action-group.primary {
  margin-bottom: 5px;
}

button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
  min-height: 48px;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-icon {
  font-size: 16px;
}

.btn-primary {
  background-color: #1976d2;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1565c0;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(25, 118, 210, 0.3);
}

.btn-secondary {
  background-color: #66bb6a;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #43a047;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(102, 187, 106, 0.3);
}

.btn-danger {
  background-color: #f44336;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #d32f2f;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(244, 67, 54, 0.3);
}

.btn-outline {
  background-color: transparent;
  border: 1px solid #e0e0e0;
  color: #616161;
  box-shadow: none;
}

.btn-outline:hover:not(:disabled) {
  background-color: #f5f5f5;
  border-color: #9e9e9e;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* 调试信息 */
.debug-section {
  margin-top: 30px;
}

.debug-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
}

.debug-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 15px;
  margin-top: 10px;
}

.debug-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.debug-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  font-weight: 500;
}

.debug-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.permission-granted { color: #4caf50; }
.permission-denied { color: #f44336; }
.permission-prompt { color: #ff9800; }

.status-yes { color: #4caf50; }
.status-no { color: #f44336; }

/* 日志容器 */
.log-container {
  background: #2d3436;
  color: #dfe6e9;
  padding: 20px;
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.logs {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-item {
  font-family: monospace;
  font-size: 13px;
  padding: 8px 12px;
  border-radius: 4px;
  border-left: 3px solid #74b9ff;
  background: rgba(116, 185, 255, 0.1);
}

.log-item.log-error {
  border-left-color: #ff7675;
  background: rgba(255, 118, 117, 0.1);
  color: #ff7675;
}

.log-item.log-warning {
  border-left-color: #fdcb6e;
  background: rgba(253, 203, 110, 0.1);
  color: #fdcb6e;
}

.log-item.log-success {
  border-left-color: #00b894;
  background: rgba(0, 184, 148, 0.1);
  color: #00b894;
}

.log-item.log-info {
  border-left-color: #74b9ff;
  background: rgba(116, 185, 255, 0.1);
  color: #74b9ff;
}

/* 开发模式部分样式 */
.dev-mode-section {
  margin-top: 30px;
  padding: 20px;
  background: #f1f8e9;
  border-radius: 8px;
  border: 1px solid #c8e6c9;
}

.dev-controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.toggle-switch {
  margin: 10px 0;
}

.toggle-switch label,
.validation-config label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 500;
}

.mock-locations {
  margin-top: 10px;
}

.location-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.location-buttons button {
  background: #90caf9;
  color: #0d47a1;
  min-height: auto;
  padding: 8px 16px;
}

.location-buttons button:hover {
  background: #64b5f6;
}

.location-buttons button.active {
  background: #1976d2;
  color: white;
}

.validation-config {
  margin-top: 10px;
}

.config-details {
  margin-top: 10px;
  padding: 10px;
  background: #e3f2fd;
  border-radius: 4px;
  font-size: 14px;
}

.config-details p {
  margin: 5px 0;
  font-family: monospace;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .test-location-container {
    padding: 15px;
  }
  
  .location-coords {
    flex-direction: column;
    gap: 15px;
  }
  
  .location-meta {
    flex-direction: column;
    gap: 12px;
  }
  
  .action-group {
    flex-direction: column;
  }
  
  button {
    width: 100%;
  }
  
  .debug-grid {
    grid-template-columns: 1fr;
  }
  
  .error-recovery li {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .recovery-btn {
    align-self: flex-start;
  }
  
  .location-buttons button {
    width: calc(50% - 5px);
  }
}

@media (max-width: 480px) {
  .status-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .error-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .clear-error-btn {
    align-self: flex-start;
  }
  
  .location-actions {
    gap: 10px;
  }
}
</style>