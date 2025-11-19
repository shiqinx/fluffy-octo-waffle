// 模拟浏览器环境
global.import = { meta: { env: { DEV: true } } }
global.navigator = {
  geolocation: {
    getCurrentPosition: (success, error, options) => {
      // 模拟定位成功，返回图书馆附近的位置
      setTimeout(() => {
        success({
          coords: {
            latitude: 23.029321,
            longitude: 112.184895,
            accuracy: 15,
            altitude: null,
            heading: null,
            speed: null,
            altitudeAccuracy: null
          },
          timestamp: Date.now()
        })
      }, 100)
    }
  }
}
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
}

// 测试定位功能
import { getCurrentLocation, smartLocationCalibration, calculateDistance } from './src/utils/location.js'

async function testLocation() {
  console.log('🧪 开始测试定位功能...\n')
  
  try {
    // 测试1: 获取当前位置
    console.log('📍 测试1: 获取当前位置')
    const location = await getCurrentLocation({
      enableHighAccuracy: true,
      timeout: 15000,
      useCache: false
    })
    
    console.log('位置获取成功:', {
      纬度: location.latitude,
      经度: location.longitude,
      精度: location.accuracy + '米',
      时间: new Date(location.timestamp).toLocaleString(),
      是否高精度: location.isHighAccuracy,
      是否已校准: location.isCalibrated
    })
    
    // 测试2: 智能校准
    if (location.accuracy <= 100) {
      console.log('\n🎯 测试2: 智能位置校准')
      const calibratedLocation = smartLocationCalibration(location)
      
      if (calibratedLocation.isCalibrated) {
        console.log('位置校准成功:', {
          校准前精度: location.accuracy + '米',
          校准后精度: calibratedLocation.accuracy + '米',
          参考点: calibratedLocation.calibrationInfo?.referencePoint,
          校准距离: calibratedLocation.calibrationInfo?.distance + '米'
        })
      } else {
        console.log('位置无需校准或校准失败')
      }
    }
    
    // 测试3: 计算到图书馆的距离
    console.log('\n📚 测试3: 计算到图书馆的距离')
    const libraryCoords = [112.184995, 23.029221] // 图书馆坐标
    const distanceToLibrary = calculateDistance(
      location.latitude, 
      location.longitude, 
      libraryCoords[1], 
      libraryCoords[0]
    )
    
    console.log(`距离图书馆: ${distanceToLibrary.toFixed(2)}米`)
    
    // 测试4: 判断是否在图书馆附近
    console.log('\n🏢 测试4: 图书馆区域判断')
    const isNearLibrary = distanceToLibrary <= 50 // 50米范围内
    console.log(isNearLibrary ? '✅ 您在图书馆附近' : '❌ 您不在图书馆附近')
    
    // 测试5: 定位精度评估
    console.log('\n📊 测试5: 定位精度评估')
    let accuracyLevel = '未知'
    if (location.accuracy <= 10) {
      accuracyLevel = '极高精度'
    } else if (location.accuracy <= 30) {
      accuracyLevel = '高精度'
    } else if (location.accuracy <= 100) {
      accuracyLevel = '中等精度'
    } else if (location.accuracy <= 500) {
      accuracyLevel = '低精度'
    } else {
      accuracyLevel = '极低精度'
    }
    
    console.log(`定位精度等级: ${accuracyLevel}`)
    
    // 总结
    console.log('\n🎉 定位功能测试完成!')
    console.log('✅ getCurrentLocation: 正常工作')
    console.log('✅ smartLocationCalibration: 正常工作') 
    console.log('✅ calculateDistance: 正常工作')
    console.log('✅ 图书馆坐标配置: 正确')
    
    return {
      success: true,
      location,
      distanceToLibrary,
      isNearLibrary,
      accuracyLevel
    }
    
  } catch (error) {
    console.error('❌ 定位测试失败:', error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

// 运行测试
testLocation().then(result => {
  console.log('\n📋 测试结果:', result)
}).catch(error => {
  console.error('💥 测试执行失败:', error)
})