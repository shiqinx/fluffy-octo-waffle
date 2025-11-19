import request from '@/utils/request'
import { 
  mockActivities,
  mockCreateActivity,
  mockJoinActivity,
  mockAgreeJoinActivity,
  mockCheckInActivity,
  mockSendActivityChat,
  mockGetActivityList,
  mockGetActivityDetail,
  mockGetActivityChatHistory
} from './mock'
import { convertToActivityDTO, convertToPartiDTO, convertToMessageSendDTO, convertToPaginationData } from '@/utils/dataModelConverter'
import { handleApiError } from '@/utils/errorHandler'

// 检查是否使用模拟数据
const useMock = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_BASE_URL

// 创建活动（/api/activity/create）
export const createActivity = async (activityData) => {
  try {
    console.log('创建活动API调用，原始数据:', activityData)
    
    // 直接传递原始数据，不进行转换，因为mock函数期望原始格式
    const response = await mockCreateActivity(activityData)
    console.log('创建活动API响应:', response)
    return response
  } catch (error) {
    console.error('创建活动失败:', error)
    throw error
  }
}

// 加入活动（/api/activity/join）
export const joinActivity = async (activityId, enrollmentData) => {
  try {
    // 转换数据为后端PartiDTO格式
    const partiDTO = convertToPartiDTO({ activityId, ...enrollmentData })
    
    if (useMock) {
      return await mockJoinActivity(activityId)
    }
    
    const response = await request.post('/api/activity/join', partiDTO)
    return response.data || { success: true, data: response }
  } catch (error) {
    return handleApiError(error)
  }
}

// 同意加入活动（/api/activity/agree-join）
export const agreeJoinActivity = async (data) => {
  try {
    // 参数验证
    if (!data || typeof data !== 'object' || !data.activityId || !data.userId) {
      throw new Error('同意加入活动必须包含活动ID和用户ID')
    }
    
    if (useMock) {
      const mockResult = await mockAgreeJoinActivity(data)
      return {
        success: true,
        data: mockResult
      }
    }
    
    // 构造后端期望的ParticipateInActivityResponse数据格式
    const agreementData = {
      activityId: data.activityId,
      userId: data.userId,
      status: data.status || 'approved',
      message: data.message || '申请已通过',
      // 根据后端ParticipateInActivityResponse结构调整
      joinTime: data.joinTime || new Date().toISOString()
    }
    
    const response = await request.post('/api/activity/agree-join', agreementData)
    return response.data || { success: true, data: response }
  } catch (error) {
    return handleApiError(error)
  }
}

// 活动签到（/api/activity/check-in）
export const checkInActivity = async (activityId) => {
  try {
    // 参数验证
    if (!activityId || typeof activityId !== 'string') {
      throw new Error('活动ID必须是有效的字符串')
    }
    
    if (useMock) {
      const mockResult = await mockCheckInActivity(activityId)
      return {
        success: true,
        data: mockResult
      }
    }
    
    const response = await request.post('/api/activity/check-in', { activityId })
    return response.data || { success: true, data: response }
  } catch (error) {
    return handleApiError(error)
  }
}

// 发送活动聊天消息（/api/activity/chat/send）
export const sendActivityChat = async (data) => {
  try {
    // 参数验证
    if (!data || typeof data !== 'object' || !data.activityId || !data.content) {
      throw new Error('聊天消息必须包含活动ID和消息内容')
    }
    
    if (useMock) {
      const mockResult = await mockSendActivityChat(data)
      return {
        success: true,
        data: mockResult
      }
    }
    
    // 后端使用@RequestParam接收activityId，@RequestBody接收content
    // 使用FormData发送混合参数
    const formData = new FormData()
    formData.append('activityId', data.activityId.toString())
    formData.append('content', data.content)
    
    const response = await request.post('/api/activity/chat/send', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    return response.data || { success: true, data: response }
  } catch (error) {
    return handleApiError(error)
  }
}

// 获取活动列表（/api/activity/list）
export const getActivityList = async (params = {}) => {
  try {
    // 确保keyword参数存在，即使为空字符串（适配后端@RequestParam String keyword）
    const requestParams = { keyword: params.keyword || '' }
    
    if (useMock) {
      const mockResponse = await mockGetActivityList(requestParams)
      // 转换分页数据格式
      return convertToPaginationData(mockResponse)
    }
    
    const response = await request.get('/api/activity/list', { params: requestParams })
    // 转换分页数据格式
    return convertToPaginationData(response.data)
  } catch (error) {
    return handleApiError(error)
  }
}

// 获取活动详情（/api/activity/detail/{activityId}）
export const getActivityDetail = async (activityId) => {
  try {
    // 参数验证
    if (!activityId || typeof activityId !== 'string') {
      throw new Error('活动ID必须是有效的字符串')
    }
    
    if (useMock) {
      const mockResponse = await mockGetActivityDetail(activityId)
      // 直接返回 mock 响应，确保格式一致
      return mockResponse
    }
    
    const response = await request.get(`/api/activity/detail/${activityId}`)
    return response.data || { success: true, data: response }
  } catch (error) {
    return handleApiError(error)
  }
}

// 获取活动聊天记录（/api/activity/chat/history/{activityId}）
export const getActivityChatHistory = async (activityId, params = {}) => {
  try {
    // 参数验证
    if (!activityId || typeof activityId !== 'string') {
      throw new Error('活动ID必须是有效的字符串')
    }
    
    // 确保params是对象
    params = params || {}
    
    if (useMock) {
      const mockResponse = await mockGetActivityChatHistory(activityId, params)
      // 转换分页数据格式
      return convertToPaginationData(mockResponse)
    }
    
    const response = await request.get(`/api/activity/chat/history/${activityId}`, { params })
    // 转换分页数据格式
    return convertToPaginationData(response.data)
  } catch (error) {
    return handleApiError(error)
  }
}

// 删除活动（/api/activity/delete/{activityId}）
export const deleteActivity = async (activityId) => {
  try {
    // 参数验证
    if (!activityId || typeof activityId !== 'string') {
      throw new Error('活动ID必须是有效的字符串')
    }
    
    if (useMock) {
      // 提供更完善的mock实现
      return Promise.resolve({
        success: true,
        message: '活动删除成功',
        data: {
          activityId,
          deletedAt: new Date().toISOString()
        }
      })
    }
    
    const response = await request.delete(`/api/activity/delete/${activityId}`)
    return response.data || { success: true, data: response }
  } catch (error) {
    return handleApiError(error)
  }
}

// 编辑活动（/api/activity/edit/{activityId}）
export const editActivity = async (activityId, data) => {
  try {
    // 转换数据为后端ActivityDTO格式
    const activityDTO = convertToActivityDTO(data)
    
    if (useMock) {
      // 提供一个基本的mock实现
      return Promise.resolve({
        success: true,
        message: '活动编辑成功',
        data: { activityId, ...activityDTO }
      })
    }
    
    const response = await request.put(`/api/activity/edit/${activityId}`, activityDTO)
    return response.data || { success: true, data: response }
  } catch (error) {
    return handleApiError(error)
  }
}

// 保留原有函数以保持兼容性
export const getActivities = async (filters = {}) => {
  try {
    return getActivityList(filters)
  } catch (error) {
    return handleApiError(error)
  }
}

export const enrollActivity = async (activityId, enrollmentData) => {
  try {
    return joinActivity(activityId, enrollmentData)
  } catch (error) {
    return handleApiError(error)
  }
}