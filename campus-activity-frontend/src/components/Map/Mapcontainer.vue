<template>
  <div class="map-container">
    <div class="map-content">
      <h3>🗺️ 高德地图</h3>
      <p>地图功能开发中...</p>
      <div class="test-markers">
        <div class="marker">📍 当前位置</div>
        <div class="marker">📍 附近活动</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MapContainer'
}
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}

.map-content {
  width: 100%;
  height: 100%;
  background: #e3f2fd;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #1976d2;
}
</style>