<!-- @/components/Activity/ActivityDetailPopup.vue -->
<template>
  <van-popup
    :show="show"
    position="bottom"
    round
    closeable
    close-icon="close"
    :style="{ height: '85%' }"
    :overlay-style="{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }"
    @update:show="$emit('close')"
    @click-overlay="$emit('close')"
  >
    <div class="activity-detail-popup" v-if="activity">
      <div class="popup-content">
        <!-- 活动头部 -->
        <div class="activity-header">
          <h2 class="activity-title">{{ activity.title }}</h2>
          <van-tag :type="getActivityType(activity.type)">
            {{ getActivityTypeText(activity.type) }}
          </van-tag>
        </div>
        
        <!-- 组织者信息 -->
        <div class="organizer-info">
          <div class="organizer-avatar">
            <van-image
              round
              width="40"
              height="40"
              :src="activity.organizer.avatar"
              :alt="activity.organizer.name"
            />
          </div>
          <div class="organizer-details">
            <div class="organizer-name">{{ activity.organizer.name }}</div>
            <div class="organizer-role">组织者</div>
          </div>
        </div>
        
        <!-- 活动基本信息 -->
        <div class="activity-basic-info">
          <div class="info-grid">
            <div class="info-item">
              <van-icon name="location-o" />
              <div class="info-content">
                <div class="info-label">活动位置</div>
                <div class="info-value">{{ activity.locationName }}</div>
              </div>
            </div>
            <div class="info-item">
              <van-icon name="clock-o" />
              <div class="info-content">
                <div class="info-label">报名时间</div>
                <div class="info-value">截止 {{ formatTime(activity.registrationDeadline) }}</div>
              </div>
            </div>
            <div class="info-item">
              <van-icon name="calender-o" />
              <div class="info-content">
                <div class="info-label">活动时间</div>
                <div class="info-value">{{ formatTime(activity.startTime) }} - {{ formatTime(activity.endTime) }}</div>
              </div>
            </div>
            <div class="info-item">
              <van-icon name="friends-o" />
              <div class="info-content">
                <div class="info-label">参与人数</div>
                <div class="info-value">{{ activity.currentParticipants }}/{{ activity.maxParticipants }}人</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 地图位置 -->
        <div class="activity-map">
          <h3>活动位置</h3>
          <div class="map-container">
            <div class="map-placeholder">
              <van-icon name="location" size="48" color="#1989fa" />
              <p>{{ activity.locationName }}</p>
              <p class="distance">距离您 {{ activity.distance }}km</p>
            </div>
          </div>
        </div>
        
        <!-- 活动描述 -->
        <div class="activity-description">
          <h3>活动详情</h3>
          <p>{{ activity.description }}</p>
        </div>
        
        <!-- 报名状态和操作 -->
        <div class="enrollment-section">
          <!-- 组织者操作界面 -->
          <div v-if="isOrganizer" class="organizer-actions">
            <div class="status-info">
              <van-icon name="manager" color="#ff976a" />
              <span>您是此活动的组织者</span>
            </div>
            <div class="organizer-buttons">
              <van-button type="warning" size="small" @click="manageEnrollments">管理报名</van-button>
              <van-button type="primary" size="small" @click="editActivity">编辑活动</van-button>
              <van-button type="success" size="small" @click="viewParticipants">查看参与者</van-button>
              <van-button type="danger" size="small" @click="cancelActivity">取消活动</van-button>
            </div>
          </div>
          
          <!-- 普通用户报名界面 -->
          <div v-else-if="activity.isEnrolled" class="enrolled-status">
            <div class="status-info">
              <van-icon name="passed" color="#07c160" />
              <span>已报名，等待组织者审核</span>
            </div>
            <div class="enrolled-actions">
              <van-button type="primary" size="small" disabled>等待审核</van-button>
            </div>
          </div>
          <div v-else-if="activity.isApproved" class="approved-status">
            <div class="status-info">
              <van-icon name="certificate" color="#1989fa" />
              <span>报名已通过</span>
            </div>
            <div class="approved-actions">
              <van-button type="primary" size="small" @click="checkIn">位置签到</van-button>
              <van-button type="default" size="small" @click="openChat">活动聊天</van-button>
            </div>
          </div>
          <div v-else class="enroll-action">
            <van-button 
              type="primary" 
              size="large" 
              block
              :disabled="activity.currentParticipants >= activity.maxParticipants"
              @click="$emit('enroll', activity.id)"
            >
              {{ activity.currentParticipants >= activity.maxParticipants ? '已满员' : '立即报名' }}
            </van-button>
            <div v-if="activity.currentParticipants >= activity.maxParticipants" class="full-tip">
              该活动报名人数已满
            </div>
          </div>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { formatTime } from '@/utils/date'

const props = defineProps({
  activity: {
    type: Object,
    default: null
  },
  show: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close', 'enroll'])

const userStore = useUserStore()

// 计算当前用户是否为组织者
const isOrganizer = computed(() => {
  if (!props.activity || !props.activity.organizer || !userStore.userInfo) {
    return false
  }
  
  // 通过组织者ID或用户名匹配
  const organizerId = props.activity.organizer.id?.toString()
  const currentUserId = userStore.userInfo.id?.toString()
  const organizerName = props.activity.organizer.name
  const currentUserName = userStore.userInfo.realName || userStore.userInfo.name
  
  console.log('组织者检查:', {
    organizerId,
    currentUserId,
    organizerName,
    currentUserName,
    isMatch: organizerId === currentUserId || organizerName === currentUserName
  })
  
  return organizerId === currentUserId || organizerName === currentUserName
})

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

const checkIn = () => {
  console.log('位置签到')
}

const openChat = () => {
  console.log('打开活动聊天')
}

// 组织者操作方法
const manageEnrollments = () => {
  console.log('管理报名')
  // TODO: 实现报名管理功能
}

const editActivity = () => {
  console.log('编辑活动')
  // TODO: 实现活动编辑功能
}

const viewParticipants = () => {
  console.log('查看参与者')
  // TODO: 实现参与者查看功能
}

const cancelActivity = () => {
  console.log('取消活动')
  // TODO: 实现活动取消功能
}
</script>

<style scoped>
.activity-detail-popup {
  padding: 20px;
  height: 100%;
}

.popup-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.activity-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
  flex: 1;
  margin-right: 12px;
  line-height: 1.4;
}

.organizer-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.organizer-avatar {
  margin-right: 12px;
}

.organizer-details {
  flex: 1;
}

.organizer-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.organizer-role {
  font-size: 12px;
  color: #666;
}

.activity-basic-info {
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.info-item .van-icon {
  margin-right: 8px;
  margin-top: 2px;
  font-size: 16px;
  color: #1989fa;
}

.info-content {
  flex: 1;
}

.info-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.info-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.activity-map {
  margin-bottom: 20px;
}

.activity-map h3 {
  font-size: 16px;
  margin-bottom: 12px;
  color: #333;
}

.map-container {
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;
}

.map-placeholder {
  padding: 40px 20px;
  text-align: center;
  color: #666;
}

.map-placeholder .distance {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.activity-description {
  flex: 1;
  margin-bottom: 20px;
}

.activity-description h3 {
  font-size: 16px;
  margin-bottom: 8px;
  color: #333;
}

.activity-description p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.enrollment-section {
  margin-top: auto;
}

.enrolled-status,
.approved-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 12px;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
}

.enrolled-actions,
.approved-actions {
  display: flex;
  gap: 8px;
}

.full-tip {
  text-align: center;
  color: #ff4444;
  font-size: 12px;
  margin-top: 8px;
}

/* 组织者操作界面样式 */
.organizer-actions {
  padding: 16px;
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 8px;
  margin-bottom: 12px;
}

.organizer-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 12px;
}

.organizer-buttons .van-button {
  font-size: 12px;
  padding: 8px 12px;
  height: auto;
}
</style>