import AMapLoader from '@amap/amap-jsapi-loader'

class MapService {
  constructor() {
    this.map = null
    this.AMap = null
  }

  async initMap(containerId, options = {}) {
    try {
      this.AMap = await AMapLoader.load({
        key: import.meta.env.VITE_AMAP_KEY || '你的测试Key', // 优先使用环境变量
        version: '2.0',
        plugins: ['AMap.Geolocation', 'AMap.Geocoder', 'AMap.AutoComplete'] // 需要的插件
      })
      
      this.map = new this.AMap.Map(containerId, {
        zoom: 16,
        viewMode: '3D',
        ...options
      })

      // 添加缩放控件
      this.map.addControl(new this.AMap.Zoom())
      
      return this.map
    } catch (error) {
      console.error('地图初始化失败:', error)
      throw error
    }
  }

  // 获取当前位置
  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      const geolocation = new this.AMap.Geolocation({
        enableHighAccuracy: true,
        timeout: 10000,
        buttonOffset: new this.AMap.Pixel(10, 20),
        zoomToAccuracy: true,
        buttonPosition: 'RB'
      })
      
      this.map.addControl(geolocation)
      
      geolocation.getCurrentPosition((status, result) => {
        if (status === 'complete') {
          resolve({
            longitude: result.position.lng,
            latitude: result.position.lat,
            address: result.formattedAddress
          })
        } else {
          reject(new Error('获取位置失败: ' + result.message))
        }
      })
    })
  }
}

export default new MapService()