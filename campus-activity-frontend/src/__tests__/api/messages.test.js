import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  sendMessage, 
  recallMessage, 
  getMessageHistory, 
  getActivityMessageHistory,
  getUnreadMessageCount,
  markMessageAsRead,
  markAllMessagesAsRead
} from '@/api/messages'

describe('Messages API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('sendMessage', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const messageData = {
        receiveId: 1001,
        content: 'Hello, this is a test message',
        type: 'text'
      }
      
      const result = await sendMessage(messageData)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.message).toBe('消息发送成功')
      expect(result.result).toBeDefined()
      expect(result.result.messageId).toBeDefined()
      expect(result.result.content).toBe('Hello, this is a test message')
    })

    it('应该处理空消息内容', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const messageData = {
        receiveId: 1001,
        content: '',
        type: 'text'
      }
      
      const result = await sendMessage(messageData)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('消息内容不能为空')
    })

    it('应该处理缺少接收者ID的消息', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const messageData = {
        content: 'Test message',
        type: 'text'
      }
      
      const result = await sendMessage(messageData)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('接收者ID不能为空')
    })

    it('应该处理不同类型的消息', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const textMessage = {
        receiveId: 1001,
        content: 'Text message',
        type: 'text'
      }
      
      const imageMessage = {
        receiveId: 1001,
        content: 'image.jpg',
        type: 'image'
      }
      
      const systemMessage = {
        receiveId: 1001,
        content: 'System notification',
        type: 'system'
      }
      
      const textResult = await sendMessage(textMessage)
      const imageResult = await sendMessage(imageMessage)
      const systemResult = await sendMessage(systemMessage)
      
      expect(textResult.success).toBe(true)
      expect(imageResult.success).toBe(true)
      expect(systemResult.success).toBe(true)
    })

    it('应该处理无效的消息类型', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const messageData = {
        receiveId: 1001,
        content: 'Test message',
        type: 'invalid'
      }
      
      const result = await sendMessage(messageData)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('无效的消息类型')
    })

    it('应该处理空参数', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await sendMessage(null)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('消息参数不能为空')
    })
  })

  describe('recallMessage', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const recallData = {
        messageId: 12345,
        senderId: 1001,
        receiverId: 1002
      }
      
      const result = await recallMessage(recallData)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.message).toBe('消息撤回成功')
      expect(result.result).toBeDefined()
      expect(result.result.messageId).toBe(12345)
      expect(result.result.recalled).toBe(true)
    })

    it('应该处理缺少消息ID的撤回请求', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const recallData = {
        senderId: 1001,
        receiverId: 1002
      }
      
      const result = await recallMessage(recallData)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('消息ID不能为空')
    })

    it('应该处理缺少发送者ID的撤回请求', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const recallData = {
        messageId: 12345,
        receiverId: 1002
      }
      
      const result = await recallMessage(recallData)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('发送者ID不能为空')
    })

    it('应该处理缺少接收者ID的撤回请求', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const recallData = {
        messageId: 12345,
        senderId: 1001
      }
      
      const result = await recallMessage(recallData)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('接收者ID不能为空')
    })

    it('应该处理空撤回参数', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await recallMessage(null)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('撤回消息参数不能为空')
    })
  })

  describe('getMessageHistory', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const params = {
        receiveId: 1001,
        page: 1,
        pageSize: 20
      }
      
      const result = await getMessageHistory(params)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.message).toBe('获取消息历史成功')
      expect(result.result).toBeDefined()
      expect(result.result.messageHistory).toBeDefined()
      expect(Array.isArray(result.result.messageHistory)).toBe(true)
      expect(result.result.result).toBe(true)
    })

    it('应该处理缺少接收者ID的查询', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const params = {
        page: 1,
        pageSize: 20
      }
      
      const result = await getMessageHistory(params)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('接收者ID不能为空')
    })

    it('应该处理默认分页参数', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const params = {
        receiveId: 1001
      }
      
      const result = await getMessageHistory(params)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.result.messageHistory).toBeDefined()
    })

    it('应该处理空查询参数', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await getMessageHistory(null)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('查询参数不能为空')
    })
  })

  describe('getActivityMessageHistory', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const activityId = 123
      const params = {
        page: 1,
        pageSize: 20
      }
      
      const result = await getActivityMessageHistory(activityId, params)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.message).toBe('获取活动消息历史成功')
      expect(result.result).toBeDefined()
      expect(result.result.messageHistory).toBeDefined()
      expect(Array.isArray(result.result.messageHistory)).toBe(true)
      expect(result.result.result).toBe(true)
    })

    it('应该处理空活动ID', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const params = {
        page: 1,
        pageSize: 20
      }
      
      const result = await getActivityMessageHistory(null, params)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('活动ID不能为空')
    })

    it('应该处理无效的活动ID格式', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const invalidId = {}
      const params = {
        page: 1,
        pageSize: 20
      }
      
      const result = await getActivityMessageHistory(invalidId, params)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('活动ID格式错误')
    })

    it('应该处理默认分页参数', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const activityId = 123
      
      const result = await getActivityMessageHistory(activityId)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.result.messageHistory).toBeDefined()
    })
  })

  describe('getUnreadMessageCount', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await getUnreadMessageCount()
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.totalUnread).toBe(5)
      expect(result.data.systemUnread).toBe(2)
      expect(result.data.activityUnread).toBe(3)
    })
  })

  describe('markMessageAsRead', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const messageId = 12345
      const result = await markMessageAsRead(messageId)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.message).toBe('消息已标记为已读')
    })
  })

  describe('markAllMessagesAsRead', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await markAllMessagesAsRead()
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.message).toBe('所有消息已标记为已读')
    })
  })

  describe('数据完整性', () => {
    it('应该返回一致的响应格式', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const messageData = {
        receiveId: 1001,
        content: 'Test message',
        type: 'text'
      }
      
      const sendResult = await sendMessage(messageData)
      const historyResult = await getMessageHistory({ receiveId: 1001 })
      const unreadResult = await getUnreadMessageCount()
      
      expect(sendResult).toHaveProperty('success')
      expect(sendResult).toHaveProperty('message')
      expect(sendResult).toHaveProperty('result')
      
      expect(historyResult).toHaveProperty('success')
      expect(historyResult).toHaveProperty('message')
      expect(historyResult).toHaveProperty('result')
      
      expect(unreadResult).toHaveProperty('success')
      expect(unreadResult).toHaveProperty('data')
    })
  })

  describe('边界情况', () => {
    it('应该处理超长消息内容', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const longContent = 'a'.repeat(10000) // 10000字符的长消息
      const messageData = {
        receiveId: 1001,
        content: longContent,
        type: 'text'
      }
      
      const result = await sendMessage(messageData)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true) // mock函数不限制长度
    })

    it('应该处理Unicode字符', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const messageData = {
        receiveId: 1001,
        content: '🎉 Emoji测试 🌟 中文测试 Ñáéíóú العربية русский',
        type: 'text'
      }
      
      const result = await sendMessage(messageData)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
    })

    it('应该处理极大和极小的分页参数', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const extremeParams1 = {
        receiveId: 1001,
        page: 1,
        pageSize: 1000
      }
      
      const extremeParams2 = {
        receiveId: 1001,
        page: 1,
        pageSize: 1
      }
      
      const result1 = await getMessageHistory(extremeParams1)
      const result2 = await getMessageHistory(extremeParams2)
      
      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
    })

    it('应该处理字符串和数字类型的ID', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const stringId = '123'
      const numberId = 123
      
      const result1 = await getActivityMessageHistory(stringId)
      const result2 = await getActivityMessageHistory(numberId)
      
      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
    })
  })
})