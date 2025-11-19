<!-- @/components/Team/TeamDetailPopup.vue -->
<template>
  <van-popup
    :show="show"
    position="bottom"
    round
    closeable
    close-icon="close"
    :style="{ height: '85%' }"
    @update:show="$emit('close')"
  >
    <div class="team-detail-popup" v-if="team">
      <div class="popup-content">
        <!-- 团队头部 -->
        <div class="team-header">
          <h2 class="team-name">{{ team.name }}</h2>
          <van-tag :type="getTeamType(team.type)">{{ team.type }}</van-tag>
        </div>
        
        <!-- 团队信息 -->
        <div class="team-info">
          <div class="info-item">
            <van-icon name="user-o" />
            <span>队长: {{ team.leader.name }}</span>
          </div>
          <div class="info-item">
            <van-icon name="friends-o" />
            <span>{{ team.currentMembers }}/{{ team.maxMembers }}人</span>
          </div>
          <div class="info-item">
            <van-icon name="clock-o" />
            <span>创建于: {{ formatTime(team.createdAt) }}</span>
          </div>
        </div>
        
        <!-- 团队描述 -->
        <div class="team-description">
          <h3>团队介绍</h3>
          <p>{{ team.description }}</p>
        </div>
        
        <!-- 团队成员 -->
        <div class="team-members">
          <h3>团队成员</h3>
          <div class="members-list">
            <div v-for="member in team.members" :key="member.id" class="member-item">
              <van-image
                round
                width="32"
                height="32"
                :src="member.avatar"
                :alt="member.name"
              />
              <span class="member-name">{{ member.name }}</span>
              <van-tag v-if="member.id === team.leader.id" size="small" type="primary">队长</van-tag>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="action-buttons">
          <van-button 
            v-if="!team.isMember"
            type="primary" 
            size="large" 
            block
            @click="$emit('join', team.id)"
          >
            申请加入
          </van-button>
          <div v-else class="joined-status">
            <van-button type="success" size="large" block disabled>
              已加入
            </van-button>
            <div class="action-links">
              <van-button type="default" size="small" @click="openChat">
                团队聊天
              </van-button>
              <van-button type="default" size="small" @click="viewTeamManagement">
                团队管理
              </van-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { formatTime } from '@/utils/date'

const router = useRouter()

defineProps({
  team: {
    type: Object,
    default: null
  },
  show: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close', 'join'])

const getTeamType = (type) => {
  const typeMap = {
    '学习': 'primary',
    '运动': 'success',
    '娱乐': 'warning',
    '志愿': 'danger'
  }
  return typeMap[type] || 'default'
}

const openChat = () => {
  // 打开团队聊天
  console.log('打开团队聊天')
}

const viewTeamManagement = () => {
  // 查看团队管理
  router.push('/teams/management')
}
</script>

<style scoped>
.team-detail-popup {
  padding: 20px;
  height: 100%;
}

.popup-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.team-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.team-name {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
  flex: 1;
  margin-right: 12px;
}

.team-info {
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
}

.info-item .van-icon {
  margin-right: 8px;
  font-size: 16px;
}

.team-description {
  margin-bottom: 20px;
}

.team-description h3 {
  font-size: 16px;
  margin-bottom: 8px;
  color: #333;
}

.team-description p {
  color: #666;
  line-height: 1.5;
  margin: 0;
}

.team-members {
  flex: 1;
  margin-bottom: 20px;
}

.team-members h3 {
  font-size: 16px;
  margin-bottom: 12px;
  color: #333;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-name {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.action-buttons {
  margin-top: auto;
}

.joined-status {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-links {
  display: flex;
  gap: 12px;
}

.action-links .van-button {
  flex: 1;
}
</style>