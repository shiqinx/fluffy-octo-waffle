<template>
  <div class="activity-chat">
    <van-nav-bar
      title="活动聊天室"
      left-text="返回"
      left-arrow
      @click-left="$router.back()"
    />
    
    <div class="chat-container">
      <!-- 聊天消息区域 -->
      <div class="messages" ref="messagesRef">
        <div 
          v-for="message in messages" 
          :key="message.id"
          :class="['message', message.senderId === currentUserId ? 'own' : 'other']"
        >
          <div class="message-content">
            {{ message.content }}
          </div>
          <div class="message-time">
            {{ formatTime(message.timestamp) }}
          </div>
        </div>
      </div>
      
      <!-- 输入区域 -->
      <div class="input-area">
        <van-field
          v-model="newMessage"
          placeholder="输入消息..."
          @keyup.enter="sendMessage"
        >
          <template #button>
            <van-button 
              size="small" 
              type="primary" 
              @click="sendMessage"
              :disabled="!newMessage.trim()"
            >
              发送
            </van-button>
          </template>
        </van-field>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { Toast, showFailToast } from 'vant'
import { sendActivityChat, getActivityChatHistory } from '@/api/activity'

const route = useRoute()
const activityId = route.params.id
const messagesRef = ref(null)

const currentUserId = ref(1001) // 模拟当前用户ID
const newMessage = ref('')
const messages = ref([
  {
    id: 1,
    content: '欢迎大家参加活动！',
    senderId: 2001,
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 2,
    content: '请问活动具体在哪里集合？',
    senderId: 1001,
    timestamp: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 3,
    content: '在篮球场正门集合',
    senderId: 2001,
    timestamp: new Date(Date.now() - 1200000).toISOString()
  }
])

const sendMessage = async () => {
  if (!newMessage.value.trim()) return
  
  try {
    // 调用真实API发送消息
    const response = await sendActivityChat({
      activityId: String(activityId),
      content: newMessage.value.trim()
    })
    
    if (response && response.success) {
      // 添加消息到本地列表
      const message = {
        id: response.data?.id || Date.now(),
        content: newMessage.value.trim(),
        senderId: currentUserId.value,
        timestamp: new Date().toISOString()
      }
      
      messages.value.push(message)
      newMessage.value = ''
      
      // 滚动到底部
      nextTick(() => {
        if (messagesRef.value) {
          messagesRef.value.scrollTop = messagesRef.value.scrollHeight
        }
      })
    } else {
      console.warn('发送消息API响应无效，使用本地模拟:', response?.message || '发送消息失败')
      // API失败时仍然添加到本地列表（模拟发送成功）
      const message = {
        id: Date.now(),
        content: newMessage.value.trim(),
        senderId: currentUserId.value,
        timestamp: new Date().toISOString()
      }
      
      messages.value.push(message)
      newMessage.value = ''
      
      // 滚动到底部
      nextTick(() => {
        if (messagesRef.value) {
          messagesRef.value.scrollTop = messagesRef.value.scrollHeight
        }
      })
    }
  } catch (error) {
    console.warn('发送消息失败，使用本地模拟:', error.message)
    // API失败时仍然添加到本地列表（模拟发送成功）
    const message = {
      id: Date.now(),
      content: newMessage.value.trim(),
      senderId: currentUserId.value,
      timestamp: new Date().toISOString()
    }
    
    messages.value.push(message)
    newMessage.value = ''
    
    // 滚动到底部
    nextTick(() => {
      if (messagesRef.value) {
        messagesRef.value.scrollTop = messagesRef.value.scrollHeight
      }
    })
  }
}

const formatTime = (time) => {
  return new Date(time).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  console.log('进入活动聊天室，活动ID:', activityId)
  
  try {
    // 加载聊天历史记录
    const response = await getActivityChatHistory(String(activityId))
    
    if (response && response.success && response.data?.items) {
      messages.value = response.data.items
    } else {
      // 如果API调用失败，保留模拟数据作为回退
      console.warn('加载聊天历史失败，使用模拟数据:', response?.message || '未知错误')
    }
  } catch (error) {
    console.warn('加载聊天历史失败，使用模拟数据:', error.message)
    // 保留模拟数据作为回退
  }
  
  // 滚动到底部
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
})
</script>

<style scoped>
.activity-chat {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #f7f8fa;
}

.message {
  margin-bottom: 16px;
  display: flex;
}

.message.own {
  justify-content: flex-end;
}

.message.other {
  justify-content: flex-start;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 8px;
  word-wrap: break-word;
}

.message.own .message-content {
  background: #1989fa;
  color: white;
}

.message.other .message-content {
  background: white;
  color: #333;
  border: 1px solid #ebedf0;
}

.message-time {
  font-size: 12px;
  color: #969799;
  margin-top: 4px;
  text-align: center;
}

.input-area {
  padding: 16px;
  background: white;
  border-top: 1px solid #ebedf0;
}
</style>