import { batchTestApis, testApiCall } from './dataModelConverter'
import { createTeam, applyTeam } from '@/api/team'
import { createActivity, joinActivity, getActivityList, getActivityDetail, deleteActivity, editActivity, checkInActivity, agreeJoinActivity, sendActivityChat, getActivityChatHistory } from '@/api/activity'
import { sendMessage, getMessageHistory } from '@/api/message'
import { saveLocation, saveUserLocation, saveUserLocationHistory, getUserLocationHistory } from '@/api/location'

/**
 * API接口测试套件
 * 用于验证前端API调用的正确性和稳定性
 */

// 测试数据
const testData = {
  // 团队测试数据
  team: {
    teamName: '测试团队',
    description: '这是一个测试团队',
    maxMembers: 10,
    tags: ['测试', '前端']
  },
  
  // 活动测试数据
  activity: {
    title: '测试活动',
    description: '这是一个测试活动',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 86400000).toISOString(), // 明天
    location: {
      longitude: 116.404,
      latitude: 39.915,
      address: '测试地址'
    },
    maxParticipants: 20,
    tags: ['测试', '学习']
  },
  // 活动编辑数据
  activityEdit: {
    title: '更新后的测试活动',
    description: '这是更新后的测试活动描述',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 172800000).toISOString(), // 后天
    location: {
      longitude: 116.414,
      latitude: 39.925,
      address: '更新后的测试地址'
    },
    tags: ['测试', '更新']
  },
  // 活动加入数据
  activityJoin: {
    userId: 1001,
    userName: '测试用户',
    reason: '我想参加这个测试活动'
  },
  // 活动聊天数据
  activityChat: {
    activityId: '1',
    content: '这是一条活动聊天消息',
    type: 'text'
  },
  // 活动聊天历史查询参数
  activityChatQuery: {
    page: 1,
    pageSize: 20
  },
  
  // 消息测试数据
  message: {
    receiverId: '1',
    receiverType: 'user',
    content: '这是一条测试消息'
  },
  
  // 位置测试数据
  location: {
    // 基本位置数据
    basic: {
      latitude: 39.9042,
      longitude: 116.4074,
      address: '北京市海淀区'
    },
    // 用户位置数据
    userLocation: {
      userId: 1001,
      latitude: 39.9042,
      longitude: 116.4074,
      address: '北京市海淀区',
      accuracy: 10
    },
    // 位置历史数据
    locationHistory: [
      {
        userId: 1001,
        latitude: 39.9042,
        longitude: 116.4074,
        address: '校园内',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        accuracy: 10
      },
      {
        userId: 1001,
        latitude: 39.9043,
        longitude: 116.4075,
        address: '图书馆附近',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        accuracy: 15
      }
    ],
    // 位置历史查询参数
    historyQuery: {
      userId: 1001,
      page: 1,
      pageSize: 20
    }
  }
}

/**
 * 运行API测试
 * 可以在开发环境中运行，验证API调用是否正常
 */
export const runApiTests = async () => {
  const tests = [
    {
      api: createTeam,
      params: [testData.team],
      description: '测试创建团队API'
    },
    {
      api: createActivity,
      params: [testData.activity],
      description: '测试创建活动API'
    },
    {      
      api: getActivityList,
      params: [{}],
      description: '测试获取活动列表API'
    },
    {      
      api: getActivityDetail,
      params: ['1'],
      description: '测试获取活动详情API'
    },
    {      
      api: editActivity,
      params: ['1', testData.activityEdit],
      description: '测试编辑活动API'
    },
    {      
      api: deleteActivity,
      params: ['2'],
      description: '测试删除活动API'
    },
    {      
      api: joinActivity,
      params: ['1', testData.activityJoin],
      description: '测试加入活动API'
    },
    {      
      api: checkInActivity,
      params: ['1'],
      description: '测试活动签到API'
    },
    {      
      api: sendActivityChat,
      params: [testData.activityChat],
      description: '测试发送活动聊天API'
    },
    {      
      api: getActivityChatHistory,
      params: ['1', testData.activityChatQuery],
      description: '测试获取活动聊天历史API'
    },
    {
      api: sendMessage,
      params: [testData.message],
      description: '测试发送消息API'
    },
    {
      api: getMessageHistory,
      params: [{ receiverId: '1', receiverType: 'user' }],
      description: '测试获取消息历史API'
    },
    // 位置相关API测试
    {
      api: saveLocation,
      params: [testData.location.basic],
      description: '测试保存位置API'
    },
    {
      api: saveUserLocation,
      params: [testData.location.userLocation],
      description: '测试保存用户位置API'
    },
    {
      api: saveUserLocationHistory,
      params: [testData.location.locationHistory],
      description: '测试批量保存用户位置历史API'
    },
    {
      api: getUserLocationHistory,
      params: [testData.location.historyQuery],
      description: '测试获取用户位置历史API'
    }
  ]

  return await batchTestApis(tests)
}

/**
 * 单独测试某个API
 * @param {Function} apiFunction - API函数
 * @param {Array} params - API参数
 * @returns {Promise} - 测试结果
 */
export const testSingleApi = async (apiFunction, params = []) => {
  return await testApiCall(apiFunction, params)
}

/**
 * 性能测试API调用
 * @param {Function} apiFunction - API函数
 * @param {Array} params - API参数
 * @param {number} iterations - 迭代次数
 * @returns {Promise} - 性能测试结果
 */
export const performanceTestApi = async (apiFunction, params = [], iterations = 5) => {
  console.log(`\n========== 开始API性能测试 ==========`)
  console.log(`API函数: ${apiFunction.name}`)
  console.log(`迭代次数: ${iterations}`)
  
  const times = []
  let successCount = 0
  
  for (let i = 0; i < iterations; i++) {
    console.log(`\n迭代 ${i + 1}/${iterations}:`)
    
    const startTime = performance.now()
    const result = await testApiCall(apiFunction, params)
    const endTime = performance.now()
    
    const duration = endTime - startTime
    times.push(duration)
    
    console.log(`执行时间: ${duration.toFixed(2)}ms`)
    
    if (result.success) {
      successCount++
    }
  }
  
  // 计算统计信息
  const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length
  const minTime = Math.min(...times)
  const maxTime = Math.max(...times)
  
  console.log('\n========== 性能测试结果 ==========')
  console.log(`平均响应时间: ${avgTime.toFixed(2)}ms`)
  console.log(`最小响应时间: ${minTime.toFixed(2)}ms`)
  console.log(`最大响应时间: ${maxTime.toFixed(2)}ms`)
  console.log(`成功率: ${(successCount / iterations * 100).toFixed(2)}%`)
  
  return {
    function: apiFunction.name,
    iterations,
    successCount,
    avgTime,
    minTime,
    maxTime,
    successRate: successCount / iterations * 100
  }
}

/**
 * 测试位置API的错误处理
 * @returns {Promise<Array>} - 错误测试结果
 */
export const testLocationApiErrorHandling = async () => {
  console.log('\n========== 测试位置API错误处理 ==========')
  
  const errorTests = [
    {
      api: saveLocation,
      params: [{}],
      description: '测试保存位置API - 缺少必填字段'
    },
    {
      api: saveLocation,
      params: [{ latitude: 'invalid', longitude: 116.4074 }],
      description: '测试保存位置API - 无效的经纬度格式'
    },
    {
      api: saveUserLocationHistory,
      params: [null],
      description: '测试批量保存位置历史API - 无效的数组参数'
    },
    {
      api: saveUserLocationHistory,
      params: [[]],
      description: '测试批量保存位置历史API - 空数组'
    },
    {
      api: getUserLocationHistory,
      params: [{}],
      description: '测试获取位置历史API - 缺少必要查询参数'
    },
    {
      api: getUserLocationHistory,
      params: [{ userId: 1001, pageSize: 200 }],
      description: '测试获取位置历史API - 超出限制的pageSize'
    }
  ]
  
  const results = []
  
  for (const test of errorTests) {
    console.log(`\n${test.description}`)
    const result = await testApiCall(test.api, test.params)
    results.push({ test, result })
    console.log(`预期失败，实际结果: ${result.success ? '成功' : '失败'}`)
    console.log(`错误信息: ${result.message || '无'}`)
  }
  
  return results
}

/**
 * 性能测试位置API
 * @param {number} iterations - 迭代次数
 * @returns {Promise<Object>} - 性能测试结果
 */
export const performanceTestLocationApis = async (iterations = 3) => {
  console.log('\n========== 开始位置API性能测试 ==========')
  
  const locationApis = [
    { api: saveLocation, params: [testData.location.basic], description: '保存位置API' },
    { api: saveUserLocation, params: [testData.location.userLocation], description: '保存用户位置API' },
    { api: getUserLocationHistory, params: [testData.location.historyQuery], description: '获取位置历史API' }
  ]
  
  const results = {}
  
  for (const { api, params, description } of locationApis) {
    console.log(`\n${description} 性能测试:`)
    results[api.name] = await performanceTestApi(api, params, iterations)
  }
  
  return results
}

/**
 * 测试活动API的错误处理
 * @returns {Promise<Array>} - 错误测试结果
 */
export const testActivityApiErrorHandling = async () => {
  console.log('\n========== 测试活动API错误处理 ==========')
  
  const errorTests = [
    {
      api: getActivityDetail,
      params: [null],
      description: '测试获取活动详情API - 无效的活动ID'
    },
    {
      api: getActivityDetail,
      params: [''],
      description: '测试获取活动详情API - 空活动ID'
    },
    {
      api: deleteActivity,
      params: [123],
      description: '测试删除活动API - 无效的ID类型'
    },
    {
      api: editActivity,
      params: ['1', {}],
      description: '测试编辑活动API - 缺少必要字段'
    },
    {
      api: joinActivity,
      params: ['1', {}],
      description: '测试加入活动API - 缺少加入信息'
    }
  ]
  
  const results = []
  
  for (const test of errorTests) {
    console.log(`\n${test.description}`)
    const result = await testApiCall(test.api, test.params)
    results.push({ test, result })
    console.log(`预期失败，实际结果: ${result.success ? '成功' : '失败'}`)
    console.log(`错误信息: ${result.message || '无'}`)
  }
  
  return results
}

/**
 * 性能测试活动API
 * @param {number} iterations - 迭代次数
 * @returns {Promise<Object>} - 性能测试结果
 */
export const performanceTestActivityApis = async (iterations = 3) => {
  console.log('\n========== 开始活动API性能测试 ==========')
  
  const activityApis = [
    { api: createActivity, params: [testData.activity], description: '创建活动API' },
    { api: getActivityList, params: [{}], description: '获取活动列表API' },
    { api: getActivityDetail, params: ['1'], description: '获取活动详情API' }
  ]
  
  const results = {}
  
  for (const { api, params, description } of activityApis) {
    console.log(`\n${description} 性能测试:`)
    results[api.name] = await performanceTestApi(api, params, iterations)
  }
  
  return results
}

export default {
  runApiTests,
  testSingleApi,
  performanceTestApi,
  testLocationApiErrorHandling,
  performanceTestLocationApis,
  testActivityApiErrorHandling,
  performanceTestActivityApis
}