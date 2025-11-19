<template>
  <div class="home-view">
    <!-- 顶部搜索栏 -->
    <div class="search-bar">
      <van-search
        v-model="searchKeyword"
        placeholder="搜索校园地点或活动"
        show-action
        @search="onSearch"
      >
        <template #action>
          <span @click="onSearch">搜索</span>
        </template>
      </van-search>
    </div>
    
    <!-- 地图容器 -->
    <div id="map-container" ref="mapContainer" class="map-container">
      <div v-if="mapLoading" class="map-loading">
        <van-loading type="spinner" color="#1989fa" size="24px" />
        <span style="margin-top: 10px;">正在加载校园地图...</span>
      </div>
      
      <!-- 位置权限引导界面 -->
      <div v-if="showLocationGuide" class="location-guide">
        <div class="guide-content">
          <van-icon name="location-o" size="48" color="#1989fa" />
          <h3>开启位置服务</h3>
          <p>获取您的位置信息，为您提供更好的校园服务：</p>
          <ul>
            <li>• 校园内精确定位</li>
            <li>• 周边建筑物导航</li>
            <li>• 附近活动推荐</li>
            <li>• 个性化校园服务</li>
          </ul>
          <div class="guide-actions">
            <van-button type="default" @click="denyLocationPermission">暂不开启</van-button>
            <van-button type="primary" @click="requestLocationPermission">立即开启</van-button>
          </div>
        </div>
      </div>
      
      <!-- 位置状态提示 -->
      <div v-if="locationStatus && !showLocationGuide" class="location-status" :class="locationStatus.type">
        <van-icon :name="locationStatus.icon" />
        <span>{{ locationStatus.message }}</span>
        <van-icon v-if="locationStatus.action" :name="locationStatus.actionIcon" @click="locationStatus.action" />
      </div>
      
      <!-- 地图控制按钮 -->
      <div v-if="!mapLoading" class="map-controls">
        <div class="control-btn" @click="moveToCampusCenter" title="校园中心">
          <van-icon name="home-o" size="18" />
        </div>
        <div class="control-btn" @click="getPreciseLocation" title="我的位置">
          <van-icon name="location" size="18" :color="userLocation ? '#1989fa' : ''" />
        </div>
        <div class="control-btn" @click="getPreciseLocation(true)" title="快速定位">
          <van-icon name="flash" size="18" color="#ff6b6b" />
        </div>
        <div class="control-btn" @click="showLocationCalibration" title="位置校准">
          <van-icon name="aim" size="18" color="#07c160" />
        </div>
        <div class="control-btn" @click="toggleLabels" :title="showLabels ? '隐藏标签' : '显示标签'">
          <van-icon :name="showLabels ? 'eye' : 'eye-o'" size="18" />
        </div>
        <div class="control-btn" @click="zoomIn" title="放大">
          <van-icon name="plus" size="18" />
        </div>
        <div class="control-btn" @click="zoomOut" title="缩小">
          <van-icon name="minus" size="18" />
        </div>
      </div>
    </div>

    <!-- 位置权限被拒绝提示 -->
    <van-dialog 
      v-model:show="showPermissionDenied" 
      title="位置权限被拒绝" 
      show-cancel-button 
      confirm-button-text="重新授权"
      cancel-button-text="稍后再说"
      @confirm="retryLocationPermission"
      @cancel="closePermissionDenied"
    >
      <div style="padding: 20px; text-align: center;">
        <van-icon name="warning-o" size="48" color="#ff6b6b" />
        <p style="margin: 16px 0; color: #666;">
          您拒绝了位置权限，将无法使用以下功能：
        </p>
        <ul style="text-align: left; color: #666; margin: 0 0 16px 0;">
          <li>• 查看您在校园中的实时位置</li>
          <li>• 显示您附近的活动和建筑物</li>
          <li>• 提供基于位置的路线导航</li>
          <li>• 个性化的校园服务推荐</li>
        </ul>
      </div>
    </van-dialog>

    <!-- 手动校准面板 -->
    <van-popup v-model:show="showCalibrationPanel" position="bottom" round>
      <div class="calibration-panel">
        <h3>位置校准</h3>
        <p>如果自动定位不准确，请选择您当前所在的建筑物：</p>
        
        <van-search
          v-model="buildingSearch"
          placeholder="搜索建筑物..."
          style="margin-bottom: 16px;"
        />
        
        <div class="building-list">
          <div 
            v-for="building in filteredBuildings" 
            :key="building.id"
            class="building-item"
            @click="selectBuilding(building)"
          >
            <div class="building-marker" :style="{ background: getBuildingColor(building.type) }">
              {{ building.name.charAt(0) }}
            </div>
            <div class="building-info">
              <div class="building-name">{{ building.name }}</div>
              <div class="building-type">{{ getBuildingTypeName(building.type) }}</div>
            </div>
            <van-icon name="arrow" size="16" color="#ccc" />
          </div>
        </div>
        
        <div class="calibration-actions">
          <van-button type="default" @click="showCalibrationPanel = false">取消</van-button>
          <van-button type="primary" @click="useCampusCenter">使用校园中心</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 建筑物信息弹窗 -->
    <van-popup v-model:show="showBuildingInfo" position="bottom" round>
      <div class="building-info-popup" v-if="selectedBuilding">
        <div class="building-header">
          <div class="building-marker-large" :style="{ background: getBuildingColor(selectedBuilding.type) }">
            {{ selectedBuilding.name.charAt(0) }}
          </div>
          <div class="building-title">
            <h3>{{ selectedBuilding.name }}</h3>
            <span class="building-type">{{ getBuildingTypeName(selectedBuilding.type) }}</span>
          </div>
        </div>
        <div class="building-details">
          <div class="detail-item">
            <van-icon name="location-o" />
            <span>{{ selectedBuilding.address || '广东药科大学云浮校区' }}</span>
          </div>
          <div class="detail-item">
            <van-icon name="clock-o" />
            <span>开放时间: 07:00 - 22:00</span>
          </div>
        </div>
        <div class="building-actions">
          <van-button type="default" @click="showBuildingInfo = false">关闭</van-button>
          <van-button type="primary" @click="navigateToBuilding(selectedBuilding)">导航到此</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 调试信息 -->
    <div class="debug-panel">
      <div class="debug-item">
        <span>权限状态:</span>
        <van-tag :type="permissionTagType">{{ permissionStatus }}</van-tag>
      </div>
      <div class="debug-item">
        <span>建筑物:</span>
        <van-tag type="primary">{{ buildingMarkers.length }}</van-tag>
      </div>
      <div class="debug-item">
        <span>位置:</span>
        <van-tag :type="userLocation ? 'success' : 'warning'">{{ userLocation ? '已获取' : '未获取' }}</van-tag>
      </div>
      <div class="debug-item">
    <button @click="clearLocationCache" style="font-size: 14px; padding: 8px 12px; background: #ff4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 8px rgba(255,68,68,0.3);">
      🗑️ 清除缓存
    </button>
    <button @click="debugRawLocation" style="font-size: 14px; padding: 8px 12px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 8px rgba(33,150,243,0.3); margin-left: 8px;">
      🎯 获取原始GPS
    </button>
    <button @click="compareLocationSources" style="font-size: 14px; padding: 8px 12px; background: #FF9800; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 8px rgba(255,152,0,0.3); margin-left: 8px;">
      🔍 对比定位源
    </button>
  </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { showToast, showDialog } from 'vant'
import { useRouter } from 'vue-router'
import { 
  mapConfig, 
  campusCenter, 
  campusBuildings, 
  getPersonalizedActivities 
} from '@/config/map'
import { 
  getCurrentLocation,
  smartLocationCalibration,
  calculateDistance,
  clearCachedLocation
} from '@/utils/location'

const router = useRouter()

// 响应式数据
const searchKeyword = ref('')
const activities = ref([])
const map = ref(null)
const mapContainer = ref(null)
const mapLoading = ref(true)

// 位置权限相关
const locationPermissionGranted = ref(false)
const locationPermissionRequested = ref(false)
const showLocationGuide = ref(false)
const showPermissionDenied = ref(false)

// 位置相关
const userLocation = ref(null)
const userLocationMarker = ref(null)
const locationAccuracy = ref(null)
const locationError = ref(null)
const isLocating = ref(false)
const showCalibrationPanel = ref(false)
const buildingSearch = ref('')

// 建筑物显示相关
const buildingMarkers = ref([])
const buildingLabels = ref([])
const showLabels = ref(true)
const selectedBuilding = ref(null)
const showBuildingInfo = ref(false)

// 计算属性
const permissionStatus = computed(() => {
  if (locationPermissionGranted.value) return '已授权'
  if (showPermissionDenied.value) return '已拒绝'
  if (locationPermissionRequested.value) return '请求中'
  return '未请求'
})

const permissionTagType = computed(() => {
  if (locationPermissionGranted.value) return 'success'
  if (showPermissionDenied.value) return 'danger'
  return 'warning'
})

const locationStatus = computed(() => {
  if (!locationPermissionGranted.value) {
    return {
      type: 'warning',
      icon: 'location-o',
      message: '位置服务未开启',
      action: () => showLocationGuide.value = true,
      actionIcon: 'setting-o'
    }
  }
  if (isLocating.value) {
    return {
      type: 'locating',
      icon: 'location',
      message: '正在获取位置...'
    }
  }
  if (locationError.value) {
    return {
      type: 'error',
      icon: 'warning',
      message: locationError.value,
      action: () => getPreciseLocation(),
      actionIcon: 'replay'
    }
  }
  if (userLocation.value) {
    return {
      type: 'success',
      icon: 'success',
      message: '位置服务已开启'
    }
  }
  return null
})

const filteredBuildings = computed(() => {
  const buildings = Object.keys(campusBuildings).map(key => ({
    id: key,
    ...campusBuildings[key]
  }))
  
  if (!buildingSearch.value.trim()) {
    return buildings.slice(0, 10)
  }
  
  const searchTerm = buildingSearch.value.toLowerCase()
  return buildings.filter(building => 
    building.name.toLowerCase().includes(searchTerm) ||
    building.type.toLowerCase().includes(searchTerm)
  ).slice(0, 10)
})

// 选择建筑物进行校准
const selectBuilding = (building) => {
  console.log('🎯 手动选择建筑物:', building.name)
  
  // 清除位置缓存，避免手动校准位置影响后续GPS定位
  if (typeof clearCachedLocation === 'function') {
    clearCachedLocation()
    console.log('🗑️ 已清除位置缓存，避免手动校准影响GPS定位')
  }
  
  // 设置用户位置为建筑物坐标
  userLocation.value = {
    coords: {
      latitude: building.coords[1],
      longitude: building.coords[0]
    },
    accuracy: 10, // 手动选择时设为高精度
    source: 'manual_calibration',
    building: building.id
  }
  
  // 更新位置状态
  locationStatus.value = {
    type: 'success',
    message: `已校准到: ${building.name}`,
    icon: 'location'
  }
  
  // 关闭校准面板
  showCalibrationPanel.value = false
  
  // 更新地图上的用户位置标记
  addUserLocationMarker()
  
  // 跳转到选定位置
  if (map.value) {
    map.value.setZoomAndCenter(18, building.coords)
  }
  
  showToast(`✅ 位置已校准到 ${building.name}`)
}

// 使用校园中心作为位置
const useCampusCenter = () => {
  console.log('🏫 使用校园中心')
  
  // 清除位置缓存，避免校园中心位置影响后续GPS定位
  if (typeof clearCachedLocation === 'function') {
    clearCachedLocation()
    console.log('🗑️ 已清除位置缓存，避免校园中心影响GPS定位')
  }
  
  userLocation.value = {
    coords: {
      latitude: campusCenter[1],
      longitude: campusCenter[0]
    },
    accuracy: 50,
    source: 'campus_center'
  }
  
  locationStatus.value = {
    type: 'info',
    message: '已使用校园中心位置',
    icon: 'home-o'
  }
  
  showCalibrationPanel.value = false
  
  // 更新地图上的用户位置标记
  addUserLocationMarker()
  
  if (map.value) {
    map.value.setZoomAndCenter(16, campusCenter)
  }
  
  showToast('已使用校园中心位置')
}

// 显示位置校准面板
const showLocationCalibration = () => {
  showCalibrationPanel.value = true
  buildingSearch.value = ''
}

// 优化定位精度 - 添加智能校准
const enhanceLocationAccuracy = () => {
  if (!userLocation.value) {
    showToast('请先获取位置信息')
    return
  }
  
  const accuracy = userLocation.value.accuracy || 100
  
  if (accuracy > 50) {
    // 定位精度较差，建议校准
    showDialog({
      title: '定位精度优化',
      message: `当前定位精度约为 ${Math.round(accuracy)}米，建议进行位置校准以获得更准确的服务。`,
      confirmButtonText: '立即校准',
      cancelButtonText: '继续使用'
    }).then(() => {
      showLocationCalibration()
    }).catch(() => {
      showToast('您可以在设置中随时进行位置校准')
    })
  } else if (accuracy > 20) {
    // 定位精度一般，提供校准选项
    showDialog({
      title: '定位精度',
      message: `当前定位精度约为 ${Math.round(accuracy)}米，如需更精确定位可手动校准。`,
      confirmButtonText: '手动校准',
      cancelButtonText: '保持现状'
    }).then(() => {
      showLocationCalibration()
    }).catch(() => {
      showToast('定位精度可满足基本使用需求')
    })
  } else {
    showToast('当前定位精度良好')
  }
}

// 清除位置缓存
  const clearLocationCache = () => {
    try {
      clearCachedLocation()
      userLocation.value = null
      console.log('🗑️ 位置缓存已清除')
      console.log('🔍 当前缓存状态:', localStorage.getItem('user_location_cache'))
      showToast('位置缓存已清除，请重新定位')
    } catch (error) {
      console.error('❌ 清除缓存失败:', error)
      showToast('清除缓存失败', 'error')
    }
  }

  // 调试：获取原始GPS位置
  const debugRawLocation = () => {
    if (!navigator.geolocation) {
      showToast('浏览器不支持定位', 'error')
      return
    }

    console.log('🔍 开始获取原始GPS位置...')
    showToast('正在获取原始GPS位置...', 'info')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        const rawCoords = [longitude, latitude]
        
        console.log('🎯 原始GPS位置:', {
          latitude,
          longitude,
          accuracy,
          formatted: `[${longitude}, ${latitude}]`,
          accuracyMeters: `${accuracy}米`
        })

        // 计算到3栋宿舍的距离
        const dorm3Location = [112.181769, 23.031784]
        const distanceToDorm3 = calculateDistance(
          latitude,
          longitude,
          23.031784, // 3栋宿舍纬度
          112.181769  // 3栋宿舍经度
        )
        
        // 计算到图书馆的距离
        const libraryLocation = [112.178947, 23.032271]
        const distanceToLibrary = calculateDistance(
          latitude,
          longitude,
          23.032271, // 图书馆纬度
          112.178947  // 图书馆经度
        )

        console.log(`📏 到3栋宿舍距离: ${distanceToDorm3.toFixed(2)}米`)
        console.log(`📚 到图书馆距离: ${distanceToLibrary.toFixed(2)}米`)
        
        // 判断位置
        let locationMessage = ''
        if (distanceToDorm3 < 30) {
          console.log('🏠 您确实在3栋宿舍附近（30米内）')
          locationMessage = `您在3栋宿舍附近 (${distanceToDorm3.toFixed(1)}米)`
        } else if (distanceToLibrary < 50) {
          console.log('📚 您在图书馆附近（50米内）')
          locationMessage = `您在图书馆附近 (${distanceToLibrary.toFixed(1)}米)`
        } else {
          console.log('🤔 您不在3栋宿舍或图书馆附近')
          locationMessage = `未知位置 - 距3栋${distanceToDorm3.toFixed(1)}米, 距图书馆${distanceToLibrary.toFixed(1)}米`
        }
        
        // 显示详细的位置信息
        showToast(`GPS获取成功！${locationMessage}`, 'success')
        
        // 显示更详细的分析
        console.log('🔍 详细位置分析:')
        console.log(`   - 纬度: ${position.coords.latitude}`)
        console.log(`   - 经度: ${position.coords.longitude}`)
        console.log(`   - 精度: ${position.coords.accuracy}米`)
        console.log(`   - 海拔: ${position.coords.altitude || '未知'}`)
        console.log(`   - 速度: ${position.coords.speed || '未知'}`)
        console.log(`   - 时间戳: ${new Date(position.timestamp).toLocaleString()}`)
      },
      (error) => {
        // 改进的 GeolocationPositionError 处理
        const errorMessage = error && typeof error === 'object' ? 
          `${error.name || 'GeolocationPositionError'} (${error.code}): ${error.message}` : 
          String(error)
        console.error('❌ 获取原始GPS位置失败:', errorMessage)
        
        // 根据错误类型提供更详细的用户提示
        let userMessage = '获取GPS失败'
        if (error && error.code === 1) {
          userMessage = '位置权限被拒绝，请在浏览器设置中允许位置访问'
          console.error('  → 用户拒绝了位置权限')
        } else if (error && error.code === 2) {
          userMessage = '位置信息不可用，请检查GPS是否开启'
          console.error('  → 位置信息不可用（GPS信号弱或关闭）')
        } else if (error && error.code === 3) {
          userMessage = '获取位置超时，请重试'
          console.error('  → 获取位置超时')
        }
        
        showToast(userMessage, 'error')
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    )
  }

// 对比不同定位源
const compareLocationSources = async () => {
  console.log('🔍 开始对比不同定位源...')
  
  try {
    // 1. 获取高精度GPS
    console.log('📡 1. 获取高精度GPS...')
    const highAccuracyPosition = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        (error) => {
          // 改进的 GeolocationPositionError 处理
          const errorMessage = error && typeof error === 'object' ? 
            `${error.name || 'GeolocationPositionError'} (${error.code}): ${error.message}` : 
            String(error)
          console.warn('高精度GPS获取失败:', errorMessage)
          
          // 根据错误类型提供更详细的日志
          if (error && error.code === 1) {
            console.warn('  → 用户拒绝了位置权限')
          } else if (error && error.code === 2) {
            console.warn('  → 位置信息不可用（GPS信号弱或关闭）')
          } else if (error && error.code === 3) {
            console.warn('  → 获取位置超时')
          }
          
          resolve(null)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    })
    
    // 2. 获取低精度GPS（快速定位）
    console.log('📡 2. 获取低精度GPS...')
    const lowAccuracyPosition = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        (error) => {
          // 改进的 GeolocationPositionError 处理
          const errorMessage = error && typeof error === 'object' ? 
            `${error.name || 'GeolocationPositionError'} (${error.code}): ${error.message}` : 
            String(error)
          console.warn('低精度GPS获取失败:', errorMessage)
          
          // 根据错误类型提供更详细的日志
          if (error && error.code === 1) {
            console.warn('  → 用户拒绝了位置权限')
          } else if (error && error.code === 2) {
            console.warn('  → 位置信息不可用（GPS信号弱或关闭）')
          } else if (error && error.code === 3) {
            console.warn('  → 获取位置超时')
          }
          
          resolve(null)
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 60000 // 允许使用1分钟内的缓存
        }
      )
    })
    
    // 3. 使用系统当前定位（模拟应用正常获取）
    console.log('📡 3. 获取应用当前定位...')
    let currentLocation = null
    try {
      currentLocation = await getCurrentLocation()
      console.log('✅ 应用当前定位获取成功:', currentLocation)
    } catch (error) {
      console.warn('❌ 应用当前定位获取失败:', error)
      currentLocation = null
    }
    
    // 调试：打印获取到的原始数据
    console.log('🔍 原始定位数据调试:')
    console.log('highAccuracyPosition:', highAccuracyPosition)
    console.log('lowAccuracyPosition:', lowAccuracyPosition)
    console.log('currentLocation:', currentLocation)
    
    // 分析结果 - 安全处理空值
    const results = {
      highAccuracy: highAccuracyPosition && highAccuracyPosition.coords ? {
        coords: [highAccuracyPosition.coords.longitude, highAccuracyPosition.coords.latitude],
        accuracy: highAccuracyPosition.coords.accuracy,
        source: '高精度GPS'
      } : null,
      lowAccuracy: lowAccuracyPosition && lowAccuracyPosition.coords ? {
        coords: [lowAccuracyPosition.coords.longitude, lowAccuracyPosition.coords.latitude],
        accuracy: lowAccuracyPosition.coords.accuracy,
        source: '低精度GPS'
      } : null,
      currentApp: currentLocation && currentLocation.coords ? {
        coords: [currentLocation.coords.longitude, currentLocation.coords.latitude],
        accuracy: currentLocation.coords.accuracy,
        source: '应用当前定位'
      } : null
    }
    
    // 计算到各建筑物的距离
    const locations = {
      dorm3: { name: '3栋宿舍', coords: [112.181769, 23.031784] },
      library: { name: '图书馆', coords: [112.178947, 23.032271] },
      teaching1: { name: '第一教学楼', coords: [112.179847, 23.032371] }
    }
    
    console.log('📊 定位源对比结果:')
    console.log('=' .repeat(50))
    
    Object.entries(results).forEach(([key, result]) => {
      if (result && result.coords) {
        console.log(`\n🔸 ${result.source}:`)
        console.log(`   坐标: [${result.coords[0].toFixed(6)}, ${result.coords[1].toFixed(6)}]`)
        console.log(`   精度: ${result.accuracy}米`)
        
        // 计算到各建筑物的距离
        Object.entries(locations).forEach(([locKey, loc]) => {
          const distance = calculateDistance(
            result.coords[1], result.coords[0],
            loc.coords[1], loc.coords[0]
          )
          console.log(`   距${loc.name}: ${distance.toFixed(1)}米`)
        })
        
        // 位置判断
        if (result.coords && locations.dorm3.coords) {
          const distanceToDorm3 = calculateDistance(
            result.coords[1], result.coords[0],
            locations.dorm3.coords[1], locations.dorm3.coords[0]
          )
          const distanceToLibrary = calculateDistance(
            result.coords[1], result.coords[0],
            locations.library.coords[1], locations.library.coords[0]
          )
          
          if (distanceToDorm3 < 30) {
            console.log(`   📍 判断：在3栋宿舍附近（${distanceToDorm3.toFixed(1)}米）`)
          } else if (distanceToLibrary < 50) {
            console.log(`   📍 判断：在图书馆附近（${distanceToLibrary.toFixed(1)}米）`)
          } else {
            console.log(`   📍 判断：不在主要建筑物附近`)
          }
        }
      } else {
        const sourceName = key === 'highAccuracy' ? '高精度GPS' : 
                          key === 'lowAccuracy' ? '低精度GPS' : '应用当前定位'
        console.log(`\n❌ ${sourceName}: 获取失败`)
      }
    })
    
    // 检查定位源一致性
    console.log('\n🔍 一致性分析:')
    if (results.highAccuracy && results.lowAccuracy && 
        results.highAccuracy.coords && results.lowAccuracy.coords) {
      const diff = calculateDistance(
        results.highAccuracy.coords[1], results.highAccuracy.coords[0],
        results.lowAccuracy.coords[1], results.lowAccuracy.coords[0]
      )
      console.log(`   高精度与低精度差异: ${diff.toFixed(1)}米`)
      
      if (diff < 50) {
        console.log('   ✅ 定位源基本一致')
      } else {
        console.log('   ⚠️ 定位源差异较大，可能存在信号干扰')
      }
    } else {
      console.log('   ⚠️ 定位源不完整，无法进行一致性分析')
    }
    
    // 推测最可能的位置
    console.log('\n🎯 位置推测:')
    Object.entries(locations).forEach(([locKey, loc]) => {
      let totalDistance = 0
      let validSources = 0
      
      Object.values(results).forEach(result => {
        if (result && result.coords) {
          totalDistance += calculateDistance(
            result.coords[1], result.coords[0],
            loc.coords[1], loc.coords[0]
          )
          validSources++
        }
      })
      
      if (validSources > 0) {
        const avgDistance = totalDistance / validSources
        console.log(`   ${loc.name}: 平均距离 ${avgDistance.toFixed(1)}米`)
        
        if (avgDistance < 30) {
          console.log(`   🏠 最可能在${loc.name}附近！`)
        }
      }
    })
    
    showToast('定位源对比完成，请查看控制台详细分析', 'success')
    
  } catch (error) {
    console.error('❌ 定位源对比失败:', error)
    showToast('定位源对比失败: ' + error.message, 'error')
  }
}

// 监听权限状态变化
watch(locationPermissionGranted, (newVal) => {
  if (newVal) {
    showLocationGuide.value = false
    // 授权后立即获取位置
    setTimeout(() => {
      getPreciseLocation()
    }, 500)
  }
})

// 搜索处理 - 增强版
const onSearch = () => {
  const keyword = searchKeyword.value.trim()
  if (!keyword) {
    showToast('请输入搜索关键词')
    return
  }

  console.log('🔍 搜索关键词:', keyword)
  
  // 搜索活动
  const matchedActivities = searchActivities(keyword)
  
  // 搜索建筑物
  const matchedBuildings = searchBuildings(keyword)
  
  if (matchedActivities.length > 0) {
    // 优先显示活动搜索结果
    showSearchResults(keyword, matchedActivities, matchedBuildings)
  } else if (matchedBuildings.length > 0) {
    // 只搜索到建筑物
    showBuildingSearchResults(matchedBuildings)
  } else {
    showToast(`未找到"${keyword}"相关的活动或地点`)
  }
}

// 搜索活动
const searchActivities = (keyword) => {
  if (!activities.value || activities.value.length === 0) {
    return []
  }
  
  const lowerKeyword = keyword.toLowerCase()
  return activities.value.filter(activity => 
    activity.title.toLowerCase().includes(lowerKeyword) ||
    activity.description.toLowerCase().includes(lowerKeyword) ||
    activity.type.toLowerCase().includes(lowerKeyword)
  )
}

// 搜索建筑物
const searchBuildings = (keyword) => {
  const lowerKeyword = keyword.toLowerCase()
  return Object.values(campusBuildings).filter(building =>
    building.name.toLowerCase().includes(lowerKeyword) ||
    building.type.toLowerCase().includes(lowerKeyword) ||
    (building.address && building.address.toLowerCase().includes(lowerKeyword))
  )
}

// 显示搜索结果
const showSearchResults = (keyword, activities, buildings) => {
  const resultCount = activities.length + buildings.length
  let message = `找到 ${resultCount} 个结果:\n\n`
  
  if (activities.length > 0) {
    message += `📅 活动 (${activities.length}):\n`
    activities.slice(0, 3).forEach((activity, index) => {
      message += `${index + 1}. ${activity.title}\n`
    })
    if (activities.length > 3) {
      message += `...还有${activities.length - 3}个活动\n`
    }
    message += '\n'
  }
  
  if (buildings.length > 0) {
    message += `🏢 地点 (${buildings.length}):\n`
    buildings.slice(0, 3).forEach((building, index) => {
      message += `${index + 1}. ${building.name}\n`
    })
    if (buildings.length > 3) {
      message += `...还有${buildings.length - 3}个地点\n`
    }
  }
  
  // 显示结果并跳转到第一个活动
  showDialog({
    title: `搜索结果: "${keyword}"`,
    message: message,
    confirmButtonText: '查看第一个活动',
    cancelButtonText: '关闭'
  }).then(() => {
    if (activities.length > 0) {
      navigateToActivity(activities[0])
    } else if (buildings.length > 0) {
      navigateToBuilding(buildings[0])
    }
  }).catch(() => {
    // 用户取消，不做任何操作
  })
}

// 显示建筑物搜索结果
const showBuildingSearchResults = (buildings) => {
  let message = `找到 ${buildings.length} 个地点:\n\n`
  buildings.slice(0, 5).forEach((building, index) => {
    message += `${index + 1}. ${building.name} (${getBuildingTypeName(building.type)})\n`
  })
  
  showDialog({
    title: '搜索结果',
    message: message,
    confirmButtonText: '查看第一个地点',
    cancelButtonText: '关闭'
  }).then(() => {
    navigateToBuilding(buildings[0])
  }).catch(() => {
    // 用户取消，不做任何操作
  })
}

// 跳转到活动位置
const navigateToActivity = (activity) => {
  if (!map.value || !activity.building) {
    showToast('活动位置信息不完整')
    return
  }
  
  const building = campusBuildings[activity.building]
  if (!building?.coords) {
    showToast('活动地点坐标不完整')
    return
  }
  
  const [lng, lat] = building.coords
  
  // 跳转到活动位置
  map.value.setZoomAndCenter(18, [lng, lat])
  
  // 显示活动信息
  setTimeout(() => {
    showToast(`📍 ${activity.title}\n🏢 ${building.name}`)
  }, 500)
  
  // 高亮显示活动标记
  highlightActivityMarker(activity)
}

// 跳转到建筑物位置
const navigateToBuilding = (building) => {
  if (!map.value || !building.coords) {
    showToast('建筑物位置信息不完整')
    return
  }
  
  const [lng, lat] = building.coords
  
  // 跳转到建筑物位置
  map.value.setZoomAndCenter(18, [lng, lat])
  
  // 显示建筑物信息
  setTimeout(() => {
    showToast(`🏢 ${building.name}\n📍 ${getBuildingTypeName(building.type)}`)
  }, 500)
  
  // 高亮显示建筑物标记
  highlightBuildingMarker(building)
}

// 高亮显示活动标记
const highlightActivityMarker = (activity) => {
  // 这里可以实现活动标记的高亮效果
  // 例如：改变标记颜色、添加动画效果等
  console.log('🎯 高亮活动:', activity.title)
}

// 高亮显示建筑物标记
const highlightBuildingMarker = (building) => {
  // 这里可以实现建筑物标记的高亮效果
  console.log('🎯 高亮建筑物:', building.name)
}

// 检查位置权限状态
const checkLocationPermission = async () => {
  if (!navigator.geolocation) {
    showToast('您的浏览器不支持定位功能')
    return false
  }

  // 使用 Permissions API 检查权限状态
  if (navigator.permissions && navigator.permissions.query) {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' })
      
      console.log('📍 位置权限状态:', permissionStatus.state)
      
      switch (permissionStatus.state) {
        case 'granted':
          locationPermissionGranted.value = true
          return true
        case 'denied':
          locationPermissionGranted.value = false
          showPermissionDenied.value = true
          return false
        case 'prompt':
          // 需要请求权限
          showLocationGuide.value = true
          return false
      }
      
      // 监听权限状态变化
      permissionStatus.onchange = () => {
        console.log('📍 位置权限状态变化:', permissionStatus.state)
        if (permissionStatus.state === 'granted') {
          locationPermissionGranted.value = true
          showPermissionDenied.value = false
          showLocationGuide.value = false
          getPreciseLocation()
        } else if (permissionStatus.state === 'denied') {
          locationPermissionGranted.value = false
          showPermissionDenied.value = true
        }
      }
      
    } catch (error) {
      console.warn('Permissions API 不支持:', error)
      // 如果不支持 Permissions API，显示引导界面
      showLocationGuide.value = true
      return false
    }
  } else {
    // 不支持 Permissions API 的浏览器
    showLocationGuide.value = true
    return false
  }
}

// 请求位置权限
const requestLocationPermission = () => {
  locationPermissionRequested.value = true
  showLocationGuide.value = false
  
  if (!navigator.geolocation) {
    showToast('您的浏览器不支持定位功能')
    return
  }

  showToast('请求位置权限中...')

  // 使用高德地图的定位功能请求权限
  if (map.value && window.AMap) {
    map.value.plugin('AMap.Geolocation', () => {
      const geolocation = new AMap.Geolocation({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      })

      geolocation.getCurrentPosition((status, result) => {
        if (status === 'complete') {
          locationPermissionGranted.value = true
          onLocationSuccess(result)
          showToast('位置权限获取成功')
        } else {
          locationPermissionGranted.value = false
          showPermissionDenied.value = true
          onLocationError(result)
        }
      })
    })
  } else {
    // 备用方案：使用浏览器原生定位
    navigator.geolocation.getCurrentPosition(
      (position) => {
        locationPermissionGranted.value = true
        const result = {
          position: {
            lng: position.coords.longitude,
            lat: position.coords.latitude
          },
          accuracy: position.coords.accuracy
        }
        onLocationSuccess(result)
        showToast('位置权限获取成功')
      },
      (error) => {
        locationPermissionGranted.value = false
        showPermissionDenied.value = true
        onLocationError(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }
}

// 拒绝位置权限
const denyLocationPermission = () => {
  showLocationGuide.value = false
  locationPermissionRequested.value = true
  locationPermissionGranted.value = false
  showToast('您拒绝了位置权限')
}

// 重新请求位置权限
const retryLocationPermission = () => {
  showPermissionDenied.value = false
  showLocationGuide.value = true
}

// 关闭权限拒绝提示
const closePermissionDenied = () => {
  showPermissionDenied.value = false
}

// 初始化地图
const initMap = async () => {
  try {
    await loadAMapScript()
    
    map.value = new AMap.Map(mapContainer.value, {
      zoom: 17,
      center: campusCenter,
      viewMode: '2D',
      mapStyle: 'amap://styles/fresh',
      resizeEnable: true,
    })

    map.value.on('complete', () => {
      mapLoading.value = false
      addBuildingMarkers()
      addActivityMarkers()
      
      // 检查位置权限
      setTimeout(() => {
        checkLocationPermission()
      }, 1000)
    })

  } catch (error) {
    console.error('地图初始化失败:', error)
    mapLoading.value = false
    showToast('地图加载失败')
  }
}

// 加载高德地图SDK
const loadAMapScript = () => {
  return new Promise((resolve, reject) => {
    if (window.AMap) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${mapConfig.amapKey}`
    script.async = true
    
    script.onload = () => setTimeout(() => resolve(), 100)
    script.onerror = reject
    document.head.appendChild(script)

    setTimeout(() => reject(new Error('加载超时')), 10000)
  })
}

// 添加建筑物标记 - 显示完整名称
const addBuildingMarkers = () => {
  if (!map.value) return

  clearBuildingMarkers()

  console.log('🏢 添加校园建筑物标记...')

  Object.keys(campusBuildings).forEach(key => {
    const building = campusBuildings[key]
    
    if (!building?.coords) return

    try {
      const [lng, lat] = building.coords
      
      // 1. 创建建筑物标记（图标）
      const marker = new AMap.Marker({
        position: [lng, lat],
        content: createBuildingMarker(building),
        offset: new AMap.Pixel(-20, -20),
        title: building.name,
        zIndex: 100
      })

      // 2. 创建建筑物标签（显示完整名称）
      const label = new AMap.Text({
        position: [lng, lat],
        text: building.name,
        offset: new AMap.Pixel(0, -45),
        style: {
          padding: '6px 12px',
          'background-color': 'rgba(255, 255, 255, 0.95)',
          'border': '2px solid ' + getBuildingColor(building.type),
          'border-radius': '20px',
          'color': '#333',
          'font-size': '12px',
          'font-weight': 'bold',
          'white-space': 'nowrap',
          'box-shadow': '0 2px 8px rgba(0,0,0,0.2)',
          'backdrop-filter': 'blur(10px)',
          'max-width': '200px',
          'text-overflow': 'ellipsis',
          'overflow': 'hidden'
        },
        zIndex: 101
      })

      // 点击建筑物标记的事件
      marker.on('click', () => {
        selectedBuilding.value = building
        showBuildingInfo.value = true
        map.value.setZoomAndCenter(18, [lng, lat])
      })

      // 点击标签的事件
      label.on('click', () => {
        selectedBuilding.value = building
        showBuildingInfo.value = true
        map.value.setZoomAndCenter(18, [lng, lat])
      })

      // 添加到地图
      map.value.add(marker)
      map.value.add(label)
      
      buildingMarkers.value.push(marker)
      buildingLabels.value.push(label)

    } catch (error) {
      console.error(`添加建筑物 ${building?.name} 失败:`, error)
    }
  })

  console.log(`✅ 建筑物标记添加完成: ${buildingMarkers.value.length} 个`)
}

// 创建建筑物标记图标
const createBuildingMarker = (building) => {
  const color = getBuildingColor(building.type)
  return `
    <div style="
      width: 40px; 
      height: 40px; 
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 16px;
      box-shadow: 0 3px 12px rgba(0,0,0,0.3);
      cursor: pointer;
      transition: all 0.3s;
    " onmouseover="this.style.transform='scale(1.1)'" 
       onmouseout="this.style.transform='scale(1)'"
       title="${building.name}">
      ${building.name.charAt(0)}
    </div>
  `
}

// 切换标签显示
const toggleLabels = () => {
  showLabels.value = !showLabels.value
  
  // 显示或隐藏所有标签
  buildingLabels.value.forEach(label => {
    if (showLabels.value) {
      label.show()
    } else {
      label.hide()
    }
  })
  
  showToast(showLabels.value ? '已显示建筑物名称' : '已隐藏建筑物名称')
}

// 清除建筑物标记
const clearBuildingMarkers = () => {
  if (map.value) {
    buildingMarkers.value.forEach(marker => map.value.remove(marker))
    buildingLabels.value.forEach(label => map.value.remove(label))
  }
  buildingMarkers.value = []
  buildingLabels.value = []
}

// 精确定位 - 使用优化后的定位策略
const getPreciseLocation = async () => {
  if (!map.value || !locationPermissionGranted.value) {
    showLocationGuide.value = true
    return
  }

  isLocating.value = true
  locationError.value = null

  try {
    console.log('🎯 开始获取高精度位置...')
    
    // 清除可能存在的缓存，确保获取最新的GPS位置
    if (typeof clearCachedLocation === 'function') {
      clearCachedLocation()
      console.log('🗑️ 已清除位置缓存，确保获取最新GPS位置')
    }
    
    // 使用优化后的定位函数，设置allowError=false确保总是返回位置
    const locationData = await getCurrentLocation({
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0, // 不使用任何缓存，强制获取新位置
      retryCount: 3,
      useCache: false, // 禁用缓存
      validateLocation: true,
      allowError: false // 确保不抛出错误，总是返回位置
    })

    if (locationData) {
      console.log('📍 获取到位置数据:', locationData)
      
      // 检查是否是默认位置或后备位置
      if (locationData.isDefault || locationData.fallbackReason) {
        console.warn('⚠️ 使用了后备位置:', locationData.fallbackReason || '默认位置')
        let message = '使用默认位置'
        if (locationData.fallbackReason) {
          message = `定位失败，使用校园默认位置`
        }
        showToast(message, 'warning')
        
        // 直接使用默认位置，不进行智能校准
        onLocationSuccess({
          ...locationData,
          calibrated: false,
          calibrationSource: null
        })
        return
      }
      
      // 检查是否已经过智能校准
      let finalLocation = locationData
      // 暂时禁用智能校准，直接使用原始位置
      // if (!locationData.calibrated && locationData.accuracy <= 100) {
      //   console.log('🔧 应用智能位置校准...')
      //   finalLocation = smartLocationCalibration(locationData)
      // }
      
      onLocationSuccess(finalLocation)
    } else {
      // 理论上不应该到达这里，但作为安全网
      console.warn('⚠️ 未获取到位置数据，使用默认位置')
      const defaultLocation = {
        latitude: 23.028501,
        longitude: 112.184488,
        accuracy: 100,
        isDefault: true,
        calibrated: false
      }
      onLocationSuccess(defaultLocation)
    }

  } catch (error) {
    console.error('❌ 定位失败:', error)
    // 即使发生错误，也尝试使用默认位置
    const fallbackLocation = {
      latitude: 23.028501,
      longitude: 112.184488,
      accuracy: 100,
      isDefault: true,
      fallbackReason: 'error',
      calibrated: false
    }
    onLocationSuccess(fallbackLocation)
  }
}

// 方案1: 浏览器原生定位
const tryBrowserLocation = (useFastMode = false) => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }

    // 根据模式调整超时时间
    const timeout = useFastMode ? 3000 : 8000
    const accuracy = useFastMode ? false : true

    const options = {
      enableHighAccuracy: accuracy,
      timeout: timeout,
      maximumAge: useFastMode ? 60000 : 30000
    }

    console.log(`🎯 开始${useFastMode ? '快速' : '标准'}浏览器定位，超时:${timeout}ms`)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        console.log(`🎯 浏览器${useFastMode ? '快速' : '标准'}定位成功:`, [longitude, latitude], '精度:', accuracy, '米')
        resolve({
          position: { lng: longitude, lat: latitude },
          accuracy: accuracy,
          mode: useFastMode ? '快速模式' : '标准模式'
        })
      },
      (error) => {
        console.warn(`⚠️ 浏览器${useFastMode ? '快速' : '标准'}定位失败:`, error.message)
        resolve(null)
      },
      options
    )
  })
}

// 方案2: 高德地图定位
const tryAmapLocation = (useFastMode = false) => {
  return new Promise((resolve) => {
    if (!window.AMap) {
      resolve(null)
      return
    }

    // 根据模式调整超时时间
    const timeout = useFastMode ? 5000 : 10000

    map.value.plugin('AMap.Geolocation', () => {
      const geolocation = new AMap.Geolocation({
        enableHighAccuracy: !useFastMode,
        timeout: timeout,
        zoomToAccuracy: false,
        extensions: 'all',
        showButton: false
      })

      console.log(`🗺️ 开始${useFastMode ? '快速' : '标准'}高德定位，超时:${timeout}ms`)

      geolocation.getCurrentPosition((status, result) => {
        if (status === 'complete') {
          console.log(`🗺️ 高德${useFastMode ? '快速' : '标准'}定位成功:`, result.position, '精度:', result.accuracy, '米')
          resolve({
            ...result,
            mode: useFastMode ? '快速模式' : '标准模式'
          })
        } else {
          console.warn(`⚠️ 高德${useFastMode ? '快速' : '标准'}定位失败:`, result)
          resolve(null)
        }
      })
    })
  })
}

// 方案3: 简单备用定位 (使用校园中心作为默认位置)
const tryIpLocation = async () => {
  try {
    // 直接返回校园中心位置作为备用方案
    console.log('🏫 使用校园中心作为备用位置:', campusCenter)
    return {
      position: { lng: campusCenter[0], lat: campusCenter[1] },
      accuracy: 500 // 设置较大精度表示这是估算位置
    }
  } catch (error) {
    console.warn('⚠️ 备用定位失败:', error)
  }
  
  return null
}

// 定位成功处理
const onLocationSuccess = (locationData) => {
  isLocating.value = false
  
  // 处理新的位置数据格式
  const position = {
    lng: locationData.longitude,
    lat: locationData.latitude
  }
  const accuracy = locationData.accuracy
  
  userLocation.value = {
    coords: {
      latitude: locationData.latitude,
      longitude: locationData.longitude
    },
    accuracy: accuracy,
    source: locationData.source || 'browser',
    calibrated: locationData.calibrated || false,
    calibrationSource: locationData.calibrationSource || null
  }
  
  locationAccuracy.value = accuracy
  
  console.log('📍 定位成功:', {
    position: [position.lng, position.lat],
    accuracy: accuracy,
    calibrated: locationData.calibrated,
    calibrationSource: locationData.calibrationSource
  })
  
  addUserLocationMarker()
  
  // 显示定位结果信息
  let message = '定位成功'
  if (locationData.calibrated) {
    message = `已智能校准到${locationData.calibrationSource}，精度${Math.round(accuracy)}米`
  } else {
    message = `定位成功，精度${Math.round(accuracy)}米`
  }
  
  // 检查是否在校园范围内
  if (!isInCampusRange([position.lng, position.lat])) {
    message += '，检测到您可能不在校园内'
    showToast(message)
    showCalibrationPanel.value = true
  } else {
    map.value.setZoomAndCenter(17, [position.lng, position.lat])
    showToast(message)
  }
  
  // 如果精度较差，自动提示校准
  if (accuracy > 50 && !locationData.calibrated) {
    setTimeout(() => {
      enhanceLocationAccuracy()
    }, 2000)
  }
}

// 定位错误处理 - 增强版
const onLocationError = (error) => {
  isLocating.value = false
  console.error('❌ 定位失败:', error)
  
  let message = '定位失败，请重试'
  let showRetry = true
  
  // 处理格式化的错误对象
  if (error && typeof error === 'object') {
    if (error.code && error.message) {
      // 已经是格式化的错误对象
      message = error.message
      if (error.suggestion) {
        message += `\n${error.suggestion}`
      }
      
      // 根据错误类型决定是否显示重试
      if (error.code === 'PERMISSION_DENIED') {
        showRetry = false
        showLocationGuide.value = true
      } else if (error.code === 'POSITION_UNAVAILABLE') {
        showRetry = true
      } else if (error.code === 'TIMEOUT') {
        showRetry = true
      } else if (error.code === 'UNKNOWN_ERROR') {
        showRetry = true
      } else {
        showRetry = true
      }
    } else if (error.message) {
      // 普通错误对象
      message = error.message
      if (error.message.includes('timeout')) {
        message = '定位超时，网络可能较慢'
        showRetry = true
      } else if (error.message.includes('permission')) {
        message = '请允许浏览器获取位置信息'
        showRetry = false
        showLocationGuide.value = true
      } else if (error.message.includes('所有定位方式都失败')) {
        message = '自动定位失败，请手动选择位置'
        showRetry = false
      }
    }
  } else if (typeof error === 'string') {
    // 错误字符串
    message = error
  }
  
  locationError.value = message
  
  if (showRetry) {
    // 显示重试按钮
    setTimeout(() => {
      if (locationError.value) {
        showRetryDialog(message)
      }
    }, 1000)
  } else {
    showToast(message)
    // 直接显示校准面板
    showCalibrationPanel.value = true
  }
}

// 显示重试对话框
const showRetryDialog = (message) => {
  if (confirm(`${message}\n\n是否重试定位？`)) {
    setTimeout(() => {
      getPreciseLocation()
    }, 500)
  } else {
    showCalibrationPanel.value = true
  }
}

// 检查是否在校园范围内
const isInCampusRange = (location) => {
  if (!location) return false
  
  const [lng, lat] = location
  const [centerLng, centerLat] = campusCenter
  
  const lngDiff = Math.abs(lng - centerLng)
  const latDiff = Math.abs(lat - centerLat)
  
  return lngDiff < 0.01 && latDiff < 0.01
}

// 添加用户位置标记
const addUserLocationMarker = () => {
  if (!map.value || !userLocation.value) return

  if (userLocationMarker.value) {
    map.value.remove(userLocationMarker.value)
  }

  const position = [
    userLocation.value.coords.longitude,
    userLocation.value.coords.latitude
  ]

  userLocationMarker.value = new AMap.Marker({
    position: position,
    content: createUserLocationMarker(),
    offset: new AMap.Pixel(-15, -15),
    zIndex: 300
  })

  map.value.add(userLocationMarker.value)
}

// 创建用户位置标记
const createUserLocationMarker = () => {
  return `
    <div style="
      width: 30px; height: 30px; 
      background: #1989fa; border: 4px solid white; border-radius: 50%;
      box-shadow: 0 2px 10px rgba(25,137,250,0.5);
      position: relative; animation: pulse 2s infinite;
    ">
      <div style="
        position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 8px; height: 8px; background: white; border-radius: 50%;
      "></div>
    </div>
  `
}

// 手动校准位置
const calibrateLocation = () => {
  if (!locationPermissionGranted.value) {
    showLocationGuide.value = true
    return
  }
  showCalibrationPanel.value = true
}

// 地图控制方法
const moveToCampusCenter = () => {
  if (map.value) {
    map.value.setZoomAndCenter(17, campusCenter)
    showToast('已回到校园中心')
  }
}

const zoomIn = () => map.value?.zoomIn()
const zoomOut = () => map.value?.zoomOut()

// 活动标记（简化）
const addActivityMarkers = () => {
  if (!map.value || !activities.value.length) return

  activities.value.forEach(activity => {
    const building = campusBuildings[activity.building]
    if (!building?.coords) return

    try {
      const [lng, lat] = building.coords
      const offsetLng = (Math.random() - 0.5) * 0.0002
      const offsetLat = (Math.random() - 0.5) * 0.0002

      const marker = new AMap.Marker({
        position: [lng + offsetLng, lat + offsetLat],
        content: `
          <div style="
            width: 28px; height: 28px; background: #ff6b6b; border: 2px solid white; border-radius: 50%;
            display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4); cursor: pointer; animation: pulse 2s infinite;
          ">活</div>
        `,
        offset: new AMap.Pixel(-14, -14),
        title: activity.title,
        zIndex: 200
      })

      marker.on('click', () => {
        showToast(`活动: ${activity.title}`)
      })

      map.value.add(marker)

    } catch (error) {
      console.error(`添加活动 ${activity.title} 失败:`, error)
    }
  })
}

// 工具函数
const getBuildingColor = (type) => {
  const colors = {
    'teaching': '#3498db', 'admin': '#e74c3c', 'lab': '#9b59b6',
    'library': '#1abc9c', 'dorm': '#2ecc71', 'dining': '#f39c12',
    'sports': '#e67e22', 'gate': '#95a5a6', 'transport': '#34495e',
    'other': '#7f8c8d'
  }
  return colors[type] || '#7f8c8d'
}

const getBuildingTypeName = (type) => {
  const names = {
    'teaching': '教学区', 'admin': '行政区', 'lab': '实验楼',
    'library': '图书馆', 'dorm': '宿舍区', 'dining': '食堂',
    'sports': '体育设施', 'gate': '校门', 'transport': '交通设施',
    'other': '其他'
  }
  return names[type] || '其他'
}

// 加载活动数据
const loadActivities = async () => {
  // 从localStorage获取用户信息
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  const currentUserId = userInfo.id || 1
  const currentUserName = userInfo.realName || '用户'
  
  // 使用个性化的活动数据
  activities.value = getPersonalizedActivities(currentUserId, currentUserName)
}

onMounted(async () => {
  await loadActivities()
  await initMap()
})
</script>

<style scoped>
/* 样式部分与之前相同，保持不变 */
.home-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.search-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  padding: 10px 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.map-container {
  flex: 1;
  margin-top: 70px;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  width: 100%;
  height: calc(100vh - 70px);
}

.map-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: white;
  background: rgba(0,0,0,0.8);
  padding: 24px;
  border-radius: 12px;
  z-index: 10;
}

.location-guide {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,255,255,0.98);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.guide-content {
  text-align: center;
  max-width: 300px;
}

.guide-content h3 {
  margin: 16px 0;
  color: #333;
  font-size: 20px;
}

.guide-content p {
  margin: 0 0 16px 0;
  color: #666;
}

.guide-content ul {
  text-align: left;
  margin: 0 0 24px 0;
  padding-left: 20px;
  color: #666;
  line-height: 1.6;
}

.guide-actions {
  display: flex;
  gap: 12px;
}

.guide-actions .van-button {
  flex: 1;
}

.location-status {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  z-index: 100;
  backdrop-filter: blur(10px);
  max-width: 80%;
}

.location-status.warning {
  background: rgba(255, 193, 7, 0.9);
  color: #856404;
}

.location-status.locating {
  background: rgba(255, 193, 7, 0.9);
  color: #856404;
}

.location-status.success {
  background: rgba(40, 167, 69, 0.9);
  color: white;
}

.location-status.error {
  background: rgba(220, 53, 69, 0.9);
  color: white;
}

.map-controls {
  position: absolute;
  bottom: 20px;
  right: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 100;
}

.control-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #e8e8e8;
}

.control-btn:active {
  transform: scale(0.95);
}

.calibration-panel {
  padding: 20px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.calibration-panel h3 {
  margin: 0 0 10px 0;
  text-align: center;
}

.calibration-panel p {
  margin: 0 0 16px 0;
  color: #666;
  text-align: center;
  font-size: 14px;
}

.building-list {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
}

.building-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.building-item:active {
  background-color: #f5f5f5;
}

.building-marker {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  margin-right: 12px;
  flex-shrink: 0;
}

.building-info {
  flex: 1;
}

.building-name {
  font-weight: bold;
  margin-bottom: 4px;
}

.building-type {
  font-size: 12px;
  color: #666;
}

.calibration-actions {
  display: flex;
  gap: 12px;
}

.calibration-actions .van-button {
  flex: 1;
}

.building-info-popup {
  padding: 20px;
}

.building-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.building-marker-large {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 20px;
  margin-right: 16px;
  flex-shrink: 0;
}

.building-title h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  color: #333;
}

.building-type {
  font-size: 14px;
  color: #666;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 12px;
}

.building-details {
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
}

.building-actions {
  display: flex;
  gap: 12px;
}

.building-actions .van-button {
  flex: 1;
}

.debug-panel {
  position: fixed;
  bottom: 60px;
  left: 10px;
  right: 10px;
  background: rgba(255,255,255,0.98);
  padding: 12px 16px;
  border: 2px solid #ff4444;
  border-radius: 8px;
  z-index: 1000;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(255,68,68,0.3);
}

.debug-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 12px;
}

.debug-item:last-child {
  margin-bottom: 0;
}

.debug-item span:first-child {
  color: #666;
  font-weight: 500;
}

.debug-item span:last-child {
  color: #333;
  font-family: 'Courier New', monospace;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
</style>