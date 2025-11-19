<template>
  <div class="message-list-content">
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多消息了"
        @load="onLoad"
      >
        <div v-if="messages.length === 0 && !loading" class="empty-state">
          <van-empty description="暂无消息" />
        </div>

        <message-item
          v-for="message in messages"
          :key="message.id"
          :message="message"
          @click="$emit('item-click', message)"
          @delete="onDeleteMessage"
        />
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { showConfirmDialog, showToast } from 'vant'
import MessageItem from '@/components/Message/MessageItem.vue'

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['refresh', 'item-click'])

const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)

const onRefresh = () => {
  refreshing.value = true
  emit('refresh')
  setTimeout(() => {
    refreshing.value = false
  }, 1000)
}

const onLoad = () => {
  // 加载更多消息的逻辑
  // 这里可以根据实际API实现分页加载
  setTimeout(() => {
    finished.value = true
  }, 1000)
}

const onDeleteMessage = async (messageId) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除这条消息吗？'
    })
    
    // 这里调用删除消息的API
    // await messageStore.deleteMessage(messageId)
    showToast('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除消息失败:', error)
      showToast('删除失败')
    }
  }
}

// 监听messages变化
watch(() => props.messages, (newMessages) => {
  if (newMessages.length === 0) {
    finished.value = true
  }
})
</script>

<style scoped>
.message-list-content {
  min-height: 400px;
}

.empty-state {
  padding: 40px 0;
}
</style>