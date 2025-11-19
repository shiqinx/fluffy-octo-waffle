import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useChatStore } from '@/stores/chat'
import { chatAPI } from '@/api/chat'
import * as envUtils from '@/utils/env'

// Mock依赖模块
vi.mock('@/api/chat', () => ({
  chatAPI: {
    getMessageHistory: vi.fn(),
    getMembers: vi.fn()
  }
}))

vi.mock('@/utils/env', () => ({
  useMock: vi.fn(() => true) // 默认使用模拟模式
}))

// Mock WebSocket
class MockWebSocket {
  constructor(url) {
    this.url = url
    this.readyState = WebSocket.CONNECTING
    this.onopen = null
    this.onmessage = null
    this.onclose = null
    this.onerror = null
    this.sentMessages = []
    
    // 模拟连接成功
    setTimeout(() => {
      this.readyState = WebSocket.OPEN
      if (this.onopen) this.onopen()
    }, 10)
  }

  send(data) {
    this.sentMessages.push(data)
  }

  close() {
    this.readyState = WebSocket.CLOSED
    if (this.onclose) this.onclose()
  }

  // 辅助方法：模拟接收消息
  simulateMessage(data) {
    if (this.onmessage) {
      this.onmessage({ data: JSON.stringify(data) })
    }
  }

  // 辅助方法：模拟错误
  simulateError() {
    if (this.onerror) {
      this.onerror(new Error('WebSocket错误'))
    }
  }
}

// 设置全局WebSocket mock
global.WebSocket = MockWebSocket

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => 'mock_token'),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

// 使用Object.defineProperty来设置localStorage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
})

describe('Chat Store', () => {
  let chatStore

  beforeEach(() => {
    // 创建新的Pinia实例
    setActivePinia(createPinia())
    chatStore = useChatStore()
    
    // Mock console避免测试输出过多
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    // 重置mock函数
    vi.clearAllMocks()
  })

  afterEach(() => {
    // 恢复console
    vi.restoreAllMocks()
    
    // 断开所有连接
    chatStore.disconnect()
  })

  describe('初始状态', () => {
    it('应该正确初始化聊天状态', () => {
      expect(chatStore.messages).toEqual([])
      expect(chatStore.members).toEqual([])
      expect(chatStore.onlineCount).toBe(0)
      expect(chatStore.websocket).toBeNull()
      expect(chatStore.connected).toBe(false)
      expect(chatStore.currentActivityId).toBeNull()
      expect(chatStore.loading).toBe(false)
    })
  })

  describe('connect', () => {
    it('应该在模拟模式下连接成功', () => {
      const activityId = 1
      
      chatStore.connect(activityId)
      
      expect(chatStore.currentActivityId).toBe(activityId)
      expect(chatStore.connected).toBe(true)
      expect(console.log).toHaveBeenCalledWith('📱 模拟模式：不建立WebSocket连接，直接加载模拟消息')
    })

    it('应该在模拟模式下加载消息历史和成员', () => {
      const activityId = 1
      const mockMessages = [
        { id: '1', content: '消息1', timestamp: '2024-01-01T00:00:00Z' }
      ]
      const mockMembers = [
        { id: 1, username: '用户1' }
      ]
      
      chatAPI.getMessageHistory.mockResolvedValue({ data: mockMessages })
      chatAPI.getMembers.mockResolvedValue({ 
        data: { 
          members: mockMembers, 
          onlineCount: 1 
        } 
      })
      
      chatStore.connect(activityId)
      
      expect(chatAPI.getMessageHistory).toHaveBeenCalledWith(activityId)
      expect(chatAPI.getMembers).toHaveBeenCalledWith(activityId)
    })

    it('应该避免重复连接到同一个聊天室', () => {
      const activityId = 1
      
      // 第一次连接
      chatStore.connect(activityId)
      const firstConnection = chatStore.websocket
      
      // 第二次连接到同一个聊天室
      chatStore.connect(activityId)
      
      expect(chatStore.websocket).toBe(firstConnection)
    })

    it('应该在没有token时处理连接失败', () => {
      // Mock useMock返回false以使用真实WebSocket
      vi.spyOn(envUtils, 'useMock').mockReturnValue(false)
      
      localStorageMock.getItem.mockReturnValue(null)
      
      const activityId = 1
      chatStore.connect(activityId)
      
      expect(console.error).toHaveBeenCalledWith('未找到认证token')
      expect(chatStore.connected).toBe(false)
    })
  })

  describe('disconnect', () => {
    it('应该正确断开连接', () => {
      const activityId = 1
      chatStore.connect(activityId)
      
      // 添加一些数据
      chatStore.messages = [{ id: '1', content: '测试消息' }]
      chatStore.members = [{ id: 1, username: '用户1' }]
      
      chatStore.disconnect()
      
      expect(chatStore.websocket).toBeNull()
      expect(chatStore.connected).toBe(false)
      expect(chatStore.currentActivityId).toBeNull()
      expect(chatStore.messages).toEqual([])
      expect(chatStore.members).toEqual([])
    })

    it('应该在没有连接时安全断开', () => {
      expect(() => chatStore.disconnect()).not.toThrow()
    })
  })

  describe('handleWebSocketMessage', () => {
    it('应该处理消息类型', () => {
      const messageData = {
        type: 'message',
        payload: {
          id: '1',
          content: '测试消息',
          timestamp: '2024-01-01T00:00:00Z'
        }
      }
      
      chatStore.handleWebSocketMessage(messageData)
      
      expect(chatStore.messages).toContainEqual(messageData.payload)
    })

    it('应该处理用户加入', () => {
      const userData = {
        id: 1,
        username: '新用户'
      }
      
      chatStore.handleWebSocketMessage({
        type: 'user_joined',
        payload: userData
      })
      
      expect(chatStore.members).toContainEqual(userData)
      expect(chatStore.onlineCount).toBe(1)
      expect(chatStore.messages).toContainEqual({
        id: expect.any(String),
        type: 'system',
        content: '新用户 加入了聊天室',
        timestamp: expect.any(String)
      })
    })

    it('应该处理用户离开', () => {
      // 先添加用户
      chatStore.members = [{ id: 1, username: '用户1' }]
      chatStore.onlineCount = 1
      
      const userData = { id: 1, username: '用户1' }
      
      chatStore.handleWebSocketMessage({
        type: 'user_left',
        payload: userData
      })
      
      expect(chatStore.members).not.toContainEqual(userData)
      expect(chatStore.onlineCount).toBe(0)
      expect(chatStore.messages).toContainEqual({
        id: expect.any(String),
        type: 'system',
        content: '用户1 离开了聊天室',
        timestamp: expect.any(String)
      })
    })

    it('应该处理成员更新', () => {
      const membersData = {
        members: [{ id: 1, username: '用户1' }],
        onlineCount: 1
      }
      
      chatStore.handleWebSocketMessage({
        type: 'members_update',
        payload: membersData
      })
      
      expect(chatStore.members).toEqual(membersData.members)
      expect(chatStore.onlineCount).toBe(membersData.onlineCount)
    })

    it('应该处理消息历史', () => {
      const historyData = [
        { id: '1', content: '历史消息1' },
        { id: '2', content: '历史消息2' }
      ]
      
      chatStore.handleWebSocketMessage({
        type: 'message_history',
        payload: historyData
      })
      
      expect(chatStore.messages).toEqual(historyData)
    })

    it('应该处理未知消息类型', () => {
      const unknownData = {
        type: 'unknown_type',
        payload: {}
      }
      
      chatStore.handleWebSocketMessage(unknownData)
      
      expect(console.warn).toHaveBeenCalledWith('未知的消息类型:', 'unknown_type')
    })
  })

  describe('sendMessage', () => {
    it('应该在未连接时抛出错误', async () => {
      await expect(chatStore.sendMessage({
        activityId: 1,
        content: '测试消息',
        type: 'text'
      })).rejects.toThrow('聊天室未连接')
    })

    it('应该在连接时成功发送消息', async () => {
      // Mock useMock返回false以使用真实WebSocket
      vi.spyOn(envUtils, 'useMock').mockReturnValue(false)
      
      const activityId = 1
      const messageData = {
        activityId: 1,
        content: '测试消息',
        type: 'text'
      }

      // Mock WebSocket
      const mockWebSocket = {
        send: vi.fn(),
        close: vi.fn(),
        readyState: WebSocket.OPEN
      }
      
      // Mock WebSocket constructor
      global.WebSocket = vi.fn(() => mockWebSocket)

      // 先连接聊天室
      chatStore.connect(activityId)
      
      // 手动设置连接状态
      chatStore.connected = true
      chatStore.websocket = mockWebSocket

      // 发送消息
      await chatStore.sendMessage(messageData)

      // 验证WebSocket.send被调用
      expect(mockWebSocket.send).toHaveBeenCalled()
      
      // 解析发送的消息并验证关键内容
      const sentMessage = JSON.parse(mockWebSocket.send.mock.calls[0][0])
      expect(sentMessage.type).toBe('send_message')
      expect(sentMessage.payload.activityId).toBe(messageData.activityId)
      expect(sentMessage.payload.content).toBe(messageData.content)
      expect(sentMessage.payload.type).toBe(messageData.type)
      expect(sentMessage.payload.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })
  })

  describe('loadMessageHistory', () => {
    it('应该成功加载消息历史', async () => {
      const activityId = 1
      const mockHistory = [
        { id: '1', content: '历史消息1' },
        { id: '2', content: '历史消息2' }
      ]
      
      chatAPI.getMessageHistory.mockResolvedValue({ data: mockHistory })
      
      await chatStore.loadMessageHistory(activityId)
      
      expect(chatStore.loading).toBe(false)
      expect(chatStore.messages).toEqual(mockHistory)
      expect(chatAPI.getMessageHistory).toHaveBeenCalledWith(activityId)
    })

    it('应该处理加载失败', async () => {
      const activityId = 1
      const error = new Error('加载失败')
      
      chatAPI.getMessageHistory.mockRejectedValue(error)
      
      await chatStore.loadMessageHistory(activityId)
      
      expect(chatStore.loading).toBe(false)
      expect(console.error).toHaveBeenCalledWith('加载消息历史失败:', error)
    })
  })

  describe('loadChatMembers', () => {
    it('应该成功加载聊天室成员', async () => {
      const activityId = 1
      const mockMembers = [{ id: 1, username: '用户1' }]
      const mockResponse = {
        members: mockMembers,
        onlineCount: 5
      }
      
      chatAPI.getMembers.mockResolvedValue({ data: mockResponse })
      
      await chatStore.loadChatMembers(activityId)
      
      expect(chatStore.members).toEqual(mockMembers)
      expect(chatStore.onlineCount).toBe(5)
      expect(chatAPI.getMembers).toHaveBeenCalledWith(activityId)
    })

    it('应该处理加载成员失败', async () => {
      const activityId = 1
      const error = new Error('加载失败')
      
      chatAPI.getMembers.mockRejectedValue(error)
      
      await chatStore.loadChatMembers(activityId)
      
      expect(console.error).toHaveBeenCalledWith('加载聊天室成员失败:', error)
    })
  })

  describe('边界情况', () => {
    it('应该处理空消息列表', () => {
      expect(chatStore.messages).toEqual([])
    })

    it('应该处理空成员列表', () => {
      expect(chatStore.members).toEqual([])
      expect(chatStore.onlineCount).toBe(0)
    })

    it('应该处理重复用户加入', () => {
      const userData = { id: 1, username: '用户1' }
      
      // 用户第一次加入
      chatStore.handleUserJoined(userData)
      const firstCount = chatStore.onlineCount
      
      // 用户第二次加入（模拟重复事件）
      chatStore.handleUserJoined(userData)
      
      expect(chatStore.onlineCount).toBe(firstCount + 1)
      expect(chatStore.members.filter(m => m.id === userData.id)).toHaveLength(2)
    })

    it('应该处理不存在的用户离开', () => {
      chatStore.members = [{ id: 1, username: '用户1' }]
      chatStore.onlineCount = 1
      
      const nonExistentUser = { id: 999, username: '不存在的用户' }
      
      chatStore.handleUserLeft(nonExistentUser)
      
      expect(chatStore.members).toHaveLength(1)
      expect(chatStore.onlineCount).toBe(0)
    })
  })
})