<template>
  <div class="test-map-view">
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { mapConfig, campusCenter, campusBuildings, mockActivities } from '@/config/map'
import { getAmapKey } from '@/utils/env'

// 地图实例和标记
const mapContainer = ref(null)
const map = ref(null)
const buildingMarkers = ref([])
const activityMarkers = ref([])
const mapLoaded = ref(false)

// 初始化地图
const initMap = async () => {
  if (!mapContainer.value) return
  
  try {
    console.log('初始化地图...')
    
    // 加载高德地图SDK
    await loadAMapScript()
    
    // 创建地图实例
    map.value = new AMap.Map(mapContainer.value, {
      center: campusCenter,
      zoom: 17,
      viewMode: '3D'
    })
    
    // 地图加载完成
    map.value.on('complete', () => {
      console.log('地图加载完成')
      mapLoaded.value = true
      addBuildingMarkers()
      addActivityMarkers()
    })
  } catch (error) {
    console.error('地图初始化失败:', error)
  }
}

// 加载地图SDK
const loadAMapScript = () => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${getAmapKey()}&callback=initAMap`
    script.async = true
    document.head.appendChild(script)
    
    window.initAMap = () => resolve()
    script.onerror = () => reject(new Error('地图SDK加载失败'))
  })
}

// 添加建筑物标记
const addBuildingMarkers = () => {
  if (!map.value || !campusBuildings) return
  
  Object.values(campusBuildings).forEach(building => {
    const marker = new AMap.Marker({
      position: building.coords,
      title: building.name
    })
    map.value.add(marker)
    buildingMarkers.value.push(marker)
  })
}

// 添加活动标记
const addActivityMarkers = () => {
  if (!map.value || !mockActivities) return
  
  mockActivities.forEach(activity => {
    const building = campusBuildings[activity.building]
    if (building) {
      const marker = new AMap.Marker({
        position: building.coords,
        title: activity.title
      })
      map.value.add(marker)
      activityMarkers.value.push(marker)
    }
  })
}

// 生命周期
onMounted(() => {
  initMap()
})

onUnmounted(() => {
  if (map.value) {
    buildingMarkers.value.forEach(marker => map.value.remove(marker))
    activityMarkers.value.forEach(marker => map.value.remove(marker))
  }
})
</script>

<style scoped>
.test-map-view {
  height: 100vh;
  overflow: hidden;
}

.map-container {
  height: 100%;
  width: 100%;
}
</style>