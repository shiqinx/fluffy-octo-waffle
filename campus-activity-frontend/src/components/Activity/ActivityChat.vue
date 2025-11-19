<template>
  <div class="activity-chat">
    <!-- 聊天头部 -->
    <div class="chat-header">
      <div class="chat-title">
        <h3>活动聊天室</h3>
        <span class="online-count">在线: {{ onlineCount }}人</span>
      </div>
      <van-button 
        type="primary" 
        size="small" 
        @click="showMembers = true"
      >
        成员列表
      </van-button>
    </div>

    <!-- 消息列表 -->
    <div class="message-list" ref="messageList">
      <div 
        v-for="message in messages" 
        :key="message.id"
        class="message-item"
        :class="{
          'own-message': message.senderId === currentUserId,
          'system-message': message.type === 'system'
        }"
      >
        <!-- 系统消息 -->
        <div v-if="message.type === 'system'" class="system-message-content">
          <span class="system-text">{{ message.content }}</span>
          <span class="message-time">{{ formatTime(message.timestamp) }}</span>
        </div>

        <!-- 用户消息 -->
        <div v-else class="user-message-content">
          <div class="message-avatar" v-if="message.senderId !== currentUserId">
            <van-image
              round
              width="36"
              height="36"
              :src="message.senderAvatar || '/default-avatar.png'"
            />
          </div>
          
          <div class="message-body">
            <div class="message-info" v-if="message.senderId !== currentUserId">
              <span class="sender-name">{{ message.senderName }}</span>
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
            </div>
            
            <div class="message-bubble">
              <div class="message-text">{{ message.content }}</div>
            </div>
          </div>

          <div class="message-avatar" v-if="message.senderId === currentUserId">
            <van-image
              round
              width="36"
              height="36"
              :src="currentUserAvatar"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input">
      <van-field
        v-model="inputMessage"
        placeholder="输入消息..."
        rows="1"
        autosize
        type="textarea"
        @keypress.enter.prevent="sendMessage"
        ref="messageInput"
      >
        <template #button>
          <van-button 
            type="primary" 
            size="small" 
            @click="sendMessage"
            :disabled="!inputMessage.trim()"
          >
            发送
          </van-button>
        </template>
      </van-field>
    </div>

    <!-- 成员列表弹窗 -->
    <van-popup
      v-model:show="showMembers"
      position="right"
      :style="{ width: '80%', height: '100%' }"
    >
      <div class="members-panel">
        <van-nav-bar
          title="聊天室成员"
          left-text="返回"
          @click-left="showMembers = false"
        />
        
        <van-list>
          <van-cell
            v-for="member in chatMembers"
            :key="member.id"
            :title="member.username"
            :label="member.role === 'organizer' ? '组织者' : '参与者'"
          >
            <template #icon>
              <van-image
                round
                width="40"
                height="40"
                :src="member.avatar || '/default-avatar.png'"
                style="margin-right: 10px;"
              />
            </template>
            <van-tag 
              v-if="member.online" 
              type="success" 
              size="small"
            >
              在线
            </van-tag>
          </van-cell>
        </van-list>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { showToast } from 'vant'

const props = defineProps({
  activityId: {
    type: String,
    required: true
  }
})

const authStore = useAuthStore()
const chatStore = useChatStore()

const inputMessage = ref('')
const messageList = ref(null)
const messageInput = ref(null)
const showMembers = ref(false)

// 计算属性
const currentUserId = computed(() => authStore.userInfo?.id)
const currentUserAvatar = computed(() => authStore.userInfo?.avatar || '/default-avatar.png')
const messages = computed(() => chatStore.messages)
const chatMembers = computed(() => chatStore.members)
const onlineCount = computed(() => chatStore.onlineCount)

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim()) return

  try {
    await chatStore.sendMessage({
      activityId: props.activityId,
      content: inputMessage.value.trim(),
      type: 'text'
    })
    
    inputMessage.value = ''
    scrollToBottom()
  } catch (error) {
    showToast('发送失败，请重试')
  }
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messageList.value) {
      messageList.value.scrollTop = messageList.value.scrollHeight
    }
  })
}

// 连接聊天室
const connectChat = () => {
  chatStore.connect(props.activityId)
}

// 断开聊天室
const disconnectChat = () => {
  chatStore.disconnect()
}

onMounted(() => {
  connectChat()
  scrollToBottom()
})

onUnmounted(() => {
  disconnectChat()
})
</script>

<style scoped>
.activity-chat {
  height: 500px;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
}

.chat-title h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.online-count {
  font-size: 12px;
  color: #666;
}

.message-list {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message-item {
  display: flex;
}

.own-message {
  justify-content: flex-end;
}

.system-message {
  justify-content: center;
}

.system-message-content {
  background: rgba(0, 0, 0, 0.05);
  padding: 8px 12px;
  border-radius: 15px;
  max-width: 70%;
  text-align: center;
}

.system-text {
  font-size: 12px;
  color: #666;
}

.user-message-content {
  display: flex;
  align-items: flex-start;
  max-width: 70%;
  gap: 8px;
}

.own-message .user-message-content {
  flex-direction: row-reverse;
}

.message-body {
  flex: 1;
  min-width: 0;
}

.message-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.own-message .message-info {
  justify-content: flex-end;
}

.sender-name {
  font-size: 12px;
  color: #666;
}

.message-time {
  font-size: 10px;
  color: #999;
}

.message-bubble {
  background: white;
  padding: 10px 12px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
}

.own-message .message-bubble {
  background: #1989fa;
  color: white;
}

.message-text {
  font-size: 14px;
  line-height: 1.4;
}

.chat-input {
  background: white;
  border-top: 1px solid #f0f0f0;
  padding: 10px 15px;
}

.members-panel {
  height: 100%;
  background: white;
}
</style>