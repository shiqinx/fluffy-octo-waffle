<template>
  <div class="activity-detail">
    <!-- 加载状态覆盖层 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载活动详情中...</div>
    </div>
    
    <!-- 紧凑的顶部导航 -->
    <div class="header">
      <button class="back-btn" @click="$router.back()">‹</button>
      <h1 class="title">活动详情</h1>
      <div class="header-actions">
        <button class="action-btn" @click="toggleActionMenu">⋯</button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 紧凑的地图部分 -->
      <div v-if="hasLocation" class="map-section compact">
        <div class="map-compact">
          <div 
            ref="fullMapElement" 
            class="map-container small"
            :class="{ loading: mapLoading }"
          >
            <div v-if="mapLoading" class="map-loading">
              <div class="loading-spinner small"></div>
            </div>
          </div>
          <div class="location-info-compact">
            <div class="location-name">{{ activity?.location?.name || '活动地点' }}</div>
            <div class="location-address">{{ activity?.location?.address || '' }}</div>
            <div v-if="userDistance" class="distance-info">距离 {{ userDistance }}米</div>
          </div>
        </div>
      </div>

      <!-- 如果没有位置信息 -->
      <div v-else class="no-location-compact">
        <span class="icon">📍</span>
        <span>暂无位置信息</span>
      </div>
    </div>

    <!-- 活动内容区域 -->
    <div class="activity-content-scrollable">
      <!-- 活动基本信息 -->
      <div class="activity-header">
        <h2 class="activity-title">{{ activity?.title || '活动标题' }}</h2>
        <div class="activity-meta">
          <span class="category-tag">{{ getCategoryText(activity?.category) }}</span>
          <span class="participants">👥 {{ activity?.currentParticipants || 0 }}/{{ activity?.maxParticipants || 0 }}人</span>
        </div>
      </div>

      <!-- 时间信息 -->
      <div class="time-info">
        <div class="info-item">
          <span class="icon">📅</span>
          <div class="info-content">
            <div class="info-label">报名时间</div>
            <div class="info-value">{{ formatTime(activity?.enrollStartTime) }} - {{ formatTime(activity?.enrollEndTime) }}</div>
          </div>
        </div>
        <div class="info-item">
          <span class="icon">🕒</span>
          <div class="info-content">
            <div class="info-label">活动时间</div>
            <div class="info-value">{{ formatTime(activity?.startTime) }} - {{ formatTime(activity?.endTime) }}</div>
          </div>
        </div>
      </div>

      <!-- 组织者信息 -->
      <div class="organizer-info">
        <div class="organizer-avatar">
          <img :src="activity?.organizer?.avatar || defaultAvatar" alt="组织者" class="avatar-image">
        </div>
        <div class="organizer-details">
          <h4>{{ activity?.organizer?.name || '未知组织者' }}</h4>
          <p>{{ activity?.organizer?.role || '组织者' }}</p>
          <p class="organizer-credit">信誉分: {{ activity?.organizer?.creditScore || 100 }}</p>
        </div>
        <button class="contact-btn" @click="contactOrganizer">联系</button>
      </div>

      <!-- 活动描述 -->
      <div class="description-section">
        <h3>活动介绍</h3>
        <div class="description-content">
          {{ activity?.description || '暂无活动描述' }}
        </div>
      </div>





      <!-- 组织者视图：活动管理面板 -->
      <div v-if="userRole === 'organizer'" class="organizer-dashboard">
        <div class="dashboard-header">
          <h3>🎯 活动管理面板</h3>
          <div class="organizer-badge">
            <span class="badge-icon">👑</span>
            <span>组织者</span>
          </div>
        </div>
        
        <!-- 管理统计 -->
        <div class="management-stats">
          <div class="stat-card">
            <div class="stat-number">{{ activity.currentParticipants || 0 }}</div>
            <div class="stat-label">当前参与者</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ pendingEnrollments.length }}</div>
            <div class="stat-label">待审核</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ approvedParticipants.length }}</div>
            <div class="stat-label">已通过</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ checkedInParticipants.length }}</div>
            <div class="stat-label">已签到</div>
          </div>
        </div>

        <!-- 快捷操作 -->
        <div class="quick-actions">
          <button class="action-btn primary" @click="editActivity">
            <span class="btn-icon">✏️</span>
            编辑活动
          </button>
          <button class="action-btn success" @click="enterChatRoom">
            <span class="btn-icon">💬</span>
            管理聊天
          </button>
          <button class="action-btn secondary" @click="exportParticipants">
            <span class="btn-icon">📊</span>
            导出名单
          </button>
          <button 
            class="action-btn danger" 
            @click="cancelActivity" 
            v-if="activity?.status === 'recruiting'"
          >
            <span class="btn-icon">❌</span>
            取消活动
          </button>
        </div>
      </div>

      <!-- 组织者视图：报名审核 -->
      <div v-if="userRole === 'organizer'" class="enrollment-review-section">
        <h3>报名审核</h3>
        <div v-if="pendingEnrollments.length === 0" class="no-pending">
          暂无待审核报名
        </div>
        <div v-else class="pending-list">
          <div 
            v-for="enrollment in pendingEnrollments" 
            :key="enrollment.id" 
            class="pending-item"
          >
            <div class="user-info">
              <img :src="enrollment.user?.avatar || defaultAvatar" alt="用户头像" class="user-avatar">
              <div class="user-details">
                <div class="user-name">{{ enrollment.user?.name || '未知用户' }}</div>
                <div class="user-meta">
                  <span>学号: {{ enrollment.user?.studentId || '未填写' }}</span>
                  <span>专业: {{ enrollment.user?.major || '未填写' }}</span>
                  <span>信誉分: {{ enrollment.user?.creditScore || 0 }}</span>
                </div>
                <div v-if="enrollment.remarks" class="remarks">
                  备注: {{ enrollment.remarks }}
                </div>
              </div>
            </div>
            <div class="action-buttons">
              <button 
                class="btn success small" 
                @click="approveEnrollment(enrollment)"
              >
                通过
              </button>
              <button 
                class="btn danger small" 
                @click="rejectEnrollment(enrollment)"
              >
                拒绝
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 组织者视图：参与者签到状态 -->
      <div v-if="userRole === 'organizer'" class="participants-checkin-section">
        <h3>参与者签到状态</h3>
        <div v-if="approvedParticipants.length === 0" class="no-participants">
          暂无已通过审核的参与者
        </div>
        <div v-else class="participants-list">
          <div 
            v-for="participant in approvedParticipants" 
            :key="participant.userId" 
            class="participant-item"
          >
            <div class="user-info">
              <img :src="participant.avatar || defaultAvatar" alt="用户头像" class="user-avatar">
              <div class="user-details">
                <div class="user-name">{{ participant.name || '未知用户' }}</div>
                <div class="user-meta">
                  <span>信誉分: {{ participant.creditScore || 0 }}</span>
                </div>
              </div>
            </div>
            <div class="checkin-status">
              <span :class="['status-badge', participant.checkedIn ? 'checked-in' : 'not-checked-in']">
                {{ participant.checkedIn ? '已签到' : '未签到' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 参与者视图：参与者专属面板 -->
      <div v-if="userRole === 'participant'" class="my-enrollment-section">
        <h3>我的报名状态</h3>
        <div class="enrollment-status">
          <div class="status-item">
            <span class="status-label">报名状态:</span>
            <span :class="['status-value', enrollmentStatus]">
              {{ getEnrollmentStatusText(enrollmentStatus) }}
            </span>
          </div>
          <div v-if="enrollmentStatus === 'approved'" class="status-item">
            <span class="status-label">签到状态:</span>
            <span :class="['status-value', myCheckInStatus]">
              {{ myCheckInStatus === 'checked_in' ? '已签到' : '未签到' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 - 统一处理 -->
    <div v-if="!loading && activity" class="bottom-actions">
      <template v-if="userRole === 'organizer'">
        <!-- 组织者视图 -->
        <button class="btn secondary" @click="editActivity">编辑活动</button>
        <button class="btn secondary" @click="exportParticipants">导出名单</button>
        <button class="btn primary" @click="enterChatRoom">进入聊天室</button>
        <button class="btn danger" @click="cancelActivity" v-if="activity?.status === 'recruiting'">
          取消活动
        </button>
      </template>
      
      <template v-else-if="userRole === 'participant'">
        <!-- 参与者视图 -->
        <template v-if="enrollmentStatus === 'not_enrolled'">
          <button 
            class="btn primary" 
            @click="openEnrollmentForm" 
            :disabled="!canEnroll"
          >
            {{ canEnroll ? '立即报名' : '报名已结束' }}
          </button>
        </template>
        
        <template v-else-if="enrollmentStatus === 'pending'">
          <button class="btn secondary" disabled>审核中</button>
          <button class="btn danger" @click="cancelEnrollment">取消报名</button>
        </template>
        
        <template v-else-if="enrollmentStatus === 'approved'">
          <button 
            class="btn success" 
            @click="checkIn" 
            v-if="canCheckIn && !myCheckInStatus"
            :disabled="!isInCheckInTime"
          >
            {{ isInCheckInTime ? '位置签到' : '签到时间未到' }}
          </button>
          <button class="btn primary" @click="enterChatRoom">进入聊天室</button>
          <button class="btn danger" @click="quitActivity">退出活动</button>
        </template>
        
        <template v-else-if="enrollmentStatus === 'rejected'">
          <button class="btn secondary" disabled>报名被拒</button>
          <button class="btn primary" @click="reapplyActivity">重新申请</button>
        </template>
      </template>
      
      <template v-else>
        <!-- 未登录或其他状态 -->
        <button 
          class="btn primary" 
          @click="openEnrollmentForm" 
          :disabled="!canEnroll"
        >
          {{ canEnroll ? '立即报名' : '报名已结束' }}
        </button>
      </template>
    </div>

    <!-- 操作菜单 -->
    <div v-if="showActionMenu" class="action-menu">
      <div class="menu-item" @click="shareActivity">
        <span class="icon">📤</span>
        <span>分享活动</span>
      </div>
      <div class="menu-item" @click="reportActivity">
        <span class="icon">🚩</span>
        <span>举报活动</span>
      </div>
    </div>

    <!-- 遮罩层 -->
    <div 
      v-if="showActionMenu" 
      class="overlay"
      @click="showActionMenu = false"
    ></div>

    <!-- 报名表单 -->
    <EnrollmentForm 
      v-if="showEnrollmentForm"
      :activity="activity"
      @submit="handleEnrollment"
      @close="showEnrollmentForm = false"
    />

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showSuccessToast, showFailToast, showConfirmDialog, showToast } from 'vant'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/userStore'
import { useActivityStore } from '@/stores/activityStore'
import { 
  getActivityDetail, 
  joinActivity, 
  checkInActivity, 
  agreeJoinActivity 
} from '@/api/activity'
import EnrollmentForm from '@/components/Activity/EnrollmentForm.vue'
import { mapConfig, campusCenter, campusBuildings } from '@/config/map.js'
import { calculateDistance } from '@/utils/location.js'
import { getUserLocation } from '@/utils/map.js'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const route = useRoute()
const router = useRouter()
const activityStore = useActivityStore()
const userStore = useUserStore()

// 响应式数据
const activity = ref({
  id: '',
  title: '',
  category: '',
  description: '',
  status: 'recruiting',
  startTime: '',
  endTime: '',
  enrollStartTime: '',
  enrollEndTime: '',
  location: null,
  coords: null,
  organizer: null,
  currentParticipants: 0,
  maxParticipants: 0,
  participants: [],
  enrollments: []
})

const showActionMenu = ref(false)
const showEnrollmentForm = ref(false)
const loading = ref(false)
const loadError = ref(null)
const mapLoading = ref(false)
const userDistance = ref(null)

// 地图相关
const fullMapElement = ref(null)
const fullMap = ref(null)

// 默认图片
const defaultAvatar = ref('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCAiZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEOURBREIiLz4KPHBhdGggZD0iTTIwIDIyQzIzLjMxMzcgMjIgMjYgMTkuMzEzNyAyNiAxNkMyNiAxMi42ODYzIDIzLjMxMzcgMTAgMjAgMTBDMTYuNjg2MyAxMCAxNCAxMi42ODYzIDE0IDE2QzE0IDE5LjMxMzcgMTYuNjg2MyAyMiAyMCAyMloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yOCAzMEMyOCAyNy43OTAyIDI2LjIwOTggMjYgMjQgMjZIMTZDMTMuNzkwMiAyNiAxMiAyNy43OTAyIDEyIDMwVjMxQzEyIDMxLjU1MjMgMTIuNDQ3NyAzMiAxMyAzMkgyN0MyNy41NTIzIDMyIDI4IDMxLjU1MjMgMjggMzFWMzBaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K')

// 计算属性
const userRole = computed(() => {
  if (!activity.value.organizer || !userStore.userInfo) return 'participant'
  return activity.value.organizer.id === userStore.userInfo.id ? 'organizer' : 'participant'
})

// 报名状态相关
const enrollmentStatus = computed(() => {
  if (!userStore.userInfo || !activity.value.enrollments) return 'not_enrolled'
  
  const myEnrollment = activity.value.enrollments.find(
    enrollment => enrollment.userId === userStore.userInfo.id
  )
  
  return myEnrollment?.status || 'not_enrolled'
})

const myCheckInStatus = computed(() => {
  if (!userStore.userInfo || !activity.value.participants) return null
  
  const myParticipation = activity.value.participants.find(
    participant => participant.userId === userStore.userInfo.id
  )
  
  return myParticipation?.checkedIn ? 'checked_in' : 'not_checked_in'
})

// 是否可以报名
const canEnroll = computed(() => {
  if (!activity.value.enrollStartTime || !activity.value.enrollEndTime) return false
  
  const now = new Date()
  const enrollStart = new Date(activity.value.enrollStartTime)
  const enrollEnd = new Date(activity.value.enrollEndTime)
  
  return now >= enrollStart && now <= enrollEnd
})

// 是否可以签到
const canCheckIn = computed(() => {
  return enrollmentStatus.value === 'approved'
})

// 是否在签到时间内
const isInCheckInTime = computed(() => {
  if (!activity.value.startTime || !activity.value.endTime) return false
  
  const now = new Date()
  const startTime = new Date(activity.value.startTime)
  const endTime = new Date(activity.value.endTime)
  
  return now >= startTime && now <= endTime
})

const hasLocation = computed(() => {
  return activity.value && activity.value.coords && activity.value.coords.length === 2
})

// 组织者相关计算属性
const pendingEnrollments = computed(() => {
  if (!activity.value.enrollments) return []
  return activity.value.enrollments.filter(enrollment => enrollment.status === 'pending')
})

const approvedParticipants = computed(() => {
  if (!activity.value.participants) return []
  return activity.value.participants.filter(participant => participant.status === 'approved')
})

const checkedInParticipants = computed(() => {
  if (!activity.value.participants) return []
  return activity.value.participants.filter(participant => participant.checkedIn === true)
})

// 用户角色由系统自动判断，无需手动切换

// 加载活动数据
const loadActivity = async () => {
  if (loading.value) return // 防止重复加载
  
  loading.value = true
  loadError.value = null
  
  try {
    const activityId = route.params.id
    console.log('🔍 ActivityDetail: 获取活动ID:', activityId, '(类型:', typeof activityId, ')')
    
    // 使用真实API获取活动详情
    const response = await getActivityDetail(activityId)
    
    if (response && response.success && response.data) {
      activity.value = response.data
      console.log('✅ 成功获取活动数据:', activity.value.title)
      console.log('🆔 活动详情ID:', activity.value.id, '(类型:', typeof activity.value.id, ')')
      
      // 等待DOM更新后初始化地图
      await nextTick()
      if (hasLocation.value) {
        initFullMap()
      }
    } else {
      console.warn('❌ API响应无效，使用模拟数据:', response?.message || '获取活动详情失败')
      throw new Error(response?.message || '获取活动详情失败')
    }
  } catch (error) {
    console.error('❌ 加载活动详情失败:', error)
    loadError.value = error.message
    
    // 根据错误类型显示不同的提示信息
    let errorMessage = '加载活动详情失败，请稍后重试'
    let showAvailableActivities = false
    
    if (error.message && error.message.includes('不存在')) {
      errorMessage = `活动不存在或已被删除。您可能访问了过期的链接。`
      showAvailableActivities = true
    } else if (error.error && error.error.code === 'ACTIVITY_NOT_FOUND') {
      errorMessage = `${error.error.message}`
      showAvailableActivities = true
    }
    
    // 显示友好的错误提示
    showToast(errorMessage, 'error')
    
    // 如果是活动不存在错误，提供跳转到活动列表的选项
    if (showAvailableActivities) {
      setTimeout(() => {
        if (confirm('活动不存在。是否跳转到活动列表查看可用活动？')) {
          router.push('/activities')
        } else {
          // 用户选择不跳转，返回上一页
          if (window.history.length > 1) {
            router.back()
          } else {
            router.push('/activities')
          }
        }
      }, 1000)
    } else {
      // 其他错误，2秒后自动返回
      setTimeout(() => {
        if (window.history.length > 1) {
          router.back()
        } else {
          router.push('/activities')
        }
      }, 2000)
    }
    return
  } finally {
    loading.value = false
  }
}

// 其他必要的方法
const getStatusText = (status) => {
  const statusMap = {
    recruiting: '招募中',
    in_progress: '进行中',
    ended: '已结束',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

const getCategoryText = (category) => {
  const categoryMap = {
    lecture: '讲座',
    sports: '运动',
    game: '桌游',
    study: '学习',
    other: '其他'
  }
  return categoryMap[category] || category
}

const getEnrollmentStatusText = (status) => {
  const statusMap = {
    not_enrolled: '未报名',
    pending: '审核中',
    approved: '已通过',
    rejected: '被拒绝'
  }
  return statusMap[status] || status
}

const formatTime = (timeStr) => {
  if (!timeStr) return '未设置'
  try {
    return new Date(timeStr).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return '时间格式错误'
  }
}

// 报名相关方法
const openEnrollmentForm = () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  showEnrollmentForm.value = true
}

const handleEnrollment = async (enrollmentData) => {
  try {
    // 使用真实API报名
    const response = await joinActivity(activity.value.id, enrollmentData)
    
    if (response.success) {
      // 更新本地状态
      const newEnrollment = {
        id: Date.now(), // 临时ID
        userId: userStore.userInfo.id,
        user: {
          id: userStore.userInfo.id,
          name: enrollmentData.name || userStore.userInfo.name,
          avatar: userStore.userInfo.avatar || defaultAvatar.value,
          creditScore: userStore.userInfo.creditScore || 80,
          studentId: enrollmentData.studentId,
          major: enrollmentData.major,
          grade: enrollmentData.grade
        },
        status: 'pending',
        appliedAt: new Date().toISOString(),
        remarks: enrollmentData.remarks || ''
      }
      
      activity.value.enrollments.push(newEnrollment)
      showEnrollmentForm.value = false
      
      showSuccessToast('报名成功！等待组织者审核')
    } else {
      throw new Error(response.message || '报名失败')
    }
  } catch (error) {
    console.error('报名失败:', error)
    showFailToast(error.message || '报名失败，请稍后重试')
  }
}

const cancelEnrollment = async () => {
  if (confirm('确定要取消报名吗？')) {
    try {
      const enrollmentIndex = activity.value.enrollments.findIndex(
        enrollment => enrollment.userId === userStore.userInfo.id
      )
      if (enrollmentIndex !== -1) {
        activity.value.enrollments.splice(enrollmentIndex, 1)
      }
      alert('已取消报名')
    } catch (error) {
      console.error('取消报名失败:', error)
      alert('取消报名失败，请稍后重试')
    }
  }
}

const reapplyActivity = () => {
  openEnrollmentForm()
}

// 签到功能
const checkIn = async () => {
  try {
    // 检查是否在签到时间内
    if (!isInCheckInTime.value) {
      showFailToast('不在签到时间内，请在活动开始后到结束前进行签到')
      return
    }
    
    // 使用真实API签到
    const response = await checkInActivity(activity.value.id)
    
    if (response.success) {
      // 更新本地签到状态
      const participantIndex = activity.value.participants.findIndex(
        participant => participant.userId === userStore.userInfo.id
      )
      
      if (participantIndex !== -1) {
        activity.value.participants[participantIndex].checkedIn = true
      }
      
      showSuccessToast('签到成功！')
    } else {
      throw new Error(response.message || '签到失败')
    }
  } catch (error) {
    console.error('签到失败:', error)
    showFailToast(error.message || '签到失败，请重试')
  }
}

// 其他方法
const toggleActionMenu = () => {
  showActionMenu.value = !showActionMenu.value
}

// 组织者审核功能
const approveEnrollment = async (enrollmentId) => {
  try {
    // 使用真实API审核通过
    const response = await agreeJoinActivity({
      activityId: activity.value.id,
      enrollmentId: enrollmentId,
      action: 'approve'
    })
    
    if (response.success) {
      // 更新本地状态
      const enrollment = activity.value.enrollments.find(e => e.id === enrollmentId)
      if (!enrollment) return
      
      enrollment.status = 'approved'
      
      // 添加到参与者列表
      activity.value.participants.push({
        userId: enrollment.userId,
        userName: enrollment.userName,
        avatar: enrollment.avatar,
        enrollmentTime: enrollment.enrollmentTime,
        status: 'approved',
        checkInStatus: 'not_checked'
      })
      
      // 更新参与人数
      activity.value.currentParticipants = activity.value.participants.length
      
      showSuccessToast(`已通过 ${enrollment.userName} 的报名申请`)
    } else {
      throw new Error(response.message || '审核通过失败')
    }
  } catch (error) {
    console.error('审核通过失败:', error)
    showFailToast(error.message || '审核通过失败，请稍后重试')
  }
}

const rejectEnrollment = async (enrollmentId) => {
  try {
    const enrollment = activity.value.enrollments.find(e => e.id === enrollmentId)
    if (!enrollment) return
    
    // 使用真实API审核拒绝
    const response = await agreeJoinActivity({
      activityId: activity.value.id,
      enrollmentId: enrollmentId,
      action: 'reject'
    })
    
    if (response.success) {
      // 更新本地状态
      enrollment.status = 'rejected'
      showSuccessToast(`已拒绝 ${enrollment.userName} 的报名申请`)
    } else {
      throw new Error(response.message || '审核拒绝失败')
    }
  } catch (error) {
    console.error('审核拒绝失败:', error)
    showFailToast(error.message || '审核拒绝失败，请稍后重试')
  }
}

const contactOrganizer = () => {
  if (!activity.value.organizer) return
  router.push(`/chat/${activity.value.organizer.id}`)
}

const editActivity = () => {
  router.push(`/activities/edit/${activity.value.id}`)
}

const exportParticipants = () => {
  alert('导出参与者名单功能')
}

const cancelActivity = async () => {
  if (confirm('确定要取消这个活动吗？此操作不可撤销。')) {
    try {
      activity.value.status = 'cancelled'
      alert('活动已取消')
    } catch (error) {
      console.error('取消活动失败:', error)
      alert('取消活动失败，请稍后重试')
    }
  }
}

const enterChatRoom = () => {
  router.push(`/chat/${activity.value.id}`)
}

const quitActivity = async () => {
  if (confirm('确定要退出这个活动吗？')) {
    try {
      // 从参与者列表中移除
      const participantIndex = activity.value.participants.findIndex(
        participant => participant.userId === userStore.userInfo.id
      )
      if (participantIndex !== -1) {
        activity.value.participants.splice(participantIndex, 1)
      }
      
      // 从报名列表中移除
      const enrollmentIndex = activity.value.enrollments.findIndex(
        enrollment => enrollment.userId === userStore.userInfo.id
      )
      if (enrollmentIndex !== -1) {
        activity.value.enrollments.splice(enrollmentIndex, 1)
      }
      
      // 更新参与人数
      activity.value.currentParticipants = Math.max(0, activity.value.currentParticipants - 1)
      
      // 扣除信誉分
      userStore.updateCreditScore(-3, `退出活动"${activity.value.title}"`)
      
      alert('已退出活动，信誉分-3')
    } catch (error) {
      console.error('退出活动失败:', error)
      alert('退出活动失败，请稍后重试')
    }
  }
}

const shareActivity = () => {
  if (navigator.share) {
    navigator.share({
      title: activity.value.title,
      text: activity.value.description,
      url: window.location.href
    })
  } else {
    navigator.clipboard.writeText(window.location.href)
    alert('活动链接已复制到剪贴板')
  }
  showActionMenu.value = false
}

const reportActivity = () => {
  router.push('/report?type=activity&id=' + activity.value.id)
  showActionMenu.value = false
}

// 工具函数
// getCurrentPosition 函数已从 @/utils/map.js 导入为 getUserLocation

// calculateDistance 函数已从 @/utils/location.js 导入

// 参与者面板辅助方法
const getEnrollmentStatusIcon = (status) => {
  const icons = {
    'not_enrolled': '📝',
    'pending': '⏳',
    'approved': '✅',
    'rejected': '❌',
    'cancelled': '🚫'
  }
  return icons[status] || '📝'
}

const getEnrollmentStatusDesc = (status) => {
  const descriptions = {
    'not_enrolled': '您还未报名此活动，点击下方按钮立即报名参加',
    'pending': '您的报名申请正在审核中，请耐心等待组织者审核',
    'approved': '恭喜！您的报名申请已通过，可以参加本次活动',
    'rejected': '很遗憾，您的报名申请被拒绝，可以重新申请',
    'cancelled': '您已取消报名，如需参加请重新报名'
  }
  return descriptions[status] || '未知状态'
}

// 地图相关方法
const initFullMap = async () => {
  if (!fullMapElement.value || !activity.value.coords) return
  
  try {
    mapLoading.value = true
    
    // 等待地图API加载
    await new Promise((resolve, reject) => {
      if (window.AMap) {
        resolve()
        return
      }
      
      const script = document.createElement('script')
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${mapConfig.amapKey}`
      script.onload = resolve
      script.onerror = () => reject(new Error('地图API加载失败'))
      document.head.appendChild(script)
    })
    
    // 再次检查AMap是否可用
    if (!window.AMap) {
      throw new Error('AMap对象未定义')
    }
    
    // 创建地图实例
    if (fullMapElement.value) {
      const map = new AMap.Map(fullMapElement.value, {
        center: activity.value.coords,
        zoom: 17,
        viewMode: '2D',
        mapStyle: 'amap://styles/normal'
      })
      
      // 添加校园建筑物标记
      addCampusBuildings(map)
      
      // 添加活动位置标记
      addActivityMarker(map)
      
      // 添加用户位置（不阻塞地图初始化）
      addUserLocation(map).catch(error => {
        console.log('用户位置获取失败，但地图已正常初始化')
      })
      
      fullMap.value = map
      console.log('✅ 地图初始化完成')
    }
  } catch (error) {
    console.warn('地图初始化失败:', error)
    // 不抛出错误，让页面继续显示其他内容
  } finally {
    mapLoading.value = false
  }
}

const addCampusBuildings = (map) => {
  if (!map || !campusBuildings || !window.AMap) return

  Object.keys(campusBuildings).forEach(buildingKey => {
    const building = campusBuildings[buildingKey]
    if (building && building.coords) {
      try {
        const marker = new AMap.Marker({
          position: building.coords,
          title: building.name,
          content: `
            <div style="
              display: flex;
              flex-direction: column;
              align-items: center;
              cursor: pointer;
            ">
              <div style="
                width: 20px;
                height: 20px;
                background: #2196F3;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                z-index: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                font-weight: bold;
                color: white;
              ">${building.name.charAt(0)}</div>
              <div style="
                margin-top: 4px;
                padding: 2px 6px;
                background: rgba(0, 0, 0, 0.8);
                border-radius: 4px;
                font-size: 10px;
                color: white;
                white-space: nowrap;
                box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 80px;
                overflow: hidden;
                text-overflow: ellipsis;
              ">${building.name}</div>
            </div>
          `,
          offset: new AMap.Pixel(0, -25)
        })
        map.add(marker)
      } catch (error) {
        console.warn('添加建筑物标记失败:', building.name, error)
      }
    }
  })
}

const addActivityMarker = (map) => {
  if (!map || !activity.value || !activity.value.coords || !window.AMap) return

  try {
    const activityMarker = new AMap.Marker({
      position: activity.value.coords,
      title: activity.value.title,
      content: `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        ">
          <div style="
            width: 28px;
            height: 28px;
            background: #FF6B6B;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 3px 8px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: white;
            font-weight: bold;
            z-index: 100;
          ">活</div>
          <div style="
            margin-top: 6px;
            padding: 4px 8px;
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            font-size: 11px;
            color: #333;
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-weight: 600;
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
          ">${activity.value.title}</div>
        </div>
      `,
      offset: new AMap.Pixel(0, -40)
    })
    map.add(activityMarker)
  } catch (error) {
    console.warn('添加活动标记失败:', error)
  }
}

const addUserLocation = async (map) => {
  if (!map || !window.AMap) return

  try {
    const userCoords = await getUserLocation()
    
    const userMarker = new AMap.Marker({
      position: [userCoords.lng, userCoords.lat],
      title: '我的位置',
      content: `
        <div style="
          width: 24px;
          height: 24px;
          background: #1890ff;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        "></div>
      `
    })
    map.add(userMarker)

    if (activity.value.coords && activity.value.coords.length === 2) {
      const distance = calculateDistance([userCoords.lng, userCoords.lat], activity.value.coords)
      userDistance.value = Math.round(distance)
    }
  } catch (error) {
    console.warn('添加用户位置标记失败:', error)
    
    // 根据错误类型提供不同的处理
    if (error.code === error.PERMISSION_DENIED) {
      console.log('用户拒绝了地理位置权限')
      // 不显示错误提示，静默处理
    } else if (error.code === error.POSITION_UNAVAILABLE) {
      console.log('位置信息不可用')
    } else if (error.code === error.TIMEOUT) {
      console.log('获取位置信息超时')
    } else {
      console.log('获取位置时发生未知错误:', error.message)
    }
    
    // 不抛出错误，让地图继续显示其他内容
  }
}

const refreshLocation = () => {
  if (fullMap.value && activity.value.coords) {
    fullMap.value.setCenter(activity.value.coords)
    fullMap.value.setZoom(17)
  }
}

// 清理地图资源
const cleanupMap = () => {
  if (fullMap.value) {
    fullMap.value.destroy()
    fullMap.value = null
  }
}

// 监听路由参数变化
watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      console.log('🔄 路由参数变化，重新加载活动数据:', oldId, '->', newId)
      loadActivity()
    }
  },
  { immediate: false }
)

// 初始化
onMounted(() => {
  // 直接加载活动数据，用户信息由登录系统提供
  loadActivity()
})

onUnmounted(() => {
  cleanupMap()
})
</script>

<style scoped>
/* 加载覆盖层样式 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-text {
  font-size: 16px;
  color: #666;
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 用户切换器样式 */
.user-switcher {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #ffeb3b;
  padding: 8px 12px;
  font-size: 12px;
  z-index: 1000;
  display: flex;
  gap: 8px;
  align-items: center;
  border-bottom: 1px solid #ccc;
}

.user-switcher button {
  padding: 4px 8px;
  font-size: 11px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.user-switcher button:hover {
  background: #f0f0f0;
}

.activity-detail {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.header {
  position: sticky;
  top: 40px; /* 为用户切换器留出空间 */
  z-index: 100;
  background: white;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e9ecef;
}

.back-btn {
  font-size: 24px;
  background: none;
  border: none;
  padding: 4px 8px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  font-size: 20px;
  padding: 4px 8px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.map-section {
  background: white;
  margin: 0;
  padding: 0;
  flex-shrink: 0;
}

.map-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.map-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.btn.secondary.small {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 6px;
}

.map-container {
  width: 100%;
  height: 200px;
  position: relative;
  background: #f5f5f5;
}

.map-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.location-info {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.location-name {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 4px;
}

.location-address {
  font-size: 12px;
  color: #666;
}

.distance-info {
  font-size: 12px;
  color: #1890ff;
  font-weight: 500;
}

.activity-content-scrollable {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 70px;
}

.basic-info {
  background: white;
  padding: 16px;
  margin-bottom: 8px;
}

.activity-title {
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 600;
}

.activity-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}

.category-tag {
  padding: 4px 8px;
  background: #e6f7ff;
  color: #1890ff;
  border-radius: 12px;
  font-size: 12px;
}

.participants {
  font-size: 14px;
  color: #666;
}

.time-info {
  background: white;
  padding: 16px;
  margin-bottom: 8px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .icon {
  font-size: 20px;
  margin-top: 2px;
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
  font-weight: 500;
}

.organizer-info {
  background: white;
  padding: 16px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.organizer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.organizer-details {
  flex: 1;
}

.organizer-details h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
}

.organizer-details p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.organizer-credit {
  font-size: 12px;
  color: #999;
}

.contact-btn {
  padding: 8px 16px;
  border: 1px solid #1890ff;
  color: #1890ff;
  background: white;
  border-radius: 6px;
  font-size: 14px;
}

.description-section {
  background: white;
  padding: 16px;
  margin-bottom: 8px;
}

.description-section h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
}

.description-content {
  line-height: 1.6;
  color: #333;
}

.enrollment-section, .participants-section, .my-enrollment-section {
  background: white;
  padding: 16px;
  margin-bottom: 8px;
}

.enrollment-section h3, .participants-section h3, .my-enrollment-section h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
}

.enrollment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.enrollment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}

.enrollment-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  font-size: 14px;
}

.user-credit {
  font-size: 12px;
  color: #666;
}

.enrollment-actions {
  display: flex;
  gap: 8px;
}

.participants-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.participant-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}

.participant-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.participant-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.participant-details {
  display: flex;
  flex-direction: column;
}

.participant-name {
  font-weight: 500;
  font-size: 14px;
}

.participant-status {
  margin-top: 4px;
}

.status-tag {
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
}

.status-tag.checked-in {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.status-tag.not-checked-in {
  background: #fff2e8;
  color: #fa541c;
  border: 1px solid #ffbb96;
}

.participant-credit {
  font-size: 12px;
  color: #666;
}

.enrollment-status {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-label {
  font-size: 14px;
  color: #666;
}

.status-value {
  font-size: 14px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 6px;
}

.status-value.pending {
  background: #fff7e6;
  color: #fa8c16;
}

.status-value.approved {
  background: #f6ffed;
  color: #52c41a;
}

.status-value.rejected {
  background: #fff2f0;
  color: #ff4d4f;
}

.status-value.not_enrolled {
  background: #f5f5f5;
  color: #666;
}

.bottom-actions {
  position: fixed;
  bottom: 50px; /* 调整到底部导航栏上方 */
  left: 0;
  right: 0;
  background: white;
  padding: 12px 16px;
  border-top: 1px solid #e9ecef;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  gap: 8px;
  z-index: 100; /* 高于底部导航栏的z-index */
}

.btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

.btn.primary {
  background: #1890ff;
  color: white;
}

.btn.secondary {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #d9d9d9;
}

.btn.danger {
  background: #ff4d4f;
  color: white;
}

.btn.success {
  background: #52c41a;
  color: white;
}

.btn.small {
  padding: 6px 12px;
  font-size: 12px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-menu {
  position: fixed;
  bottom: 80px;
  right: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  overflow: hidden;
}

.menu-item {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.menu-item:last-child {
  border-bottom: none;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 参与者面板样式 */
.participant-dashboard {
  background: linear-gradient(135deg, #56CCF2 0%, #2F80ED 100%);
  margin: 8px 16px;
  border-radius: 16px;
  padding: 20px;
  color: white;
  box-shadow: 0 8px 32px rgba(47, 128, 237, 0.3);
}

.participant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.participant-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.participant-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.participation-status {
  margin-bottom: 20px;
}

.status-card, .checkin-card {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-icon, .checkin-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

.status-info, .checkin-info {
  flex: 1;
}

.status-title, .checkin-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.status-desc, .checkin-desc {
  font-size: 13px;
  opacity: 0.9;
  line-height: 1.4;
}

.participant-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.participate-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 12px;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #333;
  min-height: 50px;
}

.participate-btn:hover:not(:disabled) {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.participate-btn.primary {
  background: #1890ff;
  color: white;
}

.participate-btn.primary:hover:not(:disabled) {
  background: #40a9ff;
}

.participate-btn.success {
  background: #52c41a;
  color: white;
}

.participate-btn.success:hover:not(:disabled) {
  background: #73d13d;
}

.participate-btn.danger {
  background: #ff4d4f;
  color: white;
}

.participate-btn.danger:hover:not(:disabled) {
  background: #ff7875;
}

.participate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .participant-dashboard {
    margin: 8px 12px;
    padding: 16px;
  }
  
  .status-card, .checkin-card {
    padding: 14px;
  }
  
  .status-icon, .checkin-icon {
    font-size: 20px;
    width: 36px;
    height: 36px;
  }
  
  .status-title, .checkin-title {
    font-size: 15px;
  }
  
  .status-desc, .checkin-desc {
    font-size: 12px;
  }
  
  .participate-btn {
    padding: 12px 16px;
    font-size: 14px;
    min-height: 46px;
  }
}

/* 组织者管理面板样式 */
.organizer-dashboard {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 8px 16px;
  border-radius: 16px;
  padding: 20px;
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dashboard-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.organizer-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.badge-icon {
  font-size: 14px;
}

.management-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.stat-number {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 11px;
  opacity: 0.9;
  font-weight: 500;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #333;
}

.action-btn:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.action-btn.primary {
  background: #1890ff;
  color: white;
}

.action-btn.primary:hover {
  background: #40a9ff;
}

.action-btn.success {
  background: #52c41a;
  color: white;
}

.action-btn.success:hover {
  background: #73d13d;
}

.action-btn.danger {
  background: #ff4d4f;
  color: white;
}

.action-btn.danger:hover {
  background: #ff7875;
}

.btn-icon {
  font-size: 16px;
}

@media (max-width: 768px) {
  .organizer-dashboard {
    margin: 8px 12px;
    padding: 16px;
  }
  
  .management-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  
  .stat-card {
    padding: 10px;
  }
  
  .stat-number {
    font-size: 18px;
  }
  
  .quick-actions {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .action-btn {
    padding: 10px 14px;
    font-size: 13px;
  }
}

.no-location-section {
  background: white;
  margin: 8px 0;
  padding: 40px 20px;
  text-align: center;
}

.no-location-content .icon {
  font-size: 48px;
  margin-bottom: 12px;
  display: block;
}

.no-location-content p {
  margin: 0 0 8px 0;
  color: #666;
}

.no-location-content .hint {
  font-size: 12px;
  color: #999;
}

.no-enrollments {
  text-align: center;
  color: #999;
  padding: 20px;
}

@media (max-width: 768px) {
  .map-container {
    height: 180px;
  }
  
  .bottom-actions {
    padding: 12px;
    bottom: 50px; /* 移动端也保持在底部导航栏上方 */
  }
  
  .btn {
    padding: 10px;
    font-size: 13px;
  }
}
</style>

/* 紧凑布局样式 */
.activity-header {
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
}

.activity-header .activity-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1a1a1a;
}

.activity-header .activity-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}

.map-section.compact {
  margin: 0;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
}

.map-compact {
  display: flex;
  gap: 12px;
  align-items: center;
}

.map-container.small {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.loading-spinner.small {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

.location-info-compact {
  flex: 1;
  min-width: 0;
}

.location-info-compact .location-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.location-info-compact .location-address {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.location-info-compact .distance-info {
  font-size: 11px;
  color: #1989fa;
  font-weight: 500;
}

.no-location-compact {
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #999;
  font-size: 14px;
}

/* 调整主内容区域 */
.main-content {
  flex: 1;
  overflow-y: auto;
  background: #f8f9fa;
  padding-top: 0;
}

.activity-content-scrollable {
  padding: 0;
}

/* 隐藏重复的基本信息 */
.basic-info {
  display: none;
}

/* 调整其他区域的间距 */
.time-info,
.organizer-info,
.description-section,
.enrollment-section,
.participants-section,
.my-enrollment-section {
  margin: 12px 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}