import request from '@/utils/request'
import { 
  mockSendMessage,
  mockRecallMessage,
  mockGetMessageHistory,
  mockGetActivityMessageHistory
} from './mock'

// 检查是否使用模拟数据
const useMock = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_BASE_URL

// 发送消息（/api/messages/send）
export const sendMessage = async (params) => {
  try {
    // 验证必要参数
    if (!params) {
      throw new Error('消息参数不能为空')
    }
    
    const { receiveId, content, type = 'text' } = params
    
    if (!receiveId) {
      throw new Error('接收者ID不能为空')
    }
    
    if (!content || typeof content !== 'string' || content.trim() === '') {
      throw new Error('消息内容不能为空且必须是有效的文本')
    }
    
    // 验证消息类型
    const validTypes = ['text', 'image', 'system']
    if (!validTypes.includes(type)) {
      throw new Error('无效的消息类型')
    }
    
    // 构建消息DTO
    const messageDTO = {
      receiveId,
      content: content.trim(),
      type,
      sentAt: new Date().toISOString()
    }
    
    if (useMock) {
      // 模拟发送消息
      await new Promise(resolve => setTimeout(resolve, 300))
      return {
        success: true,
        message: '消息发送成功',
        result: {
          messageId: Date.now(),
          ...messageDTO
        }
      }
    }
    
    // 导入数据转换函数
    const { convertToMessageSendDTO } = await import('@/utils/dataModelConverter')
    const sendData = convertToMessageSendDTO(messageDTO)
    
    const response = await request.post('/api/messages/send', sendData)
    
    // 处理响应格式（支持字符串和对象）
    if (typeof response === 'string') {
      return {
        success: response.includes('成功'),
        message: response,
        result: {}
      }
    }
    
    if (response && typeof response === 'object') {
      return {
        success: true,
        message: '消息发送成功',
        result: response.data || response
      }
    }
    
    return {
      success: true,
      message: '消息发送成功',
      result: {}
    }
  } catch (error) {
    // 导入错误处理函数
    const { handleApiError } = await import('@/utils/dataModelConverter')
    return handleApiError(error, '消息发送失败')
  }
}

// 撤回消息（/api/messages/recall）
export const recallMessage = async (recallData) => {
  try {
    // 验证必要参数
    if (!recallData) {
      throw new Error('撤回消息参数不能为空')
    }
    
    const { messageId, senderId, receiverId, sentAt } = recallData
    
    if (!messageId) {
      throw new Error('消息ID不能为空')
    }
    
    if (!senderId) {
      throw new Error('发送者ID不能为空')
    }
    
    if (!receiverId) {
      throw new Error('接收者ID不能为空')
    }
    
    // 构建撤回消息请求
    const recallRequest = {
      messageId,
      senderId,
      receiverId,
      sentAt: sentAt || new Date().toISOString()
    }
    
    if (useMock) {
      // 模拟撤回消息
      await new Promise(resolve => setTimeout(resolve, 300))
      return {
        success: true,
        message: '消息撤回成功',
        result: {
          messageId: messageId,
          recalled: true,
          recallTime: new Date().toISOString()
        }
      }
    }
    
    // 导入数据转换函数
    const { convertToRecallMessageRequest } = await import('@/utils/dataModelConverter')
    const requestData = convertToRecallMessageRequest(recallRequest)
    
    const response = await request.post('/api/messages/recall', requestData)
    
    // 处理响应格式（支持字符串和对象）
    if (typeof response === 'string') {
      return {
        success: response.includes('成功'),
        message: response,
        result: { messageId }
      }
    }
    
    if (response && typeof response === 'object') {
      return {
        success: true,
        message: '消息撤回成功',
        result: response.data || { messageId }
      }
    }
    
    return {
      success: true,
      message: '消息撤回成功',
      result: { messageId }
    }
  } catch (error) {
    // 导入错误处理函数
    const { handleApiError } = await import('@/utils/dataModelConverter')
    return handleApiError(error, '消息撤回失败')
  }
}

// 获取个人消息历史（/api/messages/history）
export const getMessageHistory = async (params) => {
  try {
    // 验证必要参数
    if (!params) {
      throw new Error('查询参数不能为空')
    }
    
    const { receiveId, page = 1, pageSize = 20 } = params
    
    if (!receiveId) {
      throw new Error('接收者ID不能为空')
    }
    
    // 验证分页参数
    const pageNum = parseInt(page) || 1
    const size = parseInt(pageSize) || 20
    
    if (useMock) {
      // 模拟获取消息历史
      await new Promise(resolve => setTimeout(resolve, 300))
      const mockHistory = [
        {
          receiveId: receiveId,
          senderName: '系统管理员',
          content: '欢迎使用校园活动平台',
          sentAt: new Date().toISOString()
        },
        {
          receiveId: receiveId,
          senderName: '活动助手',
          content: '您有新的活动邀请',
          sentAt: new Date(Date.now() - 3600000).toISOString()
        }
      ]
      
      return {
        success: true,
        message: '获取消息历史成功',
        result: {
          messageHistory: mockHistory,
          result: true
        }
      }
    }
    
    const response = await request.get('/api/messages/history', {
      params: { receiveId, page: pageNum, pageSize: size }
    })
    
    // 处理响应格式（支持ListMessageHistory对象）
    if (response && typeof response === 'object') {
      // 处理后端ListMessageHistory响应格式
      if (response.messageHistory && Array.isArray(response.messageHistory)) {
        return {
          success: true,
          message: '获取消息历史成功',
          result: {
            messageHistory: response.messageHistory,
            total: response.total || response.messageHistory.length,
            page: response.page || pageNum,
            pageSize: response.pageSize || size,
            result: response.result !== undefined ? response.result : true
          }
        }
      }
      
      // 处理标准对象响应
      return {
        success: true,
        message: '获取消息历史成功',
        result: response.data || response
      }
    }
    
    // 处理字符串响应
    if (typeof response === 'string') {
      return {
        success: response.includes('成功'),
        message: response,
        result: { messageHistory: [] }
      }
    }
    
    return {
      success: true,
      message: '获取消息历史成功',
      result: { messageHistory: [], result: false }
    }
  } catch (error) {
    // 导入错误处理函数
    const { handleApiError } = await import('@/utils/dataModelConverter')
    return handleApiError(error, '获取消息历史失败')
  }
}

// 获取活动消息历史（/api/messages/activity/history/{activityId}）
export const getActivityMessageHistory = async (activityId, params) => {
  try {
    // 验证必要参数
    if (!activityId) {
      throw new Error('活动ID不能为空')
    }
    
    if (typeof activityId !== 'number' && typeof activityId !== 'string') {
      throw new Error('活动ID格式错误')
    }
    
    // 验证分页参数
    const { page = 1, pageSize = 20 } = params || {}
    const pageNum = parseInt(page) || 1
    const size = parseInt(pageSize) || 20
    
    if (useMock) {
      // 模拟获取活动消息历史
      await new Promise(resolve => setTimeout(resolve, 300))
      const mockHistory = [
        {
          activityId: activityId,
          senderName: '活动管理员',
          content: '活动即将开始，请做好准备',
          sentAt: new Date().toISOString()
        },
        {
          activityId: activityId,
          senderName: '系统通知',
          content: '活动报名已截止',
          sentAt: new Date(Date.now() - 7200000).toISOString()
        }
      ]
      
      return {
        success: true,
        message: '获取活动消息历史成功',
        result: {
          messageHistory: mockHistory,
          result: true
        }
      }
    }
    
    const response = await request.get(`/api/messages/activity/history/${activityId}`, {
      params: { page: pageNum, pageSize: size }
    })
    
    // 处理响应格式（支持ListMessageHistory对象）
    if (response && typeof response === 'object') {
      // 处理后端ListMessageHistory响应格式
      if (response.messageHistory && Array.isArray(response.messageHistory)) {
        return {
          success: true,
          message: '获取活动消息历史成功',
          result: {
            messageHistory: response.messageHistory,
            total: response.total || response.messageHistory.length,
            page: response.page || pageNum,
            pageSize: response.pageSize || size,
            result: response.result !== undefined ? response.result : true
          }
        }
      }
      
      // 处理标准对象响应
      return {
        success: true,
        message: '获取活动消息历史成功',
        result: response.data || response
      }
    }
    
    // 处理字符串响应
    if (typeof response === 'string') {
      return {
        success: response.includes('成功'),
        message: response,
        result: { messageHistory: [] }
      }
    }
    
    return {
      success: true,
      message: '获取活动消息历史成功',
      result: { messageHistory: [], result: false }
    }
  } catch (error) {
    // 导入错误处理函数
    const { handleApiError } = await import('@/utils/dataModelConverter')
    return handleApiError(error, '获取活动消息历史失败')
  }
}

// 获取未读消息数量
export const getUnreadMessageCount = () => {
  if (useMock) {
    return Promise.resolve({
      success: true,
      data: {
        totalUnread: 5,
        systemUnread: 2,
        activityUnread: 3
      }
    })
  }
  return request.get('/api/messages/unread-count')
}

// 标记消息已读
export const markMessageAsRead = (messageId) => {
  if (useMock) {
    return Promise.resolve({
      success: true,
      message: '消息已标记为已读'
    })
  }
  return request.put(`/api/messages/${messageId}/read`)
}

// 标记所有消息已读
export const markAllMessagesAsRead = () => {
  if (useMock) {
    return Promise.resolve({
      success: true,
      message: '所有消息已标记为已读'
    })
  }
  return request.put('/api/messages/read-all')
}