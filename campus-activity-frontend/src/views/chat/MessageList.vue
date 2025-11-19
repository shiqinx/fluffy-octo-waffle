<!-- @/views/chat/MessageList.vue -->
<template>
  <div class="message-list-page">
    <van-nav-bar title="消息" fixed placeholder />
    
    <div class="conversation-list">
      <van-pull-refresh v-model:loading="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div 
            v-for="conversation in conversations" 
            :key="conversation.id"
            class="conversation-item"
            @click="onConversationClick(conversation)"
          >
            <div class="conversation-avatar">
              <van-icon 
                :name="getConversationIcon(conversation.type)" 
                size="24" 
                :color="getConversationColor(conversation.type)" 
              />
            </div>
            
            <div class="conversation-content">
              <div class="conversation-header">
                <h3 class="conversation-title">{{ conversation.title }}</h3>
                <span class="conversation-time">{{ formatTime(conversation.lastTime, 'time') }}</span>
              </div>
              
              <div class="conversation-footer">
                <p class="conversation-last-message">{{ conversation.lastMessage }}</p>
                <van-badge 
                  v-if="conversation.unreadCount > 0" 
                  :content="conversation.unreadCount" 
                  show-zero 
                />
              </div>
            </div>
          </div>
          
          <div v-if="conversations.length === 0 && !loading" class="empty-state">
            <van-empty description="暂无消息" />
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessageStore } from '@/stores/message'
import { formatTime } from '@/utils/date'

const router = useRouter()
const messageStore = useMessageStore()

const conversations = ref([])
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)

// 获取会话图标
const getConversationIcon = (type) => {
  const iconMap = {
    activity: 'friends-o',
    system: 'volume-o',
    team: 'cluster-o',
    personal: 'chat-o'
  }
  return iconMap[type] || 'chat-o'
}

// 获取会话颜色
const getConversationColor = (type) => {
  const colorMap = {
    activity: '#1989fa',
    system: '#ff976a',
    team: '#07c160',
    personal: '#7232dd'
  }
  return colorMap[type] || '#1989fa'
}

// 点击会话
const onConversationClick = (conversation) => {
  if (conversation.type === 'activity') {
    router.push(`/chat/${conversation.id}`)
  } else if (conversation.type === 'system') {
    // 系统消息处理
    console.log('系统消息:', conversation)
  }
}

// 下拉刷新
const onRefresh = () => {
  refreshing.value = false
  loadConversations()
}

// 加载更多
const onLoad = () => {
  finished.value = true
}

// 加载会话列表
const loadConversations = async () => {
  loading.value = true
  try {
    await messageStore.loadConversations()
    conversations.value = messageStore.conversations
  } catch (error) {
    console.error('加载会话列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 模拟实时消息接收（开发环境使用）
const setupRealTimeMessages = () => {
  // 这里可以连接 WebSocket 或其他实时通信
  console.log('设置实时消息监听')
}

// 清理实时消息
const cleanupRealTimeMessages = () => {
  console.log('清理实时消息监听')
}

onMounted(() => {
  loadConversations()
  setupRealTimeMessages()
})

onUnmounted(() => {
  cleanupRealTimeMessages()
})
</script>

<style scoped>
.message-list-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.conversation-list {
  padding: 16px;
}

.conversation-item {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.conversation-avatar {
  margin-right: 12px;
}

.conversation-content {
  flex: 1;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.conversation-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.conversation-time {
  font-size: 12px;
  color: #999;
}

.conversation-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.conversation-last-message {
  font-size: 14px;
  color: #666;
  margin: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-state {
  padding: 40px 0;
}
</style>