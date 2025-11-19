import request from '@/utils/request'
import { 
  mockGetMessageHistory, 
  mockGetActivityChatRooms,
  mockSendActivityMessage,
  mockGetActivityChatMembers
} from './mock'
import { handleApiError } from '@/utils/errorHandler'

// 检查是否使用模拟数据
const useMock = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_BASE_URL

// 获取聊天消息历史（/api/chat/history/{activityId}）
export const getMessageHistory = async (activityId) => {
  try {
    if (useMock) {
      return await mockGetMessageHistory(activityId)
    }
    
    const response = await request.get(`/api/chat/history/${activityId}`)
    return response.data || { success: true, data: response }
  } catch (error) {
    return handleApiError(error)
  }
}

// 获取聊天室成员（/api/chat/members/{activityId}）
export const getMembers = async (activityId) => {
  try {
    if (useMock) {
      return await mockGetActivityChatMembers(activityId)
    }
    
    const response = await request.get(`/api/chat/members/${activityId}`)
    return response.data || { success: true, data: response }
  } catch (error) {
    return handleApiError(error)
  }
}

// 获取活动聊天室列表
export const getActivityChatRooms = async () => {
  try {
    if (useMock) {
      return await mockGetActivityChatRooms()
    }
    
    const response = await request.get('/api/chat/activity-rooms')
    return response.data || { success: true, data: response }
  } catch (error) {
    return handleApiError(error)
  }
}

// 发送活动聊天消息
export const sendActivityMessage = async (activityId, content) => {
  try {
    if (useMock) {
      return await mockSendActivityMessage(activityId, content)
    }
    
    const response = await request.post(`/api/chat/activity/${activityId}/send`, { content })
    return response.data || { success: true, data: response }
  } catch (error) {
    return handleApiError(error)
  }
}

// 发送聊天消息（通过WebSocket，此处仅作备用）
export const sendMessage = async (messageData) => {
  try {
    if (useMock) {
      // 在模拟模式下，消息通过WebSocket模拟处理
      return { success: true, data: messageData }
    }
    
    // 实际项目中，消息主要通过WebSocket发送
    // 这里提供一个HTTP备用接口
    const response = await request.post('/api/chat/send', messageData)
    return response.data || { success: true, data: response }
  } catch (error) {
    return handleApiError(error)
  }
}

// 导出为chatAPI对象以匹配store中的导入
export const chatAPI = {
  getMessageHistory,
  getMembers,
  sendMessage,
  getActivityChatRooms,
  sendActivityMessage
}