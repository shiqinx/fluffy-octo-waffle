import { defineStore } from 'pinia'

export const useMapStore = defineStore('map', {
  state: () => ({
    map: null,
    markers: []
  }),
  
  actions: {
    // 初始化地图
    initMap(containerId, options = {}) {
      return new Promise((resolve, reject) => {
        // 确保高德地图JS已加载
        if (!window.AMap) {
          this.loadAMapScript()
            .then(() => {
              this.createMap(containerId, options, resolve)
            })
            .catch(reject)
        } else {
          this.createMap(containerId, options, resolve)
        }
      })
    },
    
    // 动态加载高德地图JS
    loadAMapScript() {
      return new Promise((resolve, reject) => {
        // 使用官方测试Key（无需白名单）
        const testKey = 'e6e6ba6d4e61eeccf6d8e2e75cff1e25'
        // 或者使用你的Key（如果配置正确）
        const yourKey = '6cf00d7172f8f4639344379db67b117e'
        
        const script = document.createElement('script')
        script.src = `https://webapi.amap.com/maps?v=2.0&key=${testKey}`
        script.onload = resolve
        script.onerror = () => reject(new Error('高德地图加载失败，请检查网络连接'))
        document.head.appendChild(script)
      })
    },
    
    // 创建地图实例
    createMap(containerId, options, resolve) {
      try {
        const defaultOptions = {
          zoom: 15,
          center: [116.397428, 39.90923], // 北京坐标
          viewMode: '2D'
        }
        
        const map = new AMap.Map(containerId, {
          ...defaultOptions,
          ...options
        })
        
        this.map = map
        resolve(map)
      } catch (error) {
        reject(new Error('地图创建失败: ' + error.message))
      }
    },
    
    // 添加标记
    addMarker({ lnglat, title, content }) {
      if (!this.map) return null
      
      const marker = new AMap.Marker({
        position: lnglat,
        title: title,
        content: content
      })
      
      marker.setMap(this.map)
      this.markers.push(marker)
      return marker
    },
    
    // 定位用户
    locateUser(callback) {
      if (!this.map) return
      
      AMap.plugin('AMap.Geolocation', () => {
        const geolocation = new AMap.Geolocation({
          enableHighAccuracy: true,
          timeout: 10000,
          zoomToAccuracy: true
        })
        
        geolocation.getCurrentPosition((status, result) => {
          if (status === 'complete') {
            callback && callback({
              longitude: result.position.lng,
              latitude: result.position.lat
            })
          } else {
            console.error('定位失败:', result)
          }
        })
      })
    },
    
    // 清除所有标记
    clearMarkers() {
      this.markers.forEach(marker => {
        marker.setMap(null)
      })
      this.markers = []
    }
  }
})