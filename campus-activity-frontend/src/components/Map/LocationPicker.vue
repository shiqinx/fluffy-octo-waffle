<template>
  <div class="location-picker">
    <van-nav-bar
      :title="title"
      left-text="取消"
      right-text="确认"
      @click-left="$emit('cancel')"
      @click-right="confirmLocation"
    />
    
    <div class="map-container">
      <div id="picker-map" class="picker-map"></div>
      
      <!-- 中心标记 -->
      <div class="center-marker">
        <van-icon name="location-o" />
      </div>
      
      <!-- 位置信息 -->
      <div class="location-info">
        <div class="address">{{ currentAddress }}</div>
        <div class="coordinates">{{ coordinates }}</div>
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="search-section">
      <van-search
        v-model="searchKeyword"
        placeholder="搜索地点..."
        @search="onSearch"
        @clear="clearSearch"
      />
      
      <!-- 搜索结果 -->
      <div v-if="searchResults.length > 0" class="search-results">
        <div
          v-for="place in searchResults"
          :key="place.id"
          class="search-result-item"
          @click="selectPlace(place)"
        >
          <van-icon name="location-o" />
          <div class="place-info">
            <div class="place-name">{{ place.name }}</div>
            <div class="place-address">{{ place.address }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useMapStore } from '@/stores/map'

const props = defineProps({
  title: {
    type: String,
    default: '选择位置'
  },
  initialLocation: {
    type: Object,
    default: () => ({ lng: 116.310316, lat: 39.992807 })
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const mapStore = useMapStore()
const searchKeyword = ref('')
const searchResults = ref([])
const selectedLocation = ref({ ...props.initialLocation })
const currentAddress = ref('正在获取地址...')
const pickerMap = ref(null)

const coordinates = computed(() => {
  const loc = selectedLocation.value
  return `${loc.lng.toFixed(6)}, ${loc.lat.toFixed(6)}`
})

onMounted(async () => {
  await initializePickerMap()
  await reverseGeocode(selectedLocation.value.lng, selectedLocation.value.lat)
})

const initializePickerMap = async () => {
  try {
    await mapStore.loadAMapScript()
    
    pickerMap.value = new AMap.Map('picker-map', {
      zoom: 16,
      center: [selectedLocation.value.lng, selectedLocation.value.lat],
      viewMode: '3D'
    })
    
    // 监听地图移动事件
    pickerMap.value.on('moveend', onMapMove)
    
    // 添加标记
    addLocationMarker()
  } catch (error) {
    console.error('地图初始化失败:', error)
  }
}

const onMapMove = () => {
  const center = pickerMap.value.getCenter()
  selectedLocation.value = {
    lng: center.lng,
    lat: center.lat
  }
  reverseGeocode(center.lng, center.lat)
}

const addLocationMarker = () => {
  if (pickerMap.value) {
    new AMap.Marker({
      position: [selectedLocation.value.lng, selectedLocation.value.lat],
      map: pickerMap.value
    })
  }
}

const reverseGeocode = async (lng, lat) => {
  try {
    const result = await mapStore.reverseGeocode(lng, lat)
    if (result) {
      currentAddress.value = result.address
    }
  } catch (error) {
    currentAddress.value = '获取地址失败'
  }
}

const onSearch = async (keyword) => {
  if (!keyword.trim()) return
  
  try {
    const results = await mapStore.searchPlace(keyword)
    searchResults.value = results
  } catch (error) {
    console.error('搜索失败:', error)
    searchResults.value = []
  }
}

const selectPlace = (place) => {
  selectedLocation.value = {
    lng: place.lng,
    lat: place.lat
  }
  
  // 移动地图到选择的位置
  if (pickerMap.value) {
    pickerMap.value.setCenter([place.lng, place.lat])
    pickerMap.value.setZoom(17)
  }
  
  searchResults.value = []
  searchKeyword.value = ''
}

const clearSearch = () => {
  searchResults.value = []
}

const confirmLocation = () => {
  emit('confirm', {
    ...selectedLocation.value,
    address: currentAddress.value
  })
}
</script>

<style scoped>
.location-picker {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.map-container {
  flex: 1;
  position: relative;
}

.picker-map {
  width: 100%;
  height: 100%;
}

.center-marker {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #07c160;
  font-size: 32px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
  pointer-events: none;
}

.location-info {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  background: white;
  margin: 0 16px;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  text-align: center;
}

.address {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  color: #333;
}

.coordinates {
  font-size: 12px;
  color: #969799;
}

.search-section {
  background: white;
  border-top: 1px solid #f0f0f0;
}

.search-results {
  max-height: 200px;
  overflow-y: auto;
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item .van-icon {
  color: #07c160;
  margin-right: 12px;
  font-size: 18px;
}

.place-info {
  flex: 1;
}

.place-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
  color: #333;
}

.place-address {
  font-size: 12px;
  color: #969799;
}
</style>