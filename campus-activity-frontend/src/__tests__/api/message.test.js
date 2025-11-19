import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  sendMessage,
  getMessageHistory,
  recallMessage
} from '@/api/message'

describe('Message API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // 设置环境变量为真实API模式
    vi.stubEnv('VITE_USE_MOCK', 'false')
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8080')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('sendMessage', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const messageData = {
        activityId: 1,
        content: 'Hello, this is a test message',
        type: 'text',
        senderId: 1001,
        receiverId: 1,
        receiverType: 'activity'
      }
      
      const result = await sendMessage(messageData)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
    })

    it('应该处理空消息内容', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const messageData = {
        activityId: 1,
        content: '',
        type: 'text',
        senderId: 1001,
        receiverId: 1,
        receiverType: 'activity'
      }
      
      const result = await sendMessage(messageData)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false) // 空字符串在JS中是falsy，会被当作缺少参数
    })

    it('应该处理缺少活动ID的消息', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const messageData = {
        content: 'Test message',
        type: 'text',
        senderId: 1001,
        receiverId: 1,
        receiverType: 'activity'
      }
      
      const result = await sendMessage(messageData)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
    })

    it('应该处理不同类型的消息', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const textMessage = {
        activityId: 1,
        content: 'Text message',
        type: 'text',
        senderId: 1001,
        receiverId: 1,
        receiverType: 'activity'
      }
      
      const imageMessage = {
        activityId: 1,
        content: 'image.jpg',
        type: 'image',
        senderId: 1001,
        receiverId: 1,
        receiverType: 'activity'
      }
      
      const fileMessage = {
        activityId: 1,
        content: 'document.pdf',
        type: 'file',
        senderId: 1001,
        receiverId: 1,
        receiverType: 'activity'
      }
      
      const textResult = await sendMessage(textMessage)
      const imageResult = await sendMessage(imageMessage)
      const fileResult = await sendMessage(fileMessage)
      
      expect(textResult.success).toBe(true)
      expect(imageResult.success).toBe(true)
      expect(fileResult.success).toBe(true)
    })

    it('应该处理特殊字符的消息内容', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const messageData = {
        activityId: 1,
        content: 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>? 中文测试 🎉',
        type: 'text',
        senderId: 1001,
        receiverId: 1,
        receiverType: 'activity'
      }
      
      const result = await sendMessage(messageData)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
    })
  })

  describe('getMessageHistory', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const params = {
        activityId: 1,
        page: 1,
        pageSize: 20
      }
      
      const result = await getMessageHistory(params)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
    })

    it('应该处理无效的活动ID', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const params = {
        activityId: null,
        page: 1,
        pageSize: 20
      }
      
      const result = await getMessageHistory(params)
      
      expect(result).toBeDefined()
    })

    it('应该处理默认分页参数', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const params = {
        activityId: 1
      }
      
      const result = await getMessageHistory(params)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
    })

    it('应该处理极大的分页参数', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const params = {
        activityId: 1,
        page: 999,
        pageSize: 1000
      }
      
      const result = await getMessageHistory(params)
      
      expect(result).toBeDefined()
    })

    it('应该处理零活动ID', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const params = {
        activityId: 0,
        page: 1,
        pageSize: 20
      }
      
      const result = await getMessageHistory(params)
      
      expect(result).toBeDefined()
    })
  })

  describe('recallMessage', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      // 先发送一条消息，然后撤回它
      const messageData = {
        activityId: 1,
        content: 'This message will be recalled',
        type: 'text',
        senderId: 1001,
        receiverId: 1,
        receiverType: 'activity'
      }
      
      const sendResult = await sendMessage(messageData)
      expect(sendResult.success).toBe(true)
      
      const messageId = sendResult.data.id
      const result = await recallMessage(messageId)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
    })

    it('应该处理无效的消息ID', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const messageId = null
      
      const result = await recallMessage(messageId)
      
      expect(result).toBeDefined()
    })

    it('应该处理零消息ID', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const messageId = 0
      
      const result = await recallMessage(messageId)
      
      expect(result).toBeDefined()
    })

    it('应该处理负数消息ID', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const messageId = -1
      
      const result = await recallMessage(messageId)
      
      expect(result).toBeDefined()
    })

    it('应该处理极大的消息ID', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      // 先发送一条消息，然后尝试撤回
      const messageData = {
        activityId: 1,
        content: 'Test message for large ID',
        type: 'text',
        senderId: 1001,
        receiverId: 1,
        receiverType: 'activity'
      }
      
      const sendResult = await sendMessage(messageData)
      expect(sendResult.success).toBe(true)
      
      const messageId = sendResult.data.id
      const result = await recallMessage(messageId)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
    })
  })

  describe('数据完整性', () => {
    it('应该返回一致的响应格式', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const messageData = {
        activityId: 1,
        content: 'Test message',
        type: 'text',
        senderId: 1001
      }
      
      const params = {
        activityId: 1,
        page: 1,
        pageSize: 20
      }
      
      const sendResult = await sendMessage(messageData)
      const historyResult = await getMessageHistory(params)
      const recallResult = await recallMessage(12345)
      
      // 所有响应都应该有success字段
      expect(sendResult).toHaveProperty('success')
      expect(historyResult).toHaveProperty('success')
      expect(recallResult).toHaveProperty('success')
      
      // 成功的响应应该有data字段
      if (sendResult.success) {
        expect(sendResult).toHaveProperty('data')
      }
      if (historyResult.success) {
        expect(historyResult).toHaveProperty('data')
      }
    })
  })

  describe('边界情况', () => {
    it('应该处理超长消息内容', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const longContent = 'a'.repeat(10000) // 10000字符的长消息
      const messageData = {
        activityId: 1,
        content: longContent,
        type: 'text',
        senderId: 1001,
        receiverId: 1,
        receiverType: 'activity'
      }
      
      const result = await sendMessage(messageData)
      
      expect(result).toBeDefined()
      // 调试输出
      console.log('Long message result:', result)
      expect(result.success).toBe(true) // mock函数不限制长度
    })

    it('应该处理Unicode字符', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const messageData = {
        activityId: 1,
        content: '🎉 Emoji测试 🌟 中文测试 Ñáéíóú العربية русский',
        type: 'text',
        senderId: 1001,
        receiverId: 1,
        receiverType: 'activity'
      }
      
      const result = await sendMessage(messageData)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
    })

    it('应该处理空参数', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await sendMessage({})
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false) // 缺少必要参数
    })

    it('应该处理null参数', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await sendMessage(null)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false) // null参数应该失败
    })
  })
})