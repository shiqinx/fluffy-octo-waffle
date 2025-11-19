<template>
  <div class="chat-room">
    <van-nav-bar
      :title="roomInfo.title"
      left-text="返回"
      left-arrow
      @click-left="$router.back()"
    >
      <template #right>
        <van-icon name="friends-o" @click="showMembers = true" />
      </template>
    </van-nav-bar>

    <div class="chat-content" ref="chatContentRef">
      <!-- 消息列表 -->
      <div class="message-list">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="['message-item', { 'own-message': message.isOwn }]"
        >
          <!-- 系统消息 -->
          <div v-if="message.type === 'system'" class="system-message">
            <span class="system-text">{{ message.content }}</span>
          </div>

          <!-- 用户消息 -->
          <div v-else class="user-message">
            <van-image
              v-if="!message.isOwn"
              round
              width="32"
              height="32"
              :src="message.avatar"
              class="message-avatar"
            />
            
            <div class="message-bubble">
              <div v-if="!message.isOwn" class="sender-name">
                {{ message.senderName }}
              </div>
              <div class="message-content">
                <span class="message-text">{{ message.content }}</span>
                <span class="message-time">{{ formatTime(message.timestamp) }}</span>
              </div>
            </div>

            <van-image
              v-if="message.isOwn"
              round
              width="32"
              height="32"
              :src="message.avatar"
              class="message-avatar"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <van-field
        v-model="inputMessage"
        placeholder="输入消息..."
        rows="1"
        autosize
        type="textarea"
        @keypress.enter="sendMessage"
      >
        <template #button>
          <van-button
            size="small"
            type="primary"
            :disabled="!inputMessage.trim()"
            @click="sendMessage"
          >
            发送
          </van-button>
        </template>
      </van-field>
    </div>

    <!-- 成员列表侧边栏 -->
    <van-popup
      v-model:show="showMembers"
      position="right"
      :style="{ width: '80%', height: '100%' }"
    >
      <div class="member-sidebar">
        <van-nav-bar
          title="聊天成员"
          left-text="关闭"
          left-arrow
          @click-left="showMembers = false"
        />
        
        <div class="member-list">
          <van-cell
            v-for="member in roomMembers"
            :key="member.id"
            :title="member.name"
            :label="member.role"
          >
            <template #icon>
              <van-image
                round
                width="40"
                height="40"
                :src="member.avatar"
              />
            </template>
          </van-cell>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { showToast } from 'vant'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const roomId = route.params.id
const roomType = route.params.type || 'activity'

const roomInfo = ref({
  id: roomId,
  title: '活动聊天室',
  type: roomType
})

const messages = ref([])
const roomMembers = ref([])
const inputMessage = ref('')
const showMembers = ref(false)
const chatContentRef = ref(null)

// WebSocket连接
let socket = null
let reconnectTimer = null

const currentUser = computed(() => authStore.userInfo)

onMounted(() => {
  initChatRoom()
  connectWebSocket()
  loadChatHistory()
  loadRoomMembers()
})

onUnmounted(() => {
  disconnectWebSocket()
})

const initChatRoom = () => {
  // 根据房间类型设置标题
  if (roomType === 'activity') {
    roomInfo.value.title = '活动聊天室'
  } else if (roomType === 'team') {
    roomInfo.value.title = '团队聊天室'
  }
}

const connectWebSocket = () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      showToast('请先登录')
      return
    }

    // 模拟WebSocket连接
    console.log('连接聊天室WebSocket...')
    
    // 模拟接收消息
    setTimeout(() => {
      const mockMessage = {
        id: Date.now(),
        type: 'user',
        content: '欢迎来到聊天室！',
        senderId: 'system',
        senderName: '系统',
        avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
        timestamp: new Date(),
        isOwn: false
      }
      addMessage(mockMessage)
    }, 1000)

  } catch (error) {
    console.error('WebSocket连接失败:', error)
    showToast('连接聊天室失败')
  }
}

const disconnectWebSocket = () => {
  if (socket) {
    socket.close()
    socket = null
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
  }
}

const loadChatHistory = () => {
  // 模拟加载聊天历史
  const mockHistory = [
    {
      id: 1,
      type: 'system',
      content: '聊天室已创建',
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: 2,
      type: 'user',
      content: '大家好！',
      senderId: 'user2',
      senderName: '小明',
      avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
      timestamp: new Date(Date.now() - 1800000),
      isOwn: false
    },
    {
      id: 3,
      type: 'user',
      content: '欢迎小明！',
      senderId: 'user3',
      senderName: '小红',
      avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
      timestamp: new Date(Date.now() - 1200000),
      isOwn: false
    }
  ]
  
  messages.value = mockHistory
  scrollToBottom()
}

const loadRoomMembers = () => {
  // 模拟加载聊天室成员
  roomMembers.value = [
    {
      id: currentUser.value.id,
      name: currentUser.value.realName,
      avatar: currentUser.value.avatar,
      role: '我'
    },
    {
      id: 'user2',
      name: '小明',
      avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
      role: '成员'
    },
    {
      id: 'user3',
      name: '小红',
      avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
      role: '成员'
    },
    {
      id: 'user4',
      name: '组织者',
      avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
      role: '组织者'
    }
  ]
}

const sendMessage = () => {
  if (!inputMessage.value.trim()) return

  const newMessage = {
    id: Date.now(),
    type: 'user',
    content: inputMessage.value.trim(),
    senderId: currentUser.value.id,
    senderName: currentUser.value.realName,
    avatar: currentUser.value.avatar,
    timestamp: new Date(),
    isOwn: true
  }

  // 添加到消息列表
  addMessage(newMessage)
  
  // 模拟发送到服务器
  console.log('发送消息:', newMessage)
  
  // 清空输入框
  inputMessage.value = ''
  
  // 模拟回复
  setTimeout(() => {
    const replyMessage = {
      id: Date.now() + 1,
      type: 'user',
      content: '收到你的消息了！',
      senderId: 'user2',
      senderName: '小明',
      avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
      timestamp: new Date(),
      isOwn: false
    }
    addMessage(replyMessage)
  }, 1000)
}

const addMessage = (message) => {
  messages.value.push(message)
  scrollToBottom()
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContentRef.value) {
      chatContentRef.value.scrollTop = chatContentRef.value.scrollHeight
    }
  })
}

const formatTime = (timestamp) => {
  const time = new Date(timestamp)
  return time.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.chat-room {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: #f7f8fa;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.system-message {
  text-align: center;
  margin: 8px 0;
}

.system-text {
  background: rgba(0, 0, 0, 0.1);
  color: #969799;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.user-message {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.own-message {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.message-bubble {
  max-width: 70%;
}

.sender-name {
  font-size: 12px;
  color: #969799;
  margin-bottom: 4px;
  padding: 0 8px;
}

.own-message .sender-name {
  text-align: right;
}

.message-content {
  background: white;
  padding: 8px 12px;
  border-radius: 8px;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.own-message .message-content {
  background: #1989fa;
  color: white;
}

.message-text {
  display: block;
  word-wrap: break-word;
  line-height: 1.4;
}

.message-time {
  font-size: 10px;
  color: #ccc;
  margin-top: 4px;
  display: block;
}

.own-message .message-time {
  color: rgba(255, 255, 255, 0.7);
}

.input-area {
  background: white;
  border-top: 1px solid #ebedf0;
  padding: 8px 16px;
}

.member-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.member-list {
  flex: 1;
  overflow-y: auto;
}
</style>