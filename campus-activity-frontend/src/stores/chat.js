import { defineStore } from 'pinia'
import { chatAPI } from '@/api/chat'
import { useMock } from '@/utils/env'

export const useChatStore = defineStore('chat', {
  state: () => ({
    // 消息相关
    messages: [],
    
    // 成员相关
    members: [],
    onlineCount: 0,
    
    // WebSocket连接
    websocket: null,
    connected: false,
    currentActivityId: null,
    
    // 加载状态
    loading: false
  }),

  actions: {
    // 连接聊天室
    connect(activityId) {
      if (this.websocket && this.currentActivityId === activityId) {
        return // 已经连接到同一个聊天室
      }

      this.disconnect() // 断开现有连接
      this.currentActivityId = activityId
      
      // 如果是模拟模式，不建立WebSocket连接，直接加载模拟数据
      if (useMock()) {
        console.log('📱 模拟模式：不建立WebSocket连接，直接加载模拟消息')
        this.loadMessageHistory(activityId)
        this.loadChatMembers(activityId)
        // 在模拟模式下，直接设置为已连接状态
        this.connected = true
        return
      }

      const token = localStorage.getItem('campus_token')
      if (!token) {
        console.error('未找到认证token')
        return
      }

      try {
        // 使用环境变量配置的WebSocket地址
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const wsHost = window.location.hostname
        const wsPort = import.meta.env.VITE_WS_PORT || '8080'
        const wsUrl = `${wsProtocol}//${wsHost}:${wsPort}/chat/${activityId}?token=${token}`
        
        this.websocket = new WebSocket(wsUrl)

        this.websocket.onopen = () => {
          this.connected = true
          console.log(`连接到聊天室: ${activityId}`)
          this.loadMessageHistory(activityId)
        }

        this.websocket.onmessage = (event) => {
          const data = JSON.parse(event.data)
          this.handleWebSocketMessage(data)
        }

        this.websocket.onclose = () => {
          this.connected = false
          console.log('聊天室连接关闭')
        }

        this.websocket.onerror = (error) => {
          console.error('WebSocket错误:', error)
          this.connected = false
        }
      } catch (error) {
        console.error('连接聊天室失败:', error)
      }
    },

    // 断开连接
    disconnect() {
      if (this.websocket) {
        this.websocket.close()
        this.websocket = null
      }
      this.connected = false
      this.currentActivityId = null
      this.messages = []
      this.members = []
    },

    // 处理WebSocket消息
    handleWebSocketMessage(data) {
      switch (data.type) {
        case 'message':
          this.messages.push(data.payload)
          break
        case 'user_joined':
          this.handleUserJoined(data.payload)
          break
        case 'user_left':
          this.handleUserLeft(data.payload)
          break
        case 'members_update':
          this.members = data.payload.members
          this.onlineCount = data.payload.onlineCount
          break
        case 'message_history':
          this.messages = data.payload
          break
        default:
          console.warn('未知的消息类型:', data.type)
      }
    },

    // 处理用户加入
    handleUserJoined(user) {
      this.members.push(user)
      this.onlineCount++
      
      // 添加系统消息
      this.messages.push({
        id: Date.now().toString(),
        type: 'system',
        content: `${user.username} 加入了聊天室`,
        timestamp: new Date().toISOString()
      })
    },

    // 处理用户离开
    handleUserLeft(user) {
      this.members = this.members.filter(member => member.id !== user.id)
      this.onlineCount--
      
      // 添加系统消息
      this.messages.push({
        id: Date.now().toString(),
        type: 'system',
        content: `${user.username} 离开了聊天室`,
        timestamp: new Date().toISOString()
      })
    },

    // 发送消息
    async sendMessage(messageData) {
      if (!this.connected || !this.websocket) {
        throw new Error('聊天室未连接')
      }

      const message = {
        type: 'send_message',
        payload: {
          activityId: messageData.activityId,
          content: messageData.content,
          type: messageData.type,
          timestamp: new Date().toISOString()
        }
      }

      this.websocket.send(JSON.stringify(message))
    },

    // 加载消息历史
    async loadMessageHistory(activityId) {
      try {
        this.loading = true
        const response = await chatAPI.getMessageHistory(activityId)
        this.messages = response.data
      } catch (error) {
        console.error('加载消息历史失败:', error)
      } finally {
        this.loading = false
      }
    },

    // 获取聊天室成员
    async loadChatMembers(activityId) {
      try {
        const response = await chatAPI.getMembers(activityId)
        this.members = response.data.members
        this.onlineCount = response.data.onlineCount
      } catch (error) {
        console.error('加载聊天室成员失败:', error)
      }
    }
  }
})