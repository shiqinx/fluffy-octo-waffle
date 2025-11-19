// 测试位置校准修复效果
import { getCurrentLocation, smartLocationCalibration, DEFAULT_LOCATION } from './src/utils/location.js'

console.log('🧪 测试位置校准修复效果\n')

// 测试1: 测试默认位置是否会被误校准
console.log('测试1: 默认位置校准测试')
const defaultLocationCalibrated = smartLocationCalibration(DEFAULT_LOCATION)
console.log('默认位置:', DEFAULT_LOCATION)
console.log('校准后:', defaultLocationCalibrated)
console.log('是否被校准:', defaultLocationCalibrated.calibrated)
console.log('校准来源:', defaultLocationCalibrated.calibrationSource || '无')
console.log('---')

// 测试2: 测试接近3栋的位置
console.log('测试2: 接近3栋宿舍的位置')
const nearDorm3Location = {
  latitude: 23.0414,
  longitude: 113.4021,
  accuracy: 50
}
const nearDorm3Calibrated = smartLocationCalibration(nearDorm3Location)
console.log('原始位置:', nearDorm3Location)
console.log('校准后:', nearDorm3Calibrated)
console.log('是否被校准:', nearDorm3Calibrated.calibrated)
console.log('校准来源:', nearDorm3Calibrated.calibrationSource || '无')
console.log('---')

// 测试3: 测试接近图书馆的位置
console.log('测试3: 接近图书馆的位置')
const nearLibraryLocation = {
  latitude: 23.0418,
  longitude: 113.4015,
  accuracy: 30
}
const nearLibraryCalibrated = smartLocationCalibration(nearLibraryLocation)
console.log('原始位置:', nearLibraryLocation)
console.log('校准后:', nearLibraryCalibrated)
console.log('是否被校准:', nearLibraryCalibrated.calibrated)
console.log('校准来源:', nearLibraryCalibrated.calibrationSource || '无')
console.log('---')

// 测试4: 测试校园中心位置（应该不被校准）
console.log('测试4: 校园中心位置')
const campusCenterLocation = {
  latitude: 23.0417,
  longitude: 113.4019,
  accuracy: 100
}
const campusCenterCalibrated = smartLocationCalibration(campusCenterLocation)
console.log('原始位置:', campusCenterLocation)
console.log('校准后:', campusCenterCalibrated)
console.log('是否被校准:', campusCenterCalibrated.calibrated)
console.log('校准来源:', campusCenterCalibrated.calibrationSource || '无')
console.log('---')

// 测试5: 模拟浏览器获取位置（如果支持）
console.log('测试5: 浏览器实际位置获取')
if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
  getCurrentLocation().then(location => {
    console.log('获取到的位置:', location)
    console.log('是否默认位置:', location.isDefault || false)
    console.log('后备原因:', location.fallbackReason || '无')
    console.log('是否校准:', location.calibrated || false)
    console.log('校准来源:', location.calibrationSource || '无')
  }).catch(error => {
    console.log('位置获取失败:', error.message)
  })
} else {
  console.log('当前环境不支持浏览器地理位置API')
  console.log('使用默认位置作为测试')
  console.log('默认位置:', DEFAULT_LOCATION)
}

console.log('\n✅ 位置校准测试完成')