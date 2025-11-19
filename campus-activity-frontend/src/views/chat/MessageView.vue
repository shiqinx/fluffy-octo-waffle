<template>
  <div class="messages-view">
    <!-- 顶部导航 -->
    <div class="header">
      <h1 class="title">消息</h1>
      <button class="mark-all-read" @click="markAllAsRead" :disabled="unreadCount === 0">
        全部已读
      </button>
    </div>

    <!-- 消息标签页 -->
    <div class="message-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.value"
        :class="['tab', { active: activeTab === tab.value }]"
        @click="activeTab = tab.value"
      >
        <span>{{ tab.label }}</span>
        <span v-if="tab.badge" class="badge">{{ tab.badge }}</span>
      </button>
    </div>

    <!-- 消息列表 -->
    <div class="message-list">
      <div 
        v-for="message in filteredMessages" 
        :key="message.id"
        :class="['message-item', { unread: !message.read }]"
        @click="handleMessageClick(message)"
        @contextmenu="showContextMenu($event, message)"
        @touchstart="startLongPress($event, message)"
        @touchend="cancelLongPress"
        @touchmove="cancelLongPress"
      >
        <div class="message-icon">
          <span :class="getMessageIcon(message.type)"></span>
        </div>
        
        <div class="message-content">
          <div class="message-header">
            <h4 class="message-title">{{ message.title }}</h4>
            <span class="message-time">{{ formatTime(message.time) }}</span>
          </div>
          <p class="message-preview">{{ message.content }}</p>
          <div class="message-meta">
            <span class="message-type">{{ getMessageTypeText(message.type) }}</span>
            <span v-if="!message.read" class="unread-dot"></span>
          </div>
        </div>

        <div class="message-actions">
          <span v-if="message.type === 'chat' && message.unreadCount > 0" class="unread-badge">
            {{ message.unreadCount }}
          </span>
          <button 
            v-else-if="!message.read"
            class="mark-read-btn"
            @click.stop="markAsRead(message)"
            title="标记为已读"
          >
            ●
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredMessages.length === 0" class="empty-state">
        <div class="empty-icon">💬</div>
        <p>暂无消息</p>
        <p class="empty-tip">当有新消息时会在这里显示</p>
      </div>
    </div>

    <!-- 上下文菜单 -->
    <div 
      v-if="contextMenuVisible"
      class="context-menu"
      :style="contextMenuStyle"
    >
      <div class="menu-item" @click="markAsRead(contextMenuMessage)">
        标记为已读
      </div>
      <div class="menu-item" @click="deleteMessage(contextMenuMessage)">
        删除消息
      </div>
      <div v-if="contextMenuMessage && contextMenuMessage.type === 'team'" class="menu-item" @click="joinTeam(contextMenuMessage)">
        加入团队
      </div>
    </div>

    <!-- 遮罩层 -->
    <div 
      v-if="contextMenuVisible"
      class="overlay"
      @click="hideContextMenu"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessageStore } from '@/stores/message'
import { getActivityChatRooms } from '@/api/chat'

const router = useRouter()
const messageStore = useMessageStore()

// 响应式数据
const activeTab = ref('all')
const contextMenuVisible = ref(false)
const contextMenuStyle = ref({})
const contextMenuMessage = ref(null)
const activityChatRooms = ref([])
const loadingChatRooms = ref(false)
let longPressTimer = null

// 标签页配置
const tabs = computed(() => [
  { value: 'all', label: '全部' },
  { value: 'unread', label: '未读', badge: unreadCount.value },
  { value: 'system', label: '系统' },
  { value: 'activity', label: '活动' },
  { value: 'chat', label: '聊天室' },
  { value: 'team', label: '团队' }
])

// 计算属性
const filteredMessages = computed(() => {
  let messages = [...messageStore.messages]
  
  // 如果是聊天室标签页，显示活动聊天室
  if (activeTab.value === 'chat') {
    const chatRoomMessages = activityChatRooms.value.map(room => ({
      id: `chat_${room.id}`,
      type: 'chat',
      title: room.name,
      content: room.lastMessage,
      time: room.lastMessageTime,
      read: room.unreadCount === 0,
      chatId: room.id,
      activityId: room.activityId,
      avatar: room.avatar,
      unreadCount: room.unreadCount,
      memberCount: room.memberCount,
      isCreator: room.isCreator
    }))
    messages = [...messages, ...chatRoomMessages]
  }
  
  switch (activeTab.value) {
    case 'unread':
      messages = messages.filter(msg => !msg.read)
      break
    case 'system':
      messages = messages.filter(msg => msg.type === 'system')
      break
    case 'activity':
      messages = messages.filter(msg => msg.type === 'activity')
      break
    case 'chat':
      messages = messages.filter(msg => msg.type === 'chat')
      break
    case 'team':
      messages = messages.filter(msg => msg.type === 'team')
      break
  }
  
  return messages.sort((a, b) => new Date(b.time) - new Date(a.time))
})

const unreadCount = computed(() => {
  const messageUnread = messageStore.messages.filter(msg => !msg.read).length
  const chatUnread = activityChatRooms.value.reduce((sum, room) => sum + room.unreadCount, 0)
  return messageUnread + chatUnread
})

// 方法
const getMessageIcon = (type) => {
  const icons = {
    system: '🔔',
    activity: '🎯',
    team: '👥',
    chat: '💬'
  }
  return icons[type] || '📧'
}

const getMessageTypeText = (type) => {
  const types = {
    system: '系统通知',
    activity: '活动通知',
    team: '团队通知',
    chat: '聊天室'
  }
  return types[type] || '消息'
}

const formatTime = (time) => {
  const now = new Date()
  const messageTime = new Date(time)
  const diff = now - messageTime
  
  if (diff < 60 * 1000) return '刚刚'
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}分钟前`
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
  
  return messageTime.toLocaleDateString()
}

const handleMessageClick = (message) => {
  // 标记为已读
  if (message.type === 'chat') {
    // 聊天室消息，跳转到聊天室页面
    router.push(`/chat/${message.activityId}`)
  } else {
    messageStore.markAsRead(message.id)
    
    // 根据消息类型跳转
    switch (message.type) {
      case 'activity':
        if (message.activityId) {
          router.push(`/activities/${message.activityId}`)
        }
        break
      case 'team':
        if (message.teamId) {
          router.push(`/team/${message.teamId}`)
        }
        break
    }
  }
}

const markAsRead = (message) => {
  if (message.type !== 'chat') {
    messageStore.markAsRead(message.id)
  }
  hideContextMenu()
}

const joinTeam = (message) => {
  if (message.teamId) {
    router.push(`/teams/${message.teamId}`)
  }
  hideContextMenu()
}

const markAllAsRead = () => {
  messageStore.markAllAsRead()
  // 清除聊天室未读数
  activityChatRooms.value.forEach(room => {
    room.unreadCount = 0
  })
}

const deleteMessage = (message) => {
  if (confirm('确定要删除这条消息吗？')) {
    messageStore.deleteMessage(message.id)
  }
  hideContextMenu()
}

const showContextMenu = (event, message) => {
  event.preventDefault()
  contextMenuMessage.value = message
  contextMenuVisible.value = true
  contextMenuStyle.value = {
    left: `${event.clientX}px`,
    top: `${event.clientY}px`
  }
}

const hideContextMenu = () => {
  contextMenuVisible.value = false
  contextMenuMessage.value = null
  cancelLongPress()
}

// 长按功能
const startLongPress = (event, message) => {
  cancelLongPress() // 清除之前的定时器
  longPressTimer = setTimeout(() => {
    showContextMenu(event, message)
  }, 800) // 800毫秒触发长按
}

const cancelLongPress = () => {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

// 键盘事件
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    hideContextMenu()
  }
}

// 加载活动聊天室
const loadActivityChatRooms = async () => {
  try {
    loadingChatRooms.value = true
    const response = await getActivityChatRooms()
    if (response.success) {
      activityChatRooms.value = response.data || []
    }
  } catch (error) {
    console.error('加载活动聊天室失败:', error)
  } finally {
    loadingChatRooms.value = false
  }
}

// 初始化
onMounted(() => {
  messageStore.loadMessages()
  loadActivityChatRooms()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  cancelLongPress() // 清理长按定时器
})
</script>

<style scoped>
.messages-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
}

.title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.mark-all-read {
  padding: 6px 12px;
  border: 1px solid #1890ff;
  border-radius: 16px;
  background: white;
  color: #1890ff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.mark-all-read:hover:not(:disabled) {
  background: #1890ff;
  color: white;
}

.mark-all-read:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.message-tabs {
  display: flex;
  background: white;
  border-bottom: 1px solid #e8e8e8;
  overflow-x: auto;
}

.tab {
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: white;
  cursor: pointer;
  position: relative;
  white-space: nowrap;
  transition: all 0.3s;
}

.tab.active {
  color: #1890ff;
  font-weight: 500;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  right: 20%;
  height: 2px;
  background: #1890ff;
}

.badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ff4d4f;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 12px;
  min-width: 18px;
  text-align: center;
}

.message-list {
  flex: 1;
  overflow: auto;
}

.message-item {
  display: flex;
  padding: 16px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.3s;
  position: relative;
}

.message-item:hover {
  background: #fafafa;
}

.message-item.unread {
  background: #f6ffed;
}

.message-icon {
  margin-right: 12px;
  font-size: 20px;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.message-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-time {
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
  margin-left: 8px;
}

.message-preview {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.message-type {
  font-size: 12px;
  color: #999;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 10px;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: #1890ff;
  border-radius: 50%;
}

.message-actions {
  display: flex;
  align-items: center;
  margin-left: 8px;
}

.mark-read-btn {
  background: none;
  border: none;
  color: #1890ff;
  cursor: pointer;
  font-size: 12px;
  padding: 4px;
  opacity: 0;
  transition: opacity 0.3s;
}

.message-item:hover .mark-read-btn {
  opacity: 1;
}

.unread-badge {
  background: #ff4d4f;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 12px;
  min-width: 18px;
  text-align: center;
  font-weight: 500;
}

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  padding: 40px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-tip {
  font-size: 14px;
  margin-top: 8px;
  text-align: center;
}

.context-menu {
  position: fixed;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  min-width: 120px;
  animation: fadeIn 0.2s ease;
}

.menu-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.3s;
  font-size: 14px;
}

.menu-item:hover {
  background: #f5f5f5;
}

.menu-item:first-child {
  border-radius: 8px 8px 0 0;
}

.menu-item:last-child {
  border-radius: 0 0 8px 8px;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 1000;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>