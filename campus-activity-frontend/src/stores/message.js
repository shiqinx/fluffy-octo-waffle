// @/stores/message.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getPersonalizedActivities } from '@/config/map'
import { useTeamStore } from './team'
import { useUserStore } from './userStore'

export const useMessageStore = defineStore('message', () => {
  const messages = ref([])
  const conversations = ref([])
  const loading = ref(false)

  // 生成基于实际数据的消息
  const generateMockMessages = () => {
    const teamStore = useTeamStore()
    const userStore = useUserStore()
    const activities = getPersonalizedActivities(userStore.userId, userStore.userName) // 获取活动数据
    const teams = teamStore.teams // 获取团队数据
    
    const messageList = [
      // 系统通知
      {
        id: 1,
        type: 'system',
        title: '系统公告：平台功能更新',
        content: '我们更新了活动创建流程，新增了位置选择和日程安排功能，快来体验吧！',
        time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        read: false,
        link: '/about'
      }
    ]

    // 基于实际活动数据生成活动通知
    if (activities.length > 0) {
      messageList.push({
        id: 2,
        type: 'activity',
        title: '活动报名成功',
        content: `您已成功报名"${activities[0].title}"，请按时参加。`,
        time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        activityId: activities[0].id
      })

      if (activities.length > 1) {
        messageList.push({
          id: 3,
          type: 'activity',
          title: '活动提醒',
          content: `您参与的"${activities[1].title}"将在明天下午2点开始，请准时参加。`,
          time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          read: false,
          activityId: activities[1].id
        })
      }
    }

    // 基于实际团队数据生成团队通知
    if (teams.length > 0) {
      messageList.push({
        id: 4,
        type: 'team',
        title: '团队邀请',
        content: `${teams[0].leader.name}邀请您加入"${teams[0].name}"团队，点击查看详情。`,
        time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        teamId: teams[0].id,
        sender: teams[0].leader.name
      })

      if (teams.length > 1) {
        messageList.push({
          id: 5,
          type: 'team',
          title: '团队成员变动',
          content: `新成员已加入"${teams[1].name}"团队。`,
          time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          teamId: teams[1].id
        })
      }
    }

    // 聊天消息
    if (activities.length > 0) {
      messageList.push({
        id: 6,
        type: 'chat',
        title: activities[0].title,
        content: '这周末什么时候开始？',
        time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        chatId: activities[0].id,
        sender: '王五'
      })
    }

    return messageList
  }

  // 加载消息列表
  const loadMessages = async () => {
    loading.value = true
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      // 加载mock数据
      messages.value = generateMockMessages()
      console.log('消息数据加载成功')
    } catch (error) {
      console.error('加载消息列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 加载会话列表
  const loadConversations = async () => {
    loading.value = true
    try {
      const teamStore = useTeamStore()
      const userStore = useUserStore()
      const activities = getPersonalizedActivities(userStore.userId, userStore.userName)
      const teams = teamStore.teams
      
      // 基于实际数据生成会话列表
      const conversationList = []

      // 活动会话
      if (activities.length > 0) {
        conversationList.push({
          id: activities[0].id,
          type: 'activity',
          title: activities[0].title,
          lastMessage: '这周末什么时候开始？',
          unreadCount: 2,
          lastTime: new Date().toISOString()
        })
      }

      // 系统通知会话
      conversationList.push({
        id: 'system',
        type: 'system',
        title: '系统通知',
        lastMessage: '您的活动报名已通过审核',
        unreadCount: 1,
        lastTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      })

      conversations.value = conversationList
    } catch (error) {
      console.error('加载会话列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 接收实时消息
  const receiveRealTimeMessage = (message) => {
    console.log('接收实时消息:', message)
    // 将新消息添加到列表开头
    messages.value.unshift({
      ...message,
      id: Date.now(), // 生成临时ID
      read: false,
      time: new Date().toISOString()
    })
  }

  // 发送消息
  const sendMessage = async (conversationId, content) => {
    try {
      console.log('发送消息:', { conversationId, content })
      // 模拟发送消息
      return { success: true }
    } catch (error) {
      console.error('发送消息失败:', error)
      throw error
    }
  }

  // 标记单条消息为已读
  const markAsRead = async (messageId) => {
    try {
      const message = messages.value.find(msg => msg.id === messageId)
      if (message) {
        message.read = true
      }
    } catch (error) {
      console.error('标记已读失败:', error)
      throw error
    }
  }

  // 标记全部消息为已读
  const markAllAsRead = async () => {
    try {
      messages.value.forEach(message => {
        message.read = true
      })
      // 同时更新会话的未读数
      conversations.value.forEach(conversation => {
        conversation.unreadCount = 0
      })
    } catch (error) {
      console.error('标记全部已读失败:', error)
      throw error
    }
  }

  // 删除消息
  const deleteMessage = async (messageId) => {
    try {
      const index = messages.value.findIndex(msg => msg.id === messageId)
      if (index !== -1) {
        messages.value.splice(index, 1)
      }
    } catch (error) {
      console.error('删除消息失败:', error)
      throw error
    }
  }

  // 按类型过滤消息
  const getMessagesByType = (type) => {
    if (!type || type === 'all') {
      return messages.value
    }
    return messages.value.filter(msg => msg.type === type)
  }

  // 获取未读消息数量
  const getUnreadCount = () => {
    return messages.value.filter(msg => !msg.read).length
  }

  return {
    messages,
    conversations,
    loading,
    loadMessages,
    loadConversations,
    receiveRealTimeMessage,
    sendMessage,
    markAsRead,
    markAllAsRead,
    deleteMessage,
    getMessagesByType,
    getUnreadCount
  }
})