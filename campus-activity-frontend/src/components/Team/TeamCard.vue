<!-- @/components/Team/TeamCard.vue -->
<template>
  <div class="team-card" @click="$emit('click', team)">
    <div class="card-header">
      <h3 class="team-name">{{ team.name }}</h3>
      <van-tag type="primary">{{ team.type }}</van-tag>
    </div>
    
    <div class="card-content">
      <div class="team-info">
        <div class="info-item">
          <van-icon name="user-o" />
          <span>{{ team.currentMembers }}/{{ team.maxMembers }}人</span>
        </div>
        <div class="info-item">
          <van-icon name="clock-o" />
          <span>创建于 {{ formatTime(team.createdAt) }}</span>
        </div>
      </div>
      
      <div class="team-description">
        <p>{{ team.description }}</p>
      </div>
    </div>
    
    <div class="card-footer">
      <div class="team-leader">
        <van-image
          round
          width="24"
          height="24"
          :src="team.leader.avatar"
          :alt="team.leader.name"
        />
        <span class="leader-name">{{ team.leader.name }}</span>
      </div>
      <div class="status">
        <van-tag v-if="team.isMember" type="success">已加入</van-tag>
        <van-tag v-else-if="team.status === 'full'" type="danger">已满员</van-tag>
        <van-tag v-else type="primary">可加入</van-tag>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatTime } from '@/utils/date'

defineProps({
  team: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])
</script>

<style scoped>
.team-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.team-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
  flex: 1;
  margin-right: 8px;
}

.card-content {
  margin-bottom: 12px;
}

.team-info {
  margin-bottom: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.info-item .van-icon {
  margin-right: 4px;
  font-size: 14px;
}

.team-description p {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  margin: 0;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.team-leader {
  display: flex;
  align-items: center;
}

.leader-name {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
}
</style>