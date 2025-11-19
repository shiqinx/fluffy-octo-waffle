// 定位功能测试脚本
// 用于测试优化后的定位功能

import { getCurrentLocation, smartLocationCalibration, calculateDistance } from '../src/utils/location.js'

// 测试配置
const TEST_CONFIG = {
  // 图书馆坐标
  library: {
    latitude: 23.029221,
    longitude: 112.184995,
    name: '图书馆'
  },
  // 校园中心坐标
  campusCenter: {
    latitude: 23.0289,
    longitude: 112.1848,
    name: '校园中心'
  }
}

// 测试函数
async function testLocationAccuracy() {
  console.log('🧪 开始测试定位功能...')
  
  try {
    // 1. 测试基础定位
    console.log('\n📍 测试1: 基础定位功能')
    const location = await getCurrentLocation({
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
      retryCount: 3,
      useCache: false,
      validateLocation: true
    })
    
    console.log('定位结果:', {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      source: location.source,
      calibrated: location.calibrated
    })
    
    // 2. 测试智能校准
    console.log('\n🔧 测试2: 智能位置校准')
    const calibratedLocation = smartLocationCalibration(location)
    console.log('校准后位置:', {
      latitude: calibratedLocation.latitude,
      longitude: calibratedLocation.longitude,
      accuracy: calibratedLocation.accuracy,
      calibrated: calibratedLocation.calibrated,
      calibrationSource: calibratedLocation.calibrationSource
    })
    
    // 3. 测试距离计算
    console.log('\n📏 测试3: 距离计算')
    const distanceToLibrary = calculateDistance(
      location.latitude,
      location.longitude,
      TEST_CONFIG.library.latitude,
      TEST_CONFIG.library.longitude
    )
    console.log(`距离图书馆: ${distanceToLibrary.toFixed(2)} 米`)
    
    const distanceToCampusCenter = calculateDistance(
      location.latitude,
      location.longitude,
      TEST_CONFIG.campusCenter.latitude,
      TEST_CONFIG.campusCenter.longitude
    )
    console.log(`距离校园中心: ${distanceToCampusCenter.toFixed(2)} 米`)
    
    // 4. 分析结果
    console.log('\n📊 测试结果分析:')
    console.log(`- 定位精度: ${location.accuracy}米 ${location.accuracy < 50 ? '✅ 良好' : '⚠️ 需要改进'}`)
    console.log(`- 是否校准: ${calibratedLocation.calibrated ? '✅ 已校准' : '❌ 未校准'}`)
    console.log(`- 校准源: ${calibratedLocation.calibrationSource || '无'}`)
    console.log(`- 距离图书馆: ${distanceToLibrary}米 ${distanceToLibrary < 100 ? '✅ 在图书馆附近' : '❌ 不在图书馆附近'}`)
    
    return {
      success: true,
      location,
      calibratedLocation,
      distanceToLibrary,
      distanceToCampusCenter
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 模拟图书馆位置测试
function testLibraryLocationSimulation() {
  console.log('\n🏛️ 测试4: 模拟图书馆位置')
  
  // 模拟在图书馆附近的位置（带一定误差）
  const simulatedLibraryLocation = {
    latitude: TEST_CONFIG.library.latitude + 0.0001, // 约11米误差
    longitude: TEST_CONFIG.library.longitude + 0.0001, // 约11米误差
    accuracy: 30,
    source: 'simulation'
  }
  
  console.log('模拟位置:', simulatedLibraryLocation)
  
  // 测试校准
  const calibrated = smartLocationCalibration(simulatedLibraryLocation)
  console.log('校准结果:', calibrated)
  
  const distanceAfterCalibration = calculateDistance(
    calibrated.latitude,
    calibrated.longitude,
    TEST_CONFIG.library.latitude,
    TEST_CONFIG.library.longitude
  )
  
  console.log(`校准后距离图书馆: ${distanceAfterCalibration.toFixed(2)}米`)
  console.log(`校准效果: ${distanceAfterCalibration < 10 ? '✅ 优秀' : distanceAfterCalibration < 50 ? '✅ 良好' : '⚠️ 需要改进'}`)
  
  return {
    simulatedLocation: simulatedLibraryLocation,
    calibratedLocation: calibrated,
    distanceAfterCalibration
  }
}

// 导出测试函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testLocationAccuracy,
    testLibraryLocationSimulation,
    TEST_CONFIG
  }
}

// 如果在浏览器环境中，添加到全局对象
if (typeof window !== 'undefined') {
  window.LocationTests = {
    testLocationAccuracy,
    testLibraryLocationSimulation,
    TEST_CONFIG
  }
}

console.log('🧪 定位测试脚本已加载')
console.log('使用方法:')
console.log('- 在浏览器控制台运行: LocationTests.testLocationAccuracy()')
console.log('- 测试图书馆位置: LocationTests.testLibraryLocationSimulation()')