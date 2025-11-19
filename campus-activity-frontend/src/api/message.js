import request from '@/utils/request'
import { 
  mockSendMessage, 
  mockGetMessageHistory, 
  mockRecallMessage 
} from './mock'
import { convertToMessageSendDTO } from '@/utils/dataModelConverter'
import { handleApiError } from '@/utils/errorHandler'

// 检查是否使用模拟数据
const useMock = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_BASE_URL

// 发送消息（/api/message/send）
export const sendMessage = async (data) => {
  try {
    // 转换数据为后端DTO格式
    const messageDTO = convertToMessageSendDTO(data)
    
    if (useMock) {
      return await mockSendMessage(messageDTO)
    }
    
    const response = await request.post('/api/message/send', messageDTO)
    return response.data || { success: true, data: response }
  } catch (error) {
    return handleApiError(error)
  }
}

// 获取消息历史（/api/message/history）
export const getMessageHistory = (params) => {
  if (useMock) {
    return mockGetMessageHistory(params)
  }
  return request.get('/api/message/history', { params })
}

// 撤回消息（/api/message/recall）
export const recallMessage = (messageId) => {
  if (useMock) {
    return mockRecallMessage(messageId)
  }
  return request.post('/api/message/recall', { messageId })
}