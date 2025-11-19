<template>
  <div class="location-picker">
    <van-nav-bar
      title="选择地点"
      left-text="取消"
      right-text="确认"
      left-arrow
      @click-left="$emit('close')"
      @click-right="confirmLocation"
    />

    <div class="picker-content">
      <!-- 搜索栏 -->
      <div class="search-section">
        <van-search
          v-model="searchKeyword"
          placeholder="搜索地点..."
          @search="onSearchLocation"
          @clear="onClearSearch"
        />
      </div>

      <!-- 地图 -->
      <div class="map-section">
        <div id="picker-map" class="map"></div>
        <div class="map-center-marker">
          <van-icon name="location-o" color="#1989fa" size="24" />
        </div>
      </div>

      <!-- 地点列表 -->
      <div class="location-list">
        <van-radio-group v-model="selectedLocationId">
          <van-cell-group>
            <van-cell
              v-for="location in filteredLocations"
              :key="location.id"
              :title="location.name"
              :label="location.address"
              clickable
              @click="onLocationClick(location)"
            >
              <template #right-icon>
                <van-radio :name="location.id" />
              </template>
            </van-cell>
          </van-cell-group>
        </van-radio-group>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { showToast } from 'vant'
import { campusBuildings, campusCenter } from '@/config/map'

const emit = defineEmits(['location-select', 'close'])

const searchKeyword = ref('')
const selectedLocationId = ref('')
const currentCenter = ref(campusCenter)

// 将建筑物数据转换为地点列表
const locationList = computed(() => {
  return Object.entries(campusBuildings).map(([key, building]) => ({
    id: key,
    name: building.name,
    address: building.address,
    coords: building.coords,
    type: building.type
  }))
})

const filteredLocations = computed(() => {
  if (!searchKeyword.value) {
    return locationList.value
  }
  
  const keyword = searchKeyword.value.toLowerCase()
  return locationList.value.filter(location => 
    location.name.toLowerCase().includes(keyword) ||
    location.address.toLowerCase().includes(keyword)
  )
})

const selectedLocation = computed(() => {
  return locationList.value.find(loc => loc.id === selectedLocationId.value)
})

let map = null
let marker = null

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  if (map) {
    map.destroy()
  }
})

const initMap = () => {
  if (!window.AMap) {
    showToast('地图加载失败')
    return
  }

  map = new window.AMap.Map('picker-map', {
    zoom: 16,
    center: campusCenter,
    mapStyle: 'amap://styles/normal'
  })

  // 添加所有地点标记
  locationList.value.forEach(location => {
    const locationMarker = new window.AMap.Marker({
      position: location.coords,
      title: location.name,
      content: createMarkerContent(location)
    })
    
    locationMarker.on('click', () => {
      onLocationClick(location)
    })
    
    map.add(locationMarker)
  })

  // 监听地图移动
  map.on('moveend', () => {
    const center = map.getCenter()
    currentCenter.value = [center.lng, center.lat]
  })
}

const createMarkerContent = (location) => {
  return `
    <div style="
      background: #1989fa; 
      color: white; 
      padding: 4px 8px; 
      border-radius: 12px; 
      font-size: 12px;
      white-space: nowrap;
    ">
      ${location.name}
    </div>
  `
}

const onSearchLocation = () => {
  if (!searchKeyword.value.trim()) return
  
  // 这里可以调用高德地图的搜索API
  // 暂时使用本地搜索
  const found = filteredLocations.value[0]
  if (found) {
    onLocationClick(found)
    map.setCenter(found.coords)
    map.setZoom(18)
  } else {
    showToast('未找到相关地点')
  }
}

const onClearSearch = () => {
  searchKeyword.value = ''
}

const onLocationClick = (location) => {
  selectedLocationId.value = location.id
  
  // 移动地图到选中位置
  map.setCenter(location.coords)
  map.setZoom(18)
}

const confirmLocation = () => {
  if (!selectedLocation.value) {
    showToast('请选择一个地点')
    return
  }
  
  emit('location-select', selectedLocation.value)
  emit('close')
}
</script>

<style scoped>
.location-picker {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.picker-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.search-section {
  background: white;
  border-bottom: 1px solid #ebedf0;
}

.map-section {
  height: 300px;
  position: relative;
  flex-shrink: 0;
}

.map {
  width: 100%;
  height: 100%;
}

.map-center-marker {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.location-list {
  flex: 1;
  overflow-y: auto;
}
</style>