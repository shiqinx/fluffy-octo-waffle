<template>
  <div class="chat-room">
    <!-- 聊天头部 -->
    <van-nav-bar
      :title="chatInfo.title"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    >
      <template #right>
        <van-icon name="ellipsis" @click="showMenu = true" />
      </template>
    </van-nav-bar>

    <!-- 消息列表 -->
    <div class="messages-container" ref="messagesContainer">
      <div 
        v-for="message in messages"
        :key="message.id"
        :class="['message-item', { 'own': message.isOwn }]"
      >
        <div class="message-avatar">
          <van-image
            :src="message.avatar"
            round
            width="32"
            height="32"
          />
        </div>
        <div class="message-content">
          <div class="message-sender" v-if="!message.isOwn">
            {{ message.sender }}
          </div>
          <div class="message-bubble">
            <div class="message-text">{{ message.content }}</div>
            <div class="message-time">
              {{ formatTime(message.timestamp) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入框 -->
    <div class="input-section">
      <van-field
        v-model="inputMessage"
        placeholder="输入消息..."
        rows="1"
        autosize
        type="textarea"
        class="message-input"
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

    <!-- 菜单 -->
    <van-action-sheet v-model:show="showMenu" :actions="menuActions" />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/stores/chat'

const route = useRoute()
const chatStore = useChatStore()

const activityId = route.params.activityId
const inputMessage = ref('')
const showMenu = ref(false)
const messagesContainer = ref(null)

const { messages, chatInfo } = storeToRefs(chatStore)

const menuActions = [
  { name: '成员列表' },
  { name: '活动详情' },
  { name: '举报聊天' }
]

const sendMessage = async () => {
  if (!inputMessage.value.trim()) return
  
  await chatStore.sendMessage({
    activityId,
    content: inputMessage.value.trim(),
    type: 'text'
  })
  
  inputMessage.value = ''
  scrollToBottom()
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 监听消息变化，自动滚动到底部
watch(messages, scrollToBottom, { deep: true })

onMounted(async () => {
  await chatStore.joinChatRoom(activityId)
  scrollToBottom()
})
</script>