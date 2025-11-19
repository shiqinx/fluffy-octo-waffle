<!-- @/views/MyActivitiesView.vue -->
<template>
  <div class="my-activities-view">
    <!-- 导航栏 -->
    <van-nav-bar 
      :title="pageTitle"
      left-text="返回"
      left-arrow
      @click-left="goBack"
      class="custom-nav-bar"
    />
    
    <!-- 标签页容器 -->
    <div class="tabs-container">
      <van-tabs v-model:active="activeTab" @change="onTabChange" class="custom-tabs">
        <van-tab title="我发布的" name="created">
          <div class="activities-content created-tab">
            <div 
              v-for="activity in createdActivities" 
              :key="activity.id"
              class="activity-item"
              @click="goToActivityDetail(activity.id)"
            >
              <div class="activity-header">
                <h3 class="activity-title">{{ activity.title }}</h3>
                <span :class="['activity-status', `status-${activity.status}`]">
                  {{ getStatusText(activity.status) }}
                </span>
              </div>
              
              <div class="activity-info">
                <div class="info-row">
                  <van-icon name="clock-o" />
                  <span>{{ formatDateTime(activity.activityTime) }}</span>
                </div>
                <div class="info-row">
                  <van-icon name="location-o" />
                  <span>{{ activity.location }}</span>
                </div>
                <div class="info-row">
                  <van-icon name="friends-o" />
                  <span>{{ activity.enrolledCount }}/{{ activity.maxParticipants }}人</span>
                </div>
              </div>
              
              <div class="activity-footer">
                <span class="activity-type">{{ activity.type }}</span>
                <span class="activity-time">{{ formatRelativeTime(activity.createTime) }}</span>
              </div>
            </div>
            
            <!-- 加载更多 -->
            <van-load-more 
              v-if="createdActivities.length > 0" 
              :loading="createdLoading" 
              :finished="createdFinished"
              finished-text="没有更多了"
              @load="loadCreatedActivities"
            />
            
            <!-- 空状态 -->
            <van-empty 
              v-if="!createdLoading && createdActivities.length === 0" 
              description="还没有发布任何活动"
            />
          </div>
        </van-tab>
        
        <van-tab title="我报名的" name="enrolled">
          <div class="activities-content enrolled-tab">
            <div 
              v-for="activity in enrolledActivities" 
              :key="activity.id"
              class="activity-item"
              @click="goToActivityDetail(activity.id)"
            >
              <div class="activity-header">
                <h3 class="activity-title">{{ activity.title }}</h3>
                <span :class="['activity-status', `status-${activity.status}`]">
                  {{ getStatusText(activity.status) }}
                </span>
              </div>
              
              <div class="activity-info">
                <div class="info-row">
                  <van-icon name="clock-o" />
                  <span>{{ formatDateTime(activity.activityTime) }}</span>
                </div>
                <div class="info-row">
                  <van-icon name="location-o" />
                  <span>{{ activity.location }}</span>
                </div>
                <div class="info-row">
                  <van-icon name="friends-o" />
                  <span>{{ activity.enrolledCount }}/{{ activity.maxParticipants }}人</span>
                </div>
              </div>
              
              <div class="activity-footer">
                <span class="activity-type">{{ activity.type }}</span>
                <span class="activity-time">{{ formatRelativeTime(activity.createTime) }}</span>
              </div>
            </div>
            
            <!-- 加载更多 -->
            <van-load-more 
              v-if="enrolledActivities.length > 0" 
              :loading="enrolledLoading" 
              :finished="enrolledFinished"
              finished-text="没有更多了"
              @load="loadEnrolledActivities"
            />
            
            <!-- 空状态 -->
            <van-empty 
              v-if="!enrolledLoading && enrolledActivities.length === 0" 
              description="还没有报名任何活动"
            />
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useActivityStore } from '@/stores/activityStore'
import { useAuthStore } from '@/stores/auth'
import { showToast } from 'vant'

const router = useRouter()
const activityStore = useActivityStore()
const authStore = useAuthStore()

// 响应式数据
const activeTab = ref('created')
const createdActivities = ref([])
const enrolledActivities = ref([])
const createdLoading = ref(false)
const enrolledLoading = ref(false)
const createdFinished = ref(false)
const enrolledFinished = ref(false)

// 计算属性 - 动态标题
const pageTitle = computed(() => {
  const title = activeTab.value === 'created' ? '我发布的' : '我报名的'
  console.log('=== 标题调试 ===', 'activeTab:', activeTab.value, 'computed title:', title)
  return title
})

// 返回上一页
const goBack = () => {
  router.back()
}

// 标签页切换
const onTabChange = (name) => {
  activeTab.value = name
  console.log('=== 标签页切换 ===', 'new tab:', name)
  if (name === 'enrolled') {
    loadEnrolledActivities()
  } else {
    loadCreatedActivities()
  }
}

// 跳转到活动详情
const goToActivityDetail = (activityId) => {
  router.push(`/activities/${activityId}`)
}

// 状态文本映射
const getStatusText = (status) => {
  const statusMap = {
    'draft': '草稿',
    'published': '已发布',
    'ongoing': '进行中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return statusMap[status] || status
}

// 状态颜色映射
const getStatusColor = (status) => {
  const colorMap = {
    'draft': '#969799',
    'published': '#07c160',
    'ongoing': '#1989fa',
    'completed': '#646566',
    'cancelled': '#ee0a24'
  }
  return colorMap[status] || '#646566'
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化相对时间
const formatRelativeTime = (dateTime) => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  const now = new Date()
  const diff = now - date
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return formatDateTime(dateTime)
}

// 加载我发布的活动
const loadCreatedActivities = async () => {
  if (createdLoading.value || createdFinished.value) return
  
  createdLoading.value = true
  try {
    console.log('=== 调试：我发布的活动加载 ===')
    // 使用测试数据
    const mockCreatedActivities = [
      {
        id: 1,
        title: '篮球友谊赛',
        type: '体育活动',
        location: '体育馆篮球场',
        activityTime: '2024-12-20T14:00:00',
        createTime: '2024-12-01T10:00:00',
        status: 'published',
        maxParticipants: 20,
        enrolledCount: 15,
        description: '欢迎参加篮球友谊赛！'
      },
      {
        id: 6,
        title: '中医养生讲座',
        type: '学术讲座',
        location: '教学楼A101',
        activityTime: '2024-12-25T19:00:00',
        createTime: '2024-12-02T09:00:00',
        status: 'published',
        maxParticipants: 100,
        enrolledCount: 45,
        description: '传统中医养生知识分享'
      }
    ]
    
    createdActivities.value = mockCreatedActivities
    createdFinished.value = true
    console.log('我发布的活动数据:', createdActivities.value)
  } catch (error) {
    console.error('加载我发布的活动失败:', error)
    showToast('加载失败')
  } finally {
    createdLoading.value = false
  }
}

// 加载我报名的活动
const loadEnrolledActivities = async () => {
  if (enrolledLoading.value || enrolledFinished.value) return
  
  enrolledLoading.value = true
  try {
    console.log('=== 调试：我报名的活动加载 ===')
    // 使用测试数据
    const mockEnrolledActivities = [
      {
        id: 2,
        title: '图书馆学习小组',
        type: '学习活动',
        location: '图书馆三楼研讨室',
        activityTime: '2024-12-18T19:00:00',
        createTime: '2024-11-28T15:30:00',
        status: 'ongoing',
        maxParticipants: 15,
        enrolledCount: 12,
        description: '一起学习，共同进步'
      },
      {
        id: 4,
        title: '网球友谊赛',
        type: '体育活动',
        location: '网球场',
        activityTime: '2024-12-22T16:00:00',
        createTime: '2024-12-03T11:20:00',
        status: 'published',
        maxParticipants: 16,
        enrolledCount: 8,
        description: '网球爱好者交流活动'
      },
      {
        id: 7,
        title: '宿舍联谊活动',
        type: '社交活动',
        location: '学生活动中心',
        activityTime: '2024-12-23T18:30:00',
        createTime: '2024-12-04T14:15:00',
        status: 'published',
        maxParticipants: 50,
        enrolledCount: 32,
        description: '宿舍间联谊交流活动'
      }
    ]
    
    enrolledActivities.value = mockEnrolledActivities
    enrolledFinished.value = true
    console.log('我报名的活动数据:', enrolledActivities.value)
  } catch (error) {
    console.error('加载我报名的活动失败:', error)
    showToast('加载失败')
  } finally {
    enrolledLoading.value = false
  }
}

// 页面初始化
onMounted(() => {
  console.log('=== MyActivitiesView 页面初始化 ===')
  console.log('=== 初始 activeTab 值 ===', activeTab.value)
  // 根据当前激活的标签页加载对应数据
  if (activeTab.value === 'created') {
    console.log('=== 初始化：加载我发布的活动 ===')
    loadCreatedActivities()
  } else if (activeTab.value === 'enrolled') {
    console.log('=== 初始化：加载我报名的活动 ===')
    loadEnrolledActivities()
  }
  
  // 强制加载两个标签页的数据用于测试
  console.log('=== 强制加载两个标签页数据用于调试 ===')
  loadCreatedActivities()
  setTimeout(() => {
    loadEnrolledActivities()
  }, 1000)
})
</script>

<style scoped>
.my-activities-view {
  min-height: 100vh;
  background-color: #f8fafc;
}

/* 导航栏样式 */
.custom-nav-bar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.custom-nav-bar :deep(.van-nav-bar__title) {
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.custom-nav-bar :deep(.van-nav-bar__text) {
  color: white;
}

.custom-nav-bar :deep(.van-icon) {
  color: white;
}

/* 标签页容器 */
.tabs-container {
  background: white;
  margin: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 自定义标签页样式 */
.custom-tabs :deep(.van-tabs__wrap) {
  background: transparent;
}

.custom-tabs :deep(.van-tabs__nav) {
  background: transparent;
  padding: 0 16px;
}

.custom-tabs :deep(.van-tab) {
  color: #646566;
  font-weight: 500;
  font-size: 15px;
  flex: none;
  padding: 0 20px;
}

.custom-tabs :deep(.van-tab--active) {
  color: #667eea;
  font-weight: 600;
}

.custom-tabs :deep(.van-tabs__line) {
  background: linear-gradient(90deg, #667eea, #764ba2);
  height: 3px;
  border-radius: 2px;
  width: 20px;
}

/* 活动内容区域 */
.activities-content {
  padding: 16px;
  background: #f8fafc;
  overflow-y: auto;
}

/* 活动项样式 */
.activity-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  cursor: pointer;
}

.activity-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.activity-item:last-child {
  margin-bottom: 0;
}

/* 活动头部 */
.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.activity-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin: 0;
  flex: 1;
  line-height: 1.4;
}

.activity-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  margin-left: 8px;
}

.status-draft {
  background-color: #f7f8fa;
  color: #969799;
}

.status-published {
  background-color: #f0f9ff;
  color: #07c160;
}

.status-ongoing {
  background-color: #e8f4fd;
  color: #1989fa;
}

.status-completed {
  background-color: #f7f8fa;
  color: #646566;
}

.status-cancelled {
  background-color: #fef2f2;
  color: #ee0a24;
}

/* 活动信息 */
.activity-info {
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  color: #646566;
  font-size: 14px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row .van-icon {
  margin-right: 6px;
  font-size: 14px;
  color: #969799;
}

/* 活动底部 */
.activity-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.activity-type {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.activity-time {
  color: #969799;
  font-size: 12px;
}

/* 我报名的页面特殊样式 */
.enrolled-tab .activity-item {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-left: 4px solid #22c55e;
  position: relative;
}

.enrolled-tab .activity-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #22c55e, #16a34a);
  border-radius: 3px 3px 0 0;
}

.enrolled-tab .activity-status {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  color: #16a34a;
  border: 1px solid #86efac;
}

.enrolled-tab .activity-type {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tabs-container {
    margin: 8px;
    border-radius: 8px;
  }
  
  .activities-content {
    padding: 12px;
  }
  
  .activity-item {
    padding: 12px;
    margin-bottom: 8px;
  }
  
  .activity-title {
    font-size: 15px;
  }
  
  .info-row {
    font-size: 13px;
  }
  
  .activity-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .activity-status {
    margin-left: 0;
    margin-top: 8px;
  }
}

/* 空状态样式 */
.van-empty {
  margin-top: 60px;
}

/* 加载更多样式 */
.van-load-more {
  margin-top: 20px;
}
</style>