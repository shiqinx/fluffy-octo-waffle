import request from '@/utils/request'
import { mockSaveUserLocation } from './mock'
import { convertToLocationDTO, convertToUserLocationDTO, convertToLocationHistoryDTO, convertToPaginationData } from '@/utils/dataModelConverter'
import { handleApiError } from '@/utils/errorHandler'

// 检查是否使用模拟数据
const useMock = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_BASE_URL

// 保存位置信息（LocationController）
// POST /api/location/save
export const saveLocation = async (locationData) => {
  try {
    // 验证必要字段
    if (!locationData) {
      throw new Error('位置数据不能为空')
    }
    
    // 验证经纬度字段
    if (typeof locationData.centerLatitude !== 'number' || typeof locationData.centerLongitude !== 'number') {
      throw new Error('位置数据必须包含有效的经纬度信息')
    }
    
    // 验证必要的字符串字段
    if (!locationData.regionName || typeof locationData.regionName !== 'string') {
      throw new Error('区域名称必须是有效的字符串')
    }
    
    if (!locationData.administrativeCode || typeof locationData.administrativeCode !== 'string') {
      throw new Error('行政区划代码必须是有效的字符串')
    }
    
    if (!locationData.regionType || typeof locationData.regionType !== 'string') {
      throw new Error('区域类型必须是有效的字符串')
    }
    
    // 验证区域半径
    if (typeof locationData.regionRadius !== 'number' || locationData.regionRadius <= 0) {
      throw new Error('区域半径必须是大于0的数字')
    }
    
    // 构建符合LocationRequest接口的请求数据
    const locationDTO = {
      regionName: locationData.regionName,
      centerLatitude: locationData.centerLatitude,
      centerLongitude: locationData.centerLongitude,
      administrativeCode: locationData.administrativeCode,
      regionType: locationData.regionType,
      detailAddress: locationData.detailAddress || '',
      regionRadius: locationData.regionRadius
    }
    
    if (useMock) {
      // 简单的Mock保存位置
      const response = {
        success: true,
        message: '位置信息保存成功',
        data: locationDTO
      }
      
      return {
        success: true,
        message: response.message || '保存位置信息成功',
        result: response.data
      }
    }
    
    const response = await request.post('/api/location/save', locationDTO)
    
    // 处理后端字符串响应格式
    let success = false
    let message = ''
    
    if (typeof response === 'string') {
      // 后端返回纯字符串，判断是否包含成功关键词
      success = response.includes('成功')
      message = response
    } else if (response && typeof response === 'object') {
      // 后端返回JSON格式（可能是未来的统一格式）
      success = response.success !== false
      message = response.message || '保存位置信息成功'
    } else {
      // 其他情况，默认认为成功
      success = true
      message = '保存位置信息成功'
    }
    
    if (!success) {
      throw new Error(message || '保存位置信息失败')
    }
    
    return {
      success: true,
      message: message,
      result: null
    }
  } catch (error) {
    return handleApiError(error, '保存位置信息失败')
  }
}

// 保存用户位置信息（UserLocationController）
// POST /api/user-location/save
export const saveUserLocation = async (locationData) => {
  try {
    console.log('保存用户位置，原始数据:', locationData)
    
    // 验证必要字段
    if (!locationData) {
      throw new Error('位置数据不能为空')
    }
    
    if (typeof locationData.latitude !== 'number' || typeof locationData.longitude !== 'number') {
      throw new Error('位置数据必须包含有效的经纬度信息')
    }
    
    if (typeof locationData.userId !== 'number') {
      throw new Error('用户ID必须是有效的数字')
    }
    
    // 确保validTime字段存在且为有效数字
    if (!locationData.validTime || typeof locationData.validTime !== 'number' || locationData.validTime <= 0) {
      throw new Error('有效时间必须是大于0的数字')
    }
    
    // 构建符合后端userLocationRequest接口的请求数据
    // 注意：字段名要与后端DTO完全匹配
    const userLocationRequest = {
      userId: locationData.userId,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      validTime: locationData.validTime,
      address: locationData.address || '',
      timestamp: locationData.timestamp || new Date().toISOString(),
      accuracy: locationData.accuracy || null
    }
    
    console.log('发送到后端的数据:', userLocationRequest)
    
    if (useMock) {
      const result = await mockSaveUserLocation(userLocationRequest)
      console.log('Mock返回结果:', result)
      return result
    }
    
    const response = await request.post('/api/user-location/save', userLocationRequest)
    console.log('后端返回响应:', response)
    
    // 处理后端返回的字符串响应（根据后端Controller代码）
    if (typeof response === 'string') {
      return {
        success: true,
        message: response,
        result: null
      }
    }
    
    // 验证响应格式
    if (response && !response.success) {
      throw new Error(response.message || '保存用户位置失败')
    }
    
    return {
      success: true,
      message: response.message || '保存用户位置成功',
      result: response.data || null
    }
  } catch (error) {
    console.error('保存用户位置失败:', error)
    return handleApiError(error, '保存用户位置失败')
  }
}

// 批量保存用户位置历史记录
export const saveUserLocationHistory = async (locationHistory) => {
  try {
    // 验证必要字段
    if (!Array.isArray(locationHistory)) {
      throw new Error('位置历史数据必须是数组格式')
    }
    
    if (locationHistory.length === 0) {
      throw new Error('位置历史数据不能为空数组')
    }
    
    // 验证数组中每个位置对象的有效性
    const invalidLocations = locationHistory.filter(loc => 
      !loc || typeof loc.latitude !== 'number' || typeof loc.longitude !== 'number'
    )
    
    if (invalidLocations.length > 0) {
      throw new Error(`发现${invalidLocations.length}条无效的位置记录，必须包含有效的经纬度`)
    }
    
    // 转换数据格式
    const convertedLocations = convertToLocationHistoryDTO(locationHistory)
    
    if (useMock) {
      // 模拟批量保存位置历史
      await new Promise(resolve => setTimeout(resolve, 500))
      return {
        success: true,
        message: `成功保存${convertedLocations.length}条位置记录`,
        result: { savedCount: convertedLocations.length }
      }
    }
    
    const response = await request.post('/api/user-location/history/save', {
      locations: convertedLocations
    })
    
    // 验证响应格式
    if (response && !response.success) {
      throw new Error(response.message || '批量保存位置历史失败')
    }
    
    return {
      success: true,
      message: `成功保存${convertedLocations.length}条位置记录`,
      result: response.data || { savedCount: convertedLocations.length }
    }
  } catch (error) {
    return handleApiError(error, '批量保存位置历史失败')
  }
}

// 获取用户位置历史记录
export const getUserLocationHistory = async (params) => {
  try {
    // 参数解构和默认值设置
    const { userId, startTime, endTime, page = 1, pageSize = 20 } = params || {}
    
    // 验证必要参数
    if (!userId && !startTime && !endTime) {
      throw new Error('查询参数中至少需要提供userId、startTime或endTime之一')
    }
    
    // 验证分页参数
    const pageNum = parseInt(page) || 1
    const size = parseInt(pageSize) || 20
    
    if (size > 100) {
      throw new Error('每页记录数不能超过100条')
    }
    
    if (useMock) {
      // 模拟获取位置历史
      await new Promise(resolve => setTimeout(resolve, 300))
      const mockData = {
        list: [
          {
            id: Date.now() - 3600000,
            userId: userId || 1001,
            latitude: 39.9042,
            longitude: 116.4074,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            accuracy: 10,
            address: '校园内'
          },
          {
            id: Date.now() - 7200000,
            userId: userId || 1001,
            latitude: 39.9043,
            longitude: 116.4075,
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            accuracy: 15,
            address: '图书馆附近'
          }
        ],
        total: 2,
        page: pageNum,
        pageSize: size
      }
      
      // 标准化分页数据
      const paginationData = convertToPaginationData(mockData)
      
      return {
        success: true,
        message: '获取位置历史记录成功',
        result: paginationData
      }
    }
    
    const response = await request.get('/api/user-location/history', {
      params: { 
        userId: userId ? parseInt(userId) : undefined, 
        startTime, 
        endTime, 
        page: pageNum, 
        pageSize: size 
      }
    })
    
    // 验证响应格式
    if (response && !response.success) {
      throw new Error(response.message || '获取位置历史记录失败')
    }
    
    // 标准化分页数据格式
    const paginationData = convertToPaginationData(response.data || {})
    
    return {
      success: true,
      message: '获取位置历史记录成功',
      result: paginationData
    }
  } catch (error) {
    return handleApiError(error, '获取位置历史记录失败')
  }
}

// 更新用户位置信息
export const updateLocation = async (location) => {
  try {
    // 验证必要字段
    if (!location) {
      throw new Error('位置数据不能为空')
    }
    
    if (typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
      throw new Error('位置数据必须包含有效的经纬度信息')
    }
    
    if (useMock) {
      // 模拟更新位置
      await new Promise(resolve => setTimeout(resolve, 200))
      return {
        success: true,
        message: '位置更新成功',
        result: location
      }
    }
    
    const response = await request.post('/api/location/update', location)
    
    // 验证响应格式
    if (response && !response.success) {
      throw new Error(response.message || '更新位置失败')
    }
    
    return {
      success: true,
      message: response.message || '位置更新成功',
      result: response.data || location
    }
  } catch (error) {
    return handleApiError(error, '更新位置失败')
  }
}

// 获取附近的活动
export const getNearbyActivities = async (params) => {
  try {
    // 参数解构和默认值设置
    const { latitude, longitude, radius = 5000, page = 1, pageSize = 20 } = params || {}
    
    // 验证必要参数
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      throw new Error('必须提供有效的经纬度信息')
    }
    
    if (typeof radius !== 'number' || radius <= 0) {
      throw new Error('搜索半径必须是大于0的数字')
    }
    
    // 验证分页参数
    const pageNum = parseInt(page) || 1
    const size = parseInt(pageSize) || 20
    
    if (size > 100) {
      throw new Error('每页记录数不能超过100条')
    }
    
    if (useMock) {
      // 模拟获取附近活动
      await new Promise(resolve => setTimeout(resolve, 300))
      const mockData = {
        list: [
          {
            id: Date.now() - 3600000,
            title: '校园篮球赛',
            description: '下午3点在体育馆举行篮球比赛',
            latitude: latitude + 0.001,
            longitude: longitude + 0.001,
            distance: 100,
            startTime: new Date(Date.now() + 3600000).toISOString(),
            endTime: new Date(Date.now() + 7200000).toISOString(),
            location: '体育馆',
            participantCount: 8,
            maxParticipants: 20
          },
          {
            id: Date.now() - 7200000,
            title: '读书分享会',
            description: '图书馆三楼会议室举行读书分享活动',
            latitude: latitude - 0.001,
            longitude: longitude - 0.001,
            distance: 200,
            startTime: new Date(Date.now() + 1800000).toISOString(),
            endTime: new Date(Date.now() + 5400000).toISOString(),
            location: '图书馆',
            participantCount: 15,
            maxParticipants: 30
          }
        ],
        total: 2,
        page: pageNum,
        pageSize: size
      }
      
      // 标准化分页数据
      const paginationData = convertToPaginationData(mockData)
      
      return {
        success: true,
        message: '获取附近活动成功',
        result: paginationData
      }
    }
    
    const response = await request.get('/api/location/nearby-activities', {
      params: { 
        latitude, 
        longitude, 
        radius, 
        page: pageNum, 
        pageSize: size 
      }
    })
    
    // 验证响应格式
    if (response && !response.success) {
      throw new Error(response.message || '获取附近活动失败')
    }
    
    // 标准化分页数据格式
    const paginationData = convertToPaginationData(response.data || {})
    
    return {
      success: true,
      message: '获取附近活动成功',
      result: paginationData
    }
  } catch (error) {
    return handleApiError(error, '获取附近活动失败')
  }
}