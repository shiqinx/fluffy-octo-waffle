import { campusBuildings, campusCenter } from '@/config/map'
import { calculateDistance } from './location.js'

// 坐标转换工具 - WGS-84(原始GPS)到GCJ-02(高德地图)
// 参考开源算法实现
const transformLat = (x, y) => {
  let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x))
  ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0
  ret += (20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin(y / 3.0 * Math.PI)) * 2.0 / 3.0
  ret += (160.0 * Math.sin(y / 12.0 * Math.PI) + 320 * Math.sin(y * Math.PI / 30.0)) * 2.0 / 3.0
  return ret
}

const transformLon = (x, y) => {
  let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x))
  ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0
  ret += (20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin(x / 3.0 * Math.PI)) * 2.0 / 3.0
  ret += (150.0 * Math.sin(x / 12.0 * Math.PI) + 300.0 * Math.sin(x / 30.0 * Math.PI)) * 2.0 / 3.0
  return ret
}

const outOfChina = (lon, lat) => {
  return (lon < 73.66 || lon > 135.05 || lat < 3.86 || lat > 53.55)
}

const delta = (lon, lat) => {
  let dLat = transformLat(lon - 105.0, lat - 35.0)
  let dLon = transformLon(lon - 105.0, lat - 35.0)
  const radLat = lat / 180.0 * Math.PI
  let magic = Math.sin(radLat)
  // 使用正确的地球椭球体扁率常数
  const ee = 0.00669342162296594323 // WGS-84椭球体扁率
  magic = 1 - ee * magic * magic
  const sqrtMagic = Math.sqrt(magic)
  dLat = (dLat * 180.0) / ((6378245.0 * (1 - ee)) / (magic * sqrtMagic) * Math.PI)
  dLon = (dLon * 180.0) / (6378245.0 / sqrtMagic * Math.cos(radLat) * Math.PI)
  return { dLat, dLon }
}

// WGS-84转GCJ-02
// 输入: [longitude, latitude] (WGS-84)
// 输出: [longitude, latitude] (GCJ-02)
export const wgs84ToGcj02 = (wgs84Lon, wgs84Lat) => {
  // 添加输入坐标日志
  console.log(`🔄 坐标转换 - 输入(WGS84): [${wgs84Lon}, ${wgs84Lat}]`)
  
  if (outOfChina(wgs84Lon, wgs84Lat)) {
    console.log(`🌐 坐标在中国境外，无需转换`)
    return [wgs84Lon, wgs84Lat]
  }
  
  const { dLat, dLon } = delta(wgs84Lon, wgs84Lat)
  const gcj02Lon = wgs84Lon + dLon
  const gcj02Lat = wgs84Lat + dLat
  
  // 计算偏移距离（米）
  const offsetDistance = Math.sqrt(dLon * dLon + dLat * dLat) * 111320 // 粗略转换为米
  
  // 添加输出坐标和偏移信息日志
  console.log(`✅ 坐标转换 - 输出(GCJ02): [${gcj02Lon}, ${gcj02Lat}]`)
  console.log(`📏 转换偏移量: 经度${dLon.toFixed(8)}, 纬度${dLat.toFixed(8)}, 距离约${offsetDistance.toFixed(2)}米`)
  
  return [gcj02Lon, gcj02Lat]
}

// 加载高德地图
export const loadAMap = () => {
  return new Promise((resolve, reject) => {
    if (window.AMap) {
      resolve(window.AMap)
      return
    }

    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=2.0&key=30b170859f00b71edbd631aab944129a&callback=onAMapLoaded`
    script.async = true
    
    window.onAMapLoaded = () => {
      console.log('✅ 高德地图基础库加载成功')
      resolve(window.AMap)
    }
    
    script.onerror = reject
    document.head.appendChild(script)
  })
}

// 加载地图控件
export const loadMapControls = () => {
  return new Promise((resolve, reject) => {
    if (window.AMap && window.AMap.Zoom) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=2.0&key=30b170859f00b71edbd631aab944129a&plugin=AMap.Zoom,AMap.Scale`
    script.async = true
    
    script.onload = () => {
      console.log('✅ 高德地图控件加载成功')
      setTimeout(() => {
        if (window.AMap && window.AMap.Zoom) {
          resolve()
        } else {
          reject(new Error('地图控件未正确加载'))
        }
      }, 500)
    }
    
    script.onerror = () => {
      console.error('❌ 高德地图控件加载失败')
      reject(new Error('地图控件加载失败'))
    }
    
    document.head.appendChild(script)
  })
}

// 获取建筑信息
export const getBuildingInfo = (buildingKey) => {
  return campusBuildings[buildingKey] || null
}

// 获取所有建筑列表
export const getAllBuildings = () => {
  return Object.values(campusBuildings)
}

// 根据类型筛选建筑
export const getBuildingsByType = (type) => {
  return getAllBuildings().filter(building => building.type === type)
}

// 搜索建筑
export const searchBuildings = (keyword) => {
  return getAllBuildings().filter(building => 
    building.name.includes(keyword) || 
    building.address.includes(keyword)
  )
}

// 计算两点之间的距离（公里）- 使用location.js中的calculateDistance函数

// 获取用户位置 - 返回GCJ-02坐标系的位置
// 增加重试机制和优化超时设置
export const getUserLocation = () => {
  const MAX_RETRIES = 5; // 增加最大重试次数
  const TIMEOUT_MS = 20000; // 增加超时时间到20秒以提高成功率
  const RETRY_DELAY_MS = 2000; // 增加重试间隔以确保有足够时间重新获取位置
  
  const attemptLocation = (attempt = 1) => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('浏览器不支持地理位置'))
        return
      }

      console.log(`📍 位置获取尝试 ${attempt}/${MAX_RETRIES}`)
      
      // 优化定位策略参数
      const options = {
        // 始终使用高精度模式以获得最准确的位置
        enableHighAccuracy: true,
        // 首次尝试给予更多时间，后续尝试逐步减少但保持合理值
        timeout: Math.max(TIMEOUT_MS - (attempt - 1) * 3000, 10000),
        // 根据尝试次数调整缓存策略
        maximumAge: attempt === 1 ? 0 : (attempt * 30000) // 首次不使用缓存，后续允许使用渐增的缓存时间
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude, accuracy } = position.coords
          
          console.log(`✅ 位置获取成功，精度: ${accuracy}米，尝试次数: ${attempt}`)
          
          // 将WGS-84坐标系转换为GCJ-02坐标系（高德地图使用）
          const [gcj02Lng, gcj02Lat] = wgs84ToGcj02(longitude, latitude)
          
          resolve({
            lng: gcj02Lng,
            lat: gcj02Lat,
            accuracy: accuracy,
            originalLng: longitude,
            originalLat: latitude,
            attempts: attempt
          })
        },
        (error) => {
          console.log(`❌ 位置获取失败，错误码: ${error.code}，尝试次数: ${attempt}`)
          
          // 如果是超时错误且未达到最大重试次数，则进行重试
          if (error.code === error.TIMEOUT && attempt < MAX_RETRIES) {
            console.log(`🔄 准备重试...，延迟: ${RETRY_DELAY_MS}ms`)
            setTimeout(() => {
              attemptLocation(attempt + 1).then(resolve).catch(reject)
            }, RETRY_DELAY_MS)
          } else {
            // 记录尝试次数以便调试
            error.attempts = attempt
            reject(error)
          }
        },
        options
      )
    })
  }
  
  // 开始首次尝试
  return attemptLocation()
}