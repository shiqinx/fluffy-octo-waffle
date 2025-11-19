<template>
  <div id="map-container" class="map-container"></div>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { mapConfig, campusCenter, campusBuildings } from '@/config/map'

const props = defineProps({
  activities: {
    type: Array,
    default: () => []
  },
  previewMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['marker-click'])

let map = null
let markers = []

const initMap = () => {
  console.log('🗺️ 开始初始化地图，API Key:', mapConfig.amapKey)
  return new Promise((resolve) => {
    if (window.AMap) {
      console.log('🗺️ window.AMap已存在')
      createMap()
      resolve()
      return
    }

    // 动态加载高德地图
    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${mapConfig.amapKey}&plugin=AMap.Geolocation`
    console.log('🗺️ 正在加载高德地图脚本:', script.src)
    script.onload = () => {
      console.log('🗺️ 高德地图加载成功，window.AMap:', !!window.AMap)
      createMap()
      resolve()
    }
    script.onerror = () => {
      console.error('❌ 高德地图加载失败')
      resolve()
    }
    document.head.appendChild(script)
    console.log('🗺️ 脚本已添加到文档')
  })
}

const createMap = () => {
  console.log('🗺️ 开始创建地图')
  if (!window.AMap) {
    console.error('❌ AMap 未加载')
    return
  }

  try {
    // 设置地图配置
    const mapConfig = {
      zoom: props.previewMode ? 17 : 16,
      viewMode: '3D',
      mapStyle: 'amap://styles/normal'
    }

    // 在预览模式下，如果有活动数据，以第一个活动的位置为地图中心
    if (props.previewMode && props.activities.length > 0 && props.activities[0].coords) {
      console.log('🗺️ 预览模式，使用活动坐标:', props.activities[0].coords)
      mapConfig.center = props.activities[0].coords
    } else {
      console.log('🗺️ 使用默认校园中心坐标:', campusCenter)
      mapConfig.center = campusCenter
    }

    console.log('🗺️ 创建地图实例，容器ID: map-container, 配置:', mapConfig)
    map = new AMap.Map('map-container', mapConfig)
    console.log('🗺️ 地图实例创建成功:', !!map)

    // 预览模式下只添加活动标记，不添加建筑物标记
    if (props.previewMode) {
      console.log('🗺️ 预览模式，添加活动标记')
      // 添加活动标记
      addActivityMarkers()
      console.log('🗺️ 预览模式地图创建成功，以活动位置为中心')
    } else {
      console.log('🗺️ 完整模式，添加建筑物和活动标记')
      // 添加建筑物标记
      addBuildingMarkers()
      // 添加活动标记
      addActivityMarkers()
      console.log('🗺️ 完整模式地图创建成功')
    }
  } catch (error) {
    console.error('❌ 地图创建失败:', error)
    console.error('❌ 错误详情:', error.stack)
  }
}

const addBuildingMarkers = () => {
  Object.values(campusBuildings).forEach(building => {
    const marker = new AMap.Marker({
      position: building.coords,
      title: building.name,
      content: createBuildingMarkerContent(building)
    })
    
    marker.on('click', () => {
      console.log('🏢 建筑物点击:', building.name)
    })
    
    map.add(marker)
  })
}

const addActivityMarkers = () => {
  // 清除旧标记
  markers.forEach(marker => map.remove(marker))
  markers = []

  props.activities.forEach(activity => {
    const marker = new AMap.Marker({
      position: activity.coords,
      title: activity.title,
      content: createActivityMarkerContent(activity)
    })
    
    marker.on('click', () => {
      console.log('🎯 活动标记点击:', activity.title)
      emit('marker-click', activity)
    })
    
    markers.push(marker)
    map.add(marker)
  })
}

const createBuildingMarkerContent = (building) => {
  const colorMap = {
    gate: '#4CAF50',
    teaching: '#2196F3',
    admin: '#FF9800',
    lab: '#9C27B0',
    library: '#795548',
    dorm: '#607D8B',
    dining: '#FF5722',
    sports: '#00BCD4',
    transport: '#FFC107',
    other: '#9E9E9E'
  }
  
  return `
    <div style="
      width: 12px; 
      height: 12px; 
      background: ${colorMap[building.type]}; 
      border-radius: 50%; 
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    "></div>
  `
}

const createActivityMarkerContent = (activity) => {
  const colorMap = {
    sports: '#FF6B6B',
    study: '#4ECDC4',
    entertainment: '#45B7D1',
    social: '#96CEB4'
  }
  
  return `
    <div style="
      width: 16px; 
      height: 16px; 
      background: ${colorMap[activity.type] || '#FFC107'}; 
      border-radius: 50%; 
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: white;
      font-weight: bold;
    ">活</div>
  `
}

onMounted(() => {
  console.log('🗺️ 地图容器挂载')
  console.log('🗺️ 地图容器DOM元素:', document.getElementById('map-container'))
  console.log('🗺️ 活动数据:', props.activities)
  console.log('🗺️ 预览模式:', props.previewMode)
  initMap()
})

onUnmounted(() => {
  if (map) {
    map.destroy()
  }
})

watch(() => props.activities, () => {
  console.log('🔄 活动数据更新，刷新地图标记')
  if (map) {
    addActivityMarkers()
  }
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  background: #e0e0e0;
}

.map-container:empty::before {
  content: "地图加载中...";
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  font-size: 16px;
}
</style>