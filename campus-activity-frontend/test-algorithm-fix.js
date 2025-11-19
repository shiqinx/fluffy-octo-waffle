// 测试定位算法修复效果
import { smartLocationCalibration } from './src/utils/location.js'

// 测试用例
const testCases = [
  {
    name: '图书馆正中心',
    location: { latitude: 23.0419, longitude: 113.4016, accuracy: 50 },
    expected: '图书馆'
  },
  {
    name: '图书馆附近',
    location: { latitude: 23.04195, longitude: 113.40165, accuracy: 50 },
    expected: '图书馆'
  },
  {
    name: '图书馆边缘',
    location: { latitude: 23.04185, longitude: 113.40155, accuracy: 50 },
    expected: '图书馆'
  },
  {
    name: '3栋宿舍附近',
    location: { latitude: 23.0413, longitude: 113.4022, accuracy: 50 },
    expected: '3栋宿舍'
  },
  {
    name: '图书馆与宿舍之间',
    location: { latitude: 23.0417, longitude: 113.4018, accuracy: 50 },
    expected: '图书馆' // 应该优先识别图书馆
  }
]

console.log('🧪 开始测试定位算法修复效果...\n')

testCases.forEach((testCase, index) => {
  console.log(`测试 ${index + 1}: ${testCase.name}`)
  console.log(`输入坐标: ${testCase.location.latitude}, ${testCase.location.longitude}`)
  
  const result = smartLocationCalibration(testCase.location)
  
  console.log(`识别结果: ${result.calibrationSource || '未识别'}`)
  console.log(`期望结果: ${testCase.expected}`)
  console.log(`校准状态: ${result.calibrated ? '已校准' : '未校准'}`)
  console.log(`置信度: ${result.confidence || '无'}`)
  console.log(`权重得分: ${result.weightedScore?.toFixed(3) || '无'}`)
  
  const success = result.calibrationSource === testCase.expected
  console.log(`测试结果: ${success ? '✅ 通过' : '❌ 失败'}`)
  console.log('---\n')
})

console.log('🎯 测试完成！')