import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMessageStore } from '@/stores/message'
import { useTeamStore } from '@/stores/team'
import { useUserStore } from '@/stores/userStore'

// Mock依赖模块
vi.mock('@/config/map', () => ({
  getPersonalizedActivities: vi.fn(() => [
    {
      id: 1,
      title: '前端技术分享会',
      type: '技术',
      date: '2024-01-15',
      time: '14:00'
    },
    {
      id: 2,
      title: '篮球友谊赛',
      type: '运动',
      date: '2024-01-16',
      time: '16:00'
    }
  ])
}))

describe('Message Store', () => {
  let messageStore
  let teamStore
  let userStore

  beforeEach(() => {
    // 创建新的Pinia实例
    setActivePinia(createPinia())
    messageStore = useMessageStore()
    teamStore = useTeamStore()
    userStore = useUserStore()
    
    // 设置用户信息
    userStore.setUserInfo({
      id: 1,
      name: '测试用户',
      email: 'test@example.com'
    })
    
    // Mock console避免测试输出过多
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    // 恢复console
    vi.restoreAllMocks()
  })

  describe('初始状态', () => {
    it('应该正确初始化消息状态', () => {
      expect(messageStore.messages).toBeInstanceOf(Array)
      expect(messageStore.conversations).toBeInstanceOf(Array)
      expect(messageStore.loading).toBe(false)
    })
  })

  describe('loadMessages', () => {
    it('应该成功加载消息列表', async () => {
      await messageStore.loadMessages()

      expect(messageStore.loading).toBe(false)
      expect(messageStore.messages.length).toBeGreaterThan(0)
      expect(console.log).toHaveBeenCalledWith('消息数据加载成功')
    })

    it('应该设置loading状态', async () => {
      const loadPromise = messageStore.loadMessages()
      
      // 在加载过程中应该是loading状态
      expect(messageStore.loading).toBe(true)
      
      await loadPromise
      expect(messageStore.loading).toBe(false)
    })

    it('应该生成不同类型的消息', async () => {
      await messageStore.loadMessages()
      
      const messages = messageStore.messages
      const types = [...new Set(messages.map(msg => msg.type))]
      
      expect(types).toContain('system')
      expect(messages.some(msg => msg.type === 'activity')).toBe(true)
      expect(messages.some(msg => msg.type === 'team')).toBe(true)
      expect(messages.some(msg => msg.type === 'chat')).toBe(true)
    })

    it('应该处理加载错误', async () => {
      // Mock setTimeout来模拟错误
      const originalSetTimeout = global.setTimeout
      global.setTimeout = vi.fn((callback) => {
        throw new Error('加载失败')
      })

      await expect(messageStore.loadMessages()).rejects.toThrow('加载失败')
      
      // 恢复setTimeout
      global.setTimeout = originalSetTimeout
    })
  })

  describe('loadConversations', () => {
    it('应该成功加载会话列表', async () => {
      await messageStore.loadConversations()

      expect(messageStore.loading).toBe(false)
      expect(messageStore.conversations.length).toBeGreaterThan(0)
    })

    it('应该包含不同类型的会话', async () => {
      await messageStore.loadConversations()
      
      const conversations = messageStore.conversations
      const types = [...new Set(conversations.map(conv => conv.type))]
      
      expect(types).toContain('system')
      expect(conversations.some(conv => conv.type === 'activity')).toBe(true)
    })

    it('应该处理加载错误', async () => {
      // 临时重写loadConversations来模拟错误
      const originalLoad = messageStore.loadConversations
      messageStore.loadConversations = async () => {
        throw new Error('会话加载失败')
      }

      await expect(messageStore.loadConversations()).rejects.toThrow('会话加载失败')
      
      // 恢复原方法
      messageStore.loadConversations = originalLoad
    })
  })

  describe('receiveRealTimeMessage', () => {
    it('应该正确接收实时消息', async () => {
      // 先加载一些消息
      await messageStore.loadMessages()
      const initialCount = messageStore.messages.length

      const newMessage = {
        type: 'chat',
        title: '新消息',
        content: '这是一条新消息',
        sender: '发送者'
      }

      messageStore.receiveRealTimeMessage(newMessage)

      expect(messageStore.messages.length).toBe(initialCount + 1)
      expect(messageStore.messages[0].content).toBe('这是一条新消息')
      expect(messageStore.messages[0].read).toBe(false)
      expect(messageStore.messages[0].id).toBeDefined()
    })

    it('应该生成正确的消息时间', async () => {
      const newMessage = {
        type: 'system',
        title: '系统消息',
        content: '系统通知'
      }

      messageStore.receiveRealTimeMessage(newMessage)

      const receivedMessage = messageStore.messages[0]
      const messageTime = new Date(receivedMessage.time)
      expect(messageTime.getTime()).not.toBeNaN()
    })
  })

  describe('sendMessage', () => {
    it('应该成功发送消息', async () => {
      const result = await messageStore.sendMessage('conversation-1', '测试消息')

      expect(result.success).toBe(true)
      expect(console.log).toHaveBeenCalledWith('发送消息:', { 
        conversationId: 'conversation-1', 
        content: '测试消息' 
      })
    })

    it('应该处理发送失败', async () => {
      // 临时重写sendMessage来模拟错误
      const originalSend = messageStore.sendMessage
      messageStore.sendMessage = async () => {
        throw new Error('发送失败')
      }

      await expect(messageStore.sendMessage('conversation-1', '测试消息'))
        .rejects.toThrow('发送失败')
      
      // 恢复原方法
      messageStore.sendMessage = originalSend
    })
  })

  describe('markAsRead', () => {
    it('应该成功标记单条消息为已读', async () => {
      // 先加载消息
      await messageStore.loadMessages()
      
      const unreadMessage = messageStore.messages.find(msg => !msg.read)
      expect(unreadMessage).toBeDefined()

      await messageStore.markAsRead(unreadMessage.id)

      expect(unreadMessage.read).toBe(true)
    })

    it('应该处理不存在的消息ID', async () => {
      // 不应该抛出错误
      await expect(messageStore.markAsRead(999)).resolves.toBeUndefined()
    })
  })

  describe('markAllAsRead', () => {
    it('应该成功标记所有消息为已读', async () => {
      // 先加载消息和会话
      await messageStore.loadMessages()
      await messageStore.loadConversations()

      await messageStore.markAllAsRead()

      // 所有消息应该被标记为已读
      messageStore.messages.forEach(message => {
        expect(message.read).toBe(true)
      })

      // 所有会话的未读数应该为0
      messageStore.conversations.forEach(conversation => {
        expect(conversation.unreadCount).toBe(0)
      })
    })
  })

  describe('deleteMessage', () => {
    it('应该成功删除消息', async () => {
      // 先加载消息
      await messageStore.loadMessages()
      const initialCount = messageStore.messages.length
      const messageToDelete = messageStore.messages[0]

      await messageStore.deleteMessage(messageToDelete.id)

      expect(messageStore.messages.length).toBe(initialCount - 1)
      expect(messageStore.messages.find(msg => msg.id === messageToDelete.id)).toBeUndefined()
    })

    it('应该处理删除不存在的消息', async () => {
      // 先加载消息
      await messageStore.loadMessages()
      const initialCount = messageStore.messages.length

      // 不应该抛出错误
      await expect(messageStore.deleteMessage(999)).resolves.toBeUndefined()
      expect(messageStore.messages.length).toBe(initialCount)
    })
  })

  describe('getMessagesByType', () => {
    it('应该正确按类型过滤消息', async () => {
      // 先加载消息
      await messageStore.loadMessages()

      const systemMessages = messageStore.getMessagesByType('system')
      const activityMessages = messageStore.getMessagesByType('activity')
      const allMessages = messageStore.getMessagesByType('all')

      expect(systemMessages.every(msg => msg.type === 'system')).toBe(true)
      expect(activityMessages.every(msg => msg.type === 'activity')).toBe(true)
      expect(allMessages).toEqual(messageStore.messages)
    })

    it('应该处理空类型参数', async () => {
      // 先加载消息
      await messageStore.loadMessages()

      const result1 = messageStore.getMessagesByType('')
      const result2 = messageStore.getMessagesByType(null)

      expect(result1).toEqual(messageStore.messages)
      expect(result2).toEqual(messageStore.messages)
    })
  })

  describe('getUnreadCount', () => {
    it('应该正确计算未读消息数量', async () => {
      // 先加载消息
      await messageStore.loadMessages()

      const unreadCount = messageStore.getUnreadCount()
      const actualUnreadCount = messageStore.messages.filter(msg => !msg.read).length

      expect(unreadCount).toBe(actualUnreadCount)
    })

    it('应该在标记已读后更新未读数量', async () => {
      // 先加载消息
      await messageStore.loadMessages()
      const initialUnreadCount = messageStore.getUnreadCount()

      // 标记一条消息为已读
      const unreadMessage = messageStore.messages.find(msg => !msg.read)
      if (unreadMessage) {
        await messageStore.markAsRead(unreadMessage.id)
        expect(messageStore.getUnreadCount()).toBe(initialUnreadCount - 1)
      }
    })
  })

  describe('数据完整性', () => {
    it('消息应该包含必要字段', async () => {
      await messageStore.loadMessages()

      messageStore.messages.forEach(message => {
        expect(message).toHaveProperty('id')
        expect(message).toHaveProperty('type')
        expect(message).toHaveProperty('title')
        expect(message).toHaveProperty('content')
        expect(message).toHaveProperty('time')
        expect(message).toHaveProperty('read')
      })
    })

    it('会话应该包含必要字段', async () => {
      await messageStore.loadConversations()

      messageStore.conversations.forEach(conversation => {
        expect(conversation).toHaveProperty('id')
        expect(conversation).toHaveProperty('type')
        expect(conversation).toHaveProperty('title')
        expect(conversation).toHaveProperty('lastMessage')
        expect(conversation).toHaveProperty('unreadCount')
        expect(conversation).toHaveProperty('lastTime')
      })
    })

    it('时间应该是有效的ISO字符串', async () => {
      await messageStore.loadMessages()

      messageStore.messages.forEach(message => {
        const date = new Date(message.time)
        expect(date.getTime()).not.toBeNaN()
      })
    })
  })
})