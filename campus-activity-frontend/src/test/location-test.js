// 测试用户位置保存功能
import { saveUserLocation } from '../api/location.js'

// 测试数据
const testLocationData = {
  userId: 1001,
  latitude: 39.9042,
  longitude: 116.4074,
  validTime: 3600, // 1小时有效期
  address: '北京市朝阳区',
  timestamp: new Date().toISOString(),
  accuracy: 10
}

// 测试函数
async function testSaveUserLocation() {
  console.log('========== 开始测试用户位置保存功能 ==========')
  
  try {
    console.log('\n1. 测试正常数据保存')
    const result1 = await saveUserLocation(testLocationData)
    console.log('测试结果1:', result1)
    
    console.log('\n2. 测试缺少validTime的数据')
    const invalidData1 = { ...testLocationData, validTime: null }
    const result2 = await saveUserLocation(invalidData1)
    console.log('测试结果2:', result2)
    
    console.log('\n3. 测试缺少经纬度的数据')
    const invalidData2 = { ...testLocationData, latitude: null }
    const result3 = await saveUserLocation(invalidData2)
    console.log('测试结果3:', result3)
    
  } catch (error) {
    console.error('测试过程中发生错误:', error)
  }
  
  console.log('\n========== 测试完成 ==========')
}

// 导出测试函数
export { testSaveUserLocation }

// 如果直接运行此文件，执行测试
if (typeof window !== 'undefined') {
  // 浏览器环境下，将测试函数添加到全局对象
  window.testSaveUserLocation = testSaveUserLocation
  console.log('测试函数已添加到全局对象，可以在控制台运行: testSaveUserLocation()')
}