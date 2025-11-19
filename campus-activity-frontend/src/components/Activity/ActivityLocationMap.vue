<template>
  <div class="activity-location-map">
    <div id="mini-map" ref="mapElement" class="mini-map"></div>
    <div class="map-overlay" v-if="!location.latitude">
      <van-empty description="未选择位置" image="location-o">
        <van-button type="primary" size="small" @click="$emit('edit')" v-if="editable">
          选择位置
        </van-button>
      </van-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { mapConfig, campusCenter } from '@/config/map'

const props = defineProps({
  location: {
    type: Object,
    default: () => ({})
  },
  editable: {
    type: Boolean,
    default: false
  }
})

defineEmits(['edit'])

const mapElement = ref(null)
const map = ref(null)
const marker = ref(null)

// 初始化迷你地图
const initMiniMap = () => {
  if (!window.AMap) {
    console.error('高德地图SDK未加载')
    return
  }

  map.value = new window.AMap.Map(mapElement.value, {
    zoom: 16,
    center: props.location.latitude ? [props.location.longitude, props.location.latitude] : campusCenter,
    mapStyle: mapConfig.mapStyle,
    zoomEnable: false,
    dragEnable: false,
    doubleClickZoom: false,
    keyboardEnable: false,
    scrollWheel: false,
    touchZoom: false
  })

  // 如果有位置信息，添加标记
  if (props.location.latitude) {
    addLocationMarker()
  }
}

// 添加位置标记
const addLocationMarker = () => {
  if (marker.value) {
    map.value.remove(marker.value)
  }

  marker.value = new window.AMap.Marker({
    position: [props.location.longitude, props.location.latitude],
    content: `
      <div class="location-marker">
        <div class="marker-pin"></div>
      </div>
    `
  })

  map.value.add(marker.value)
  map.value.setCenter([props.location.longitude, props.location.latitude])
}

// 监听位置变化
watch(() => props.location, (newLocation) => {
  if (newLocation.latitude && map.value) {
    addLocationMarker()
  }
}, { deep: true })

onMounted(() => {
  // 动态加载高德地图SDK
  if (!window.AMap) {
    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${mapConfig.amapKey}`
    script.onload = initMiniMap
    document.head.appendChild(script)
  } else {
    initMiniMap()
  }
})
</script>

<style scoped>
.activity-location-map {
  position: relative;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
}

.mini-map {
  width: 100%;
  height: 100%;
}

.map-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.location-marker) {
  position: relative;
}

:deep(.marker-pin) {
  width: 16px;
  height: 16px;
  background: #ff4757;
  border: 3px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

:deep(.location-marker::after) {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 12px solid #ff4757;
}
</style>