<template>
  <div class="checkin-panel">
    <van-nav-bar
      title="活动签到"
      left-text="关闭"
      @click-left="$emit('close')"
    />
    
    <div class="checkin-content">
      <!-- 活动信息 -->
      <div class="activity-info">
        <h3>{{ activity.title }}</h3>
        <p class="activity-location">{{ activity.address }}</p>
        <p class="checkin-time">签到时间: {{ currentTime }}</p>
      </div>

      <!-- 位置信息 -->
      <div class="location-info">
        <van-cell title="当前位置" :value="locationAddress" />
        <van-cell title="距离活动地点" :value="distanceText" />
      </div>

      <!-- 地图预览 -->
      <div class="map-preview" v-if="location.latitude">
        <div id="checkin-map" class="map"></div>
      </div>

      <!-- 签到状态 -->
      <div class="checkin-status">
        <van-loading v-if="checkingLocation" text="获取位置中..." />
        <div v-else-if="locationError" class="error-message">
          <van-icon name="warning" />
          <span>{{ locationError }}</span>
        </div>
        <div v-else-if="isInRange" class="success-message">
          <van-icon name="passed" />
          <span>在签到范围内，可以签到</span>
        </div>
        <div v-else class="error-message">
          <van-icon name="warning" />
          <span>不在签到范围内，请靠近活动地点</span>
        </div>
      </div>
    </div>

    <!-- 签到按钮 -->
    <div class="checkin-actions">
      <van-button
        type="primary"
        size="large"
        :loading="checkingIn"
        :disabled="!isInRange || checkingLocation || !!locationError"
        @click="doCheckIn"
      >
        {{ checkingIn ? '签到中...' : '确认签到' }}
      </van-button>
      
      <van-button
        type="default"
        size="large"
        @click="refreshLocation"
        :loading="checkingLocation"
      >
        刷新位置
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { showToast } from 'vant'
import { useActivityStore } from '@/stores/activity'
import { useLocationStore } from '@/stores/location'
import { calculateDistance } from '@/utils/location.js'

const props = defineProps({
  activity: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['checkin-success', 'close'])

const activityStore = useActivityStore()
const locationStore = useLocationStore()

const checkingLocation = ref(false)
const checkingIn = ref(false)
const locationError = ref('')
const currentTime = ref(new Date().toLocaleString('zh-CN'))
const location = ref({
  latitude: null,
  longitude: null
})

const locationAddress = computed(() => {
  if (location.value.address) {
    return location.value.address
  }
  if (location.value.latitude) {
    return '定位成功'
  }
  return '获取中...'
})

const distanceText = computed(() => {
  if (!location.value.latitude || !props.activity.coords) {
    return '计算中...'
  }
  
  const distance = calculateDistance(
    location.value.latitude,
    location.value.longitude,
    props.activity.coords[1],
    props.activity.coords[0]
  )
  
  return distance < 1000 ? `${Math.round(distance)}米` : `${(distance / 1000).toFixed(1)}公里`
})

const isInRange = computed(() => {
  if (!location.value.latitude || !props.activity.coords) {
    return false
  }
  
  const distance = calculateDistance(
    location.value.latitude,
    location.value.longitude,
    props.activity.coords[1],
    props.activity.coords[0]
  )
  
  // 签到范围：100米内
  return distance <= 100
})

let map = null
let locationMarker = null
let activityMarker = null

// 先定义getCurrentLocation函数
const getCurrentLocation = async () => {
  checkingLocation.value = true
  locationError.value = ''
  
  try {
    await locationStore.getCurrentLocation()
    location.value = {
      latitude: locationStore.latitude,
      longitude: locationStore.longitude,
      address: locationStore.address
    }
    
    // 更新地图显示
    updateMap()
  } catch (error) {
    locationError.value = error.message || '获取位置失败'
    console.error('获取位置失败:', error)
  } finally {
    checkingLocation.value = false
  }
}

const initMap = () => {
  if (!window.AMap) return
  
  map = new window.AMap.Map('checkin-map', {
    zoom: 16,
    center: props.activity.coords,
    mapStyle: 'amap://styles/normal'
  })
  
  // 添加活动位置标记
  activityMarker = new window.AMap.Marker({
    position: props.activity.coords,
    title: props.activity.title,
    content: '<div style="background:#07c160;color:white;padding:4px 8px;border-radius:12px;">活动地点</div>'
  })
  map.add(activityMarker)
}

onMounted(() => {
  initMap()
  getCurrentLocation()
  
  // 每秒更新当前时间
  const timer = setInterval(() => {
    currentTime.value = new Date().toLocaleString('zh-CN')
  }, 1000)
  
  onUnmounted(() => {
    clearInterval(timer)
    if (map) {
      map.destroy()
    }
  })
})

// getCurrentLocation函数已在文件上方定义

const updateMap = () => {
  if (!map || !location.value.latitude) return
  
  // 清除旧的位置标记
  if (locationMarker) {
    map.remove(locationMarker)
  }
  
  // 添加当前位置标记
  locationMarker = new window.AMap.Marker({
    position: [location.value.longitude, location.value.latitude],
    title: '我的位置',
    content: '<div style="background:#1989fa;color:white;padding:4px 8px;border-radius:12px;">我的位置</div>'
  })
  map.add(locationMarker)
  
  // 调整地图视野，同时显示两个标记点
  const bounds = new window.AMap.Bounds()
  bounds.extend(props.activity.coords)
  bounds.extend([location.value.longitude, location.value.latitude])
  map.setBounds(bounds)
}

const refreshLocation = () => {
  getCurrentLocation()
}

const doCheckIn = async () => {
  checkingIn.value = true
  try {
    await activityStore.checkIn(props.activity.id, location.value)
    showToast('签到成功')
    emit('checkin-success')
  } catch (error) {
    console.error('签到失败:', error)
    showToast('签到失败')
  } finally {
    checkingIn.value = false
  }
}

// 计算两个坐标点之间的距离（米）
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000 // 地球半径（米）
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}
</script>

<style scoped>
.checkin-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.checkin-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.activity-info {
  text-align: center;
  margin-bottom: 20px;
  padding: 16px;
  background: white;
  border-radius: 8px;
}

.activity-info h3 {
  margin: 0 0 8px 0;
  color: #323233;
}

.activity-location {
  margin: 4px 0;
  color: #646566;
  font-size: 14px;
}

.checkin-time {
  margin: 4px 0;
  color: #969799;
  font-size: 12px;
}

.location-info {
  margin-bottom: 16px;
}

.map-preview {
  height: 200px;
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
}

.map {
  width: 100%;
  height: 100%;
}

.checkin-status {
  text-align: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
}

.error-message {
  color: #ee0a24;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.success-message {
  color: #07c160;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.checkin-actions {
  padding: 16px;
  background: white;
  border-top: 1px solid #ebedf0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>