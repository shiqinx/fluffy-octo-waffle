<template>
  <div class="message-item" :class="{ unread: !message.isRead }" @click="$emit('click')">
    <div class="message-left">
      <div class="message-icon" :class="message.type">
        <van-icon :name="getIconName(message.type)" />
      </div>
    </div>
    
    <div class="message-content">
      <div class="message-header">
        <span class="message-title">{{ message.title }}</span>
        <span class="message-time">{{ formatTime(message.createTime) }}</span>
      </div>
      
      <div class="message-body">
        <p class="message-text">{{ message.content }}</p>
      </div>
      
      <div class="message-footer" v-if="message.extra">
        <span class="message-extra">{{ message.extra }}</span>
      </div>
    </div>
    
    <div class="message-actions">
      <van-button
        v-if="!message.isRead"
        size="mini"
        type="primary"
        class="read-btn"
        @click.stop="markAsRead"
      >
        标记已读
      </van-button>
      
      <van-icon
        name="delete"
        class="delete-btn"
        @click.stop="onDelete"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { showToast } from 'vant'
import { useMessageStore } from '@/stores/message'

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click', 'delete'])

const messageStore = useMessageStore()

const getIconName = (type) => {
  const iconMap = {
    system: 'volume-o',
    activity: 'flag-o',
    team: 'friends-o',
    chat: 'chat-o'
  }
  return iconMap[type] || 'bell-o'
}

const formatTime = (timeStr) => {
  const now = new Date()
  const time = new Date(timeStr)
  const diff = now - time
  
  // 1分钟内
  if (diff < 60000) {
    return '刚刚'
  }
  
  // 1小时内
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  }
  
  // 1天内
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  }
  
  // 1周内
  if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}天前`
  }
  
  // 更早的时间
  return time.toLocaleDateString('zh-CN')
}

const markAsRead = async () => {
  try {
    await messageStore.markAsRead(props.message.id)
    showToast('标记为已读')
  } catch (error) {
    console.error('标记已读失败:', error)
    showToast('操作失败')
  }
}

const onDelete = () => {
  emit('delete', props.message.id)
}
</script>

<style scoped>
.message-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background-color 0.2s;
}

.message-item.unread {
  background: #f8f9ff;
}

.message-item:hover {
  background: #f5f7fa;
}

.message-left {
  margin-right: 12px;
}

.message-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.message-icon.system {
  background: #ff976a;
}

.message-icon.activity {
  background: #1989fa;
}

.message-icon.team {
  background: #07c160;
}

.message-icon.chat {
  background: #ff6b6b;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.message-title {
  font-weight: 600;
  color: #323233;
  font-size: 14px;
}

.message-time {
  font-size: 12px;
  color: #969799;
}

.message-text {
  margin: 0;
  color: #646566;
  font-size: 13px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  display: box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  box-orient: vertical;
}

.message-footer {
  margin-top: 4px;
}

.message-extra {
  font-size: 12px;
  color: #969799;
}

.message-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
}

.read-btn {
  font-size: 12px;
  padding: 0 8px;
  height: 24px;
}

.delete-btn {
  color: #969799;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
}

.delete-btn:hover {
  color: #ee0a24;
}
</style>