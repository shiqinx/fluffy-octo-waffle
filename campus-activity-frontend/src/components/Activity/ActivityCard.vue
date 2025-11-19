<!-- @/components/Activity/ActivityCard.vue -->
<template>
  <div class="activity-card" @click="$emit('click', activity)">
    <div class="card-header">
      <h3 class="activity-title">{{ activity.title }}</h3>
      <van-tag :type="getActivityType(activity.type)">
        {{ getActivityTypeText(activity.type) }}
      </van-tag>
    </div>
    
    <div class="card-content">
      <div class="activity-info">
        <div class="info-item">
          <van-icon name="location-o" />
          <span>{{ activity.locationName }}</span>
          <span class="distance">({{ activity.distance }}km)</span>
        </div>
        <div class="info-item">
          <van-icon name="clock-o" />
          <span>{{ formatTime(activity.startTime) }}</span>
        </div>
        <div class="info-item">
          <van-icon name="friends-o" />
          <span>{{ activity.currentParticipants }}/{{ activity.maxParticipants }}人</span>
        </div>
      </div>
      
      <div class="activity-organizer">
        <van-image
          round
          width="24"
          height="24"
          :src="activity.organizer.avatar"
          :alt="activity.organizer.name"
        />
        <span class="organizer-name">{{ activity.organizer.name }}</span>
      </div>
    </div>
    
    <div class="card-footer">
      <div class="time-badge">
        <van-tag v-if="isToday(activity.startTime)" type="danger">今天</van-tag>
        <van-tag v-else-if="isThisWeek(activity.startTime)" type="warning">本周</van-tag>
      </div>
      <div class="status">
        <van-tag v-if="activity.isEnrolled && activity.isApproved" type="success">已通过</van-tag>
        <van-tag v-else-if="activity.isEnrolled" type="warning">审核中</van-tag>
        <van-tag v-else-if="activity.status === 'full'" type="danger">已满员</van-tag>
        <van-tag v-else type="primary">可报名</van-tag>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatTime, isToday, isThisWeek } from '@/utils/date'

defineProps({
  activity: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])

const getActivityType = (type) => {
  const typeMap = {
    sports: 'primary',
    study: 'success',
    entertainment: 'warning',
    volunteer: 'danger'
  }
  return typeMap[type] || 'default'
}

const getActivityTypeText = (type) => {
  const typeTextMap = {
    sports: '运动',
    study: '学习',
    entertainment: '娱乐',
    volunteer: '志愿'
  }
  return typeTextMap[type] || '其他'
}
</script>

<style scoped>
.activity-card {
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

.activity-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
  flex: 1;
  margin-right: 8px;
  line-height: 1.4;
}

.card-content {
  margin-bottom: 12px;
}

.activity-info {
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

.distance {
  margin-left: 4px;
  color: #1989fa;
  font-weight: 500;
}

.activity-organizer {
  display: flex;
  align-items: center;
}

.organizer-name {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.time-badge {
  display: flex;
  gap: 4px;
}
</style>