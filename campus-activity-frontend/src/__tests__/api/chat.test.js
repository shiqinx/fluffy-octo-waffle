import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getMessageHistory,
  getMembers,
  sendMessage,
  chatAPI
} from '@/api/chat'

describe('Chat API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // 设置环境变量为真实API模式
    vi.stubEnv('VITE_USE_MOCK', 'false')
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8080')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('getMessageHistory', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await getMessageHistory(1)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
    })

    it('应该处理无效的活动ID', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await getMessageHistory(null)
      
      expect(result).toBeDefined()
    })

    it('应该处理零活动ID', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await getMessageHistory(0)
      
      expect(result).toBeDefined()
    })
  })

  describe('getMembers', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await getMembers(1)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
    })

    it('应该处理无效的活动ID', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await getMembers(null)
      
      expect(result).toBeDefined()
    })

    it('应该处理负数活动ID', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await getMembers(-1)
      
      expect(result).toBeDefined()
    })
  })

  describe('sendMessage', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const messageData = {
        activityId: 1,
        content: 'Hello, this is a test message',
        type: 'text'
      }
      
      const result = await sendMessage(messageData)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.data).toEqual(messageData)
    })

    it('应该处理空消息内容', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const messageData = {
        activityId: 1,
        content: '',
        type: 'text'
      }
      
      const result = await sendMessage(messageData)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
    })

    it('应该处理缺少活动ID的消息', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const messageData = {
        content: 'Test message',
        type: 'text'
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
        type: 'text'
      }
      
      const imageMessage = {
        activityId: 1,
        content: 'image.jpg',
        type: 'image'
      }
      
      const fileMessage = {
        activityId: 1,
        content: 'document.pdf',
        type: 'file'
      }
      
      const textResult = await sendMessage(textMessage)
      const imageResult = await sendMessage(imageMessage)
      const fileResult = await sendMessage(fileMessage)
      
      expect(textResult.success).toBe(true)
      expect(imageResult.success).toBe(true)
      expect(fileResult.success).toBe(true)
    })
  })

  describe('chatAPI对象', () => {
    it('应该包含所有必需的方法', () => {
      expect(chatAPI).toHaveProperty('getMessageHistory')
      expect(chatAPI).toHaveProperty('getMembers')
      expect(chatAPI).toHaveProperty('sendMessage')
      
      expect(typeof chatAPI.getMessageHistory).toBe('function')
      expect(typeof chatAPI.getMembers).toBe('function')
      expect(typeof chatAPI.sendMessage).toBe('function')
    })

    it('应该通过chatAPI对象调用getMessageHistory', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await chatAPI.getMessageHistory(1)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
    })

    it('应该通过chatAPI对象调用getMembers', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await chatAPI.getMembers(1)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
    })

    it('应该通过chatAPI对象调用sendMessage', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const messageData = {
        activityId: 1,
        content: 'Test message via chatAPI',
        type: 'text'
      }
      
      const result = await chatAPI.sendMessage(messageData)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.data).toEqual(messageData)
    })
  })

  describe('数据完整性', () => {
    it('应该返回一致的响应格式', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const messageHistory = await getMessageHistory(1)
      const members = await getMembers(1)
      const messageResult = await sendMessage({ content: 'test' })
      
      // 所有响应都应该有success字段
      expect(messageHistory).toHaveProperty('success')
      expect(members).toHaveProperty('success')
      expect(messageResult).toHaveProperty('success')
      
      // 成功的响应应该有data字段
      if (messageHistory.success) {
        expect(messageHistory).toHaveProperty('data')
      }
      if (members.success) {
        expect(members).toHaveProperty('data')
      }
      if (messageResult.success) {
        expect(messageResult).toHaveProperty('data')
      }
    })
  })

  describe('边界情况', () => {
    it('应该处理极大的活动ID', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const largeId = 999999999
      
      const messageHistory = await getMessageHistory(largeId)
      const members = await getMembers(largeId)
      
      expect(messageHistory).toBeDefined()
      expect(members).toBeDefined()
    })

    it('应该处理特殊字符的消息内容', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const specialMessage = {
        activityId: 1,
        content: 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>? 中文测试 🎉',
        type: 'text'
      }
      
      const result = await sendMessage(specialMessage)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.data.content).toBe(specialMessage.content)
    })
  })
})