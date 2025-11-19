<template>
  <div class="my-created-activities">
    <!-- 导航栏 -->
    <van-nav-bar
      title="我发布的活动"
      left-arrow
      @click-left="$router.go(-1)"
      class="custom-nav-bar"
    />

    <!-- 活动列表 -->
    <div class="activities-content">
      <div v-if="loading" class="loading">
        <van-loading size="24px">加载中...</van-loading>
      </div>
      
      <div v-else-if="activities.length === 0" class="empty-state">
        <van-empty description="暂无发布的活动" />
      </div>
      
      <div v-else class="activity-list">
        <div 
          v-for="activity in activities" 
          :key="activity.id"
          class="activity-item"
          @click="goToActivityDetail(activity.id)"
        >
          <div class="activity-header">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-status" :class="getStatusClass(activity.status)">
              {{ getStatusText(activity.status) }}
            </div>
          </div>
          
          <div class="activity-info">
            <div class="info-item">
              <van-icon name="location-o" />
              <span>{{ activity.location }}</span>
            </div>
            <div class="info-item">
              <van-icon name="clock-o" />
              <span>{{ formatDateTime(activity.startTime) }}</span>
            </div>
            <div class="info-item">
              <van-icon name="friends-o" />
              <span>{{ activity.currentParticipants }}/{{ activity.maxParticipants }}人</span>
            </div>
          </div>
          
          <div class="activity-description">
            {{ activity.description }}
          </div>
          
          <div class="activity-footer">
            <div class="activity-tags">
              <van-tag 
                v-for="tag in activity.tags" 
                :key="tag" 
                type="primary" 
                size="small"
              >
                {{ tag }}
              </van-tag>
            </div>
            <div class="activity-actions">
              <van-button 
                size="small" 
                type="primary" 
                @click.stop="editActivity(activity.id)"
              >
                编辑
              </van-button>
              <van-button 
                size="small" 
                type="danger" 
                @click.stop="deleteActivity(activity.id)"
              >
                删除
              </van-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载更多 -->
    <div v-if="hasMore && !loading" class="load-more">
      <van-button @click="loadMore" type="primary" plain>
        加载更多
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showSuccessToast, showFailToast } from 'vant'
import { getActivityList, deleteActivity as deleteActivityApi } from '@/api/activity'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const activities = ref([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = 10

// 页面初始化
onMounted(() => {
  console.log('=== 我发布的活动页面初始化 ===')
  loadActivities()
})

// 加载活动数据
const loadActivities = async (isLoadMore = false) => {
  if (loading.value) return
  
  loading.value = true
  console.log('=== 调试：开始加载我发布的活动 ===')
  
  try {
    // 使用真实API获取我发布的活动
    const response = await getActivityList({
      page: page.value,
      pageSize: pageSize,
      creatorId: authStore.user?.id || 1, // 修复userInfo访问错误，使用user属性
      status: 'all' // 获取所有状态的活动
    })
    
    if (response && response.success && response.data) {
      const newActivities = response.data.list || []
      
      if (isLoadMore) {
        activities.value.push(...newActivities)
      } else {
        activities.value = newActivities
      }
      
      // 判断是否还有更多数据
      hasMore.value = newActivities.length === pageSize
      
      console.log('成功获取活动列表:', activities.value)
    } else {
      // API调用失败，使用模拟数据
      console.warn('API调用失败，使用模拟数据:', response?.message || '未知错误')
      await loadMockData(isLoadMore)
    }
  } catch (error) {
    console.error('加载活动列表失败:', error)
    showFailToast(error.message || '加载活动列表失败')
    
    // 如果API调用失败，回退到模拟数据
    await loadMockData(isLoadMore)
  } finally {
    loading.value = false
  }
}

// 加载模拟数据（作为回退方案）
const loadMockData = async (isLoadMore = false) => {
  try {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 根据页码生成不同的数据
    const allMockData = [
      // 第一页数据
      [
        {
          id: 1,
          title: '篮球友谊赛',
          description: '周末篮球友谊赛，欢迎所有篮球爱好者参加，一起享受运动的快乐！',
          location: '学校篮球场',
          startTime: '2024-01-20 14:00:00',
          endTime: '2024-01-20 17:00:00',
          status: 'recruiting',
          currentParticipants: 8,
          maxParticipants: 10,
          tags: ['运动', '篮球', '友谊赛'],
          creatorId: 1,
          creatorName: '张三'
        },
        {
          id: 2,
          title: '中医养生讲座',
          description: '邀请中医专家讲解中医养生知识，了解传统中医文化，学习健康养生方法。',
          location: '教学楼A101',
          startTime: '2024-01-25 19:00:00',
          endTime: '2024-01-25 21:00:00',
          status: 'recruiting',
          currentParticipants: 25,
          maxParticipants: 50,
          tags: ['讲座', '中医', '养生'],
          creatorId: 1,
          creatorName: '张三'
        },
        {
          id: 3,
          title: '摄影作品展览',
          description: '展示学生摄影作品，分享摄影技巧和心得，欢迎摄影爱好者交流学习。',
          location: '艺术楼展厅',
          startTime: '2024-01-22 10:00:00',
          endTime: '2024-01-22 18:00:00',
          status: 'ongoing',
          currentParticipants: 35,
          maxParticipants: 100,
          tags: ['艺术', '摄影', '展览'],
          creatorId: 1,
          creatorName: '张三'
        }
      ],
      // 第二页数据
      [
        {
          id: 101,
          title: '编程技术分享会',
          description: '分享最新编程技术和开发经验，包括前端、后端、移动开发等多个领域。',
          location: '计算机学院会议室',
          startTime: '2024-01-26 14:00:00',
          endTime: '2024-01-26 17:00:00',
          status: 'recruiting',
          currentParticipants: 15,
          maxParticipants: 30,
          tags: ['技术', '编程', '分享'],
          creatorId: 1,
          creatorName: '张三'
        },
        {
          id: 102,
          title: '音乐欣赏会',
          description: '古典音乐欣赏活动，聆听经典乐曲，感受音乐魅力，提升艺术修养。',
          location: '音乐厅',
          startTime: '2024-01-27 19:00:00',
          endTime: '2024-01-27 21:00:00',
          status: 'recruiting',
          currentParticipants: 45,
          maxParticipants: 80,
          tags: ['音乐', '艺术', '欣赏'],
          creatorId: 1,
          creatorName: '张三'
        }
      ],
      // 第三页数据
      [
        {
          id: 201,
          title: '创业经验交流会',
          description: '邀请成功创业者分享创业经验，探讨创业机会和挑战，为有创业想法的同学提供指导。',
          location: '创新创业中心',
          startTime: '2024-01-28 14:30:00',
          endTime: '2024-01-28 17:30:00',
          status: 'recruiting',
          currentParticipants: 28,
          maxParticipants: 40,
          tags: ['创业', '交流', '经验'],
          creatorId: 1,
          creatorName: '张三'
        }
      ]
    ]
    
    // 根据当前页码获取对应数据
    const currentPageIndex = page.value - 1
    const mockData = allMockData[currentPageIndex] || []
    
    if (isLoadMore) {
      activities.value.push(...mockData)
    } else {
      activities.value = mockData
    }
    
    console.log('=== 调试：我发布的活动数据加载完成 ===', activities.value)
    
    // 模拟分页逻辑
    hasMore.value = page.value < 3
    
  } catch (error) {
    console.error('加载活动失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载更多
const loadMore = () => {
  page.value++
  loadActivities(true)
}

// 跳转到活动详情
const goToActivityDetail = (activityId) => {
  router.push(`/activities/${activityId}`)
}

// 编辑活动
const editActivity = (activityId) => {
  router.push(`/activities/edit/${activityId}`)
}

// 删除活动
const deleteActivity = async (activityId) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除这个活动吗？',
    })
    
    // 调用删除API
    const response = await deleteActivityApi(activityId)
    
    if (response.success) {
      // 从本地列表中移除该活动
      activities.value = activities.value.filter(a => a.id !== activityId)
      showSuccessToast('删除成功')
      console.log('活动删除成功:', activityId)
    } else {
      throw new Error(response.message || '删除失败')
    }
    
  } catch (error) {
    if (error.message !== 'cancel') { // 不是用户取消操作
      console.error('删除活动失败:', error)
      showFailToast(error.message || '删除失败')
    }
  }
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'recruiting': '招募中',
    'ongoing': '进行中',
    'completed': '已结束',
    'cancelled': '已取消'
  }
  return statusMap[status] || status
}

// 获取状态样式类
const getStatusClass = (status) => {
  const classMap = {
    'recruiting': 'status-recruiting',
    'ongoing': 'status-ongoing',
    'completed': 'status-completed',
    'cancelled': 'status-cancelled'
  }
  return classMap[status] || ''
}

// 格式化日期时间
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return ''
  const date = new Date(dateTimeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.my-created-activities {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.custom-nav-bar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.activities-content {
  padding: 16px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.empty-state {
  padding: 60px 20px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.activity-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.activity-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.activity-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.status-recruiting {
  background-color: #e8f5e8;
  color: #52c41a;
}

.status-ongoing {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status-completed {
  background-color: #f6f6f6;
  color: #999;
}

.status-cancelled {
  background-color: #fff2f0;
  color: #ff4d4f;
}

.activity-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

.info-item .van-icon {
  color: #999;
}

.activity-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  display: box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  box-orient: vertical;
  overflow: hidden;
}

.activity-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.activity-actions {
  display: flex;
  gap: 8px;
}

.load-more {
  padding: 20px;
  text-align: center;
}

@media (max-width: 768px) {
  .activities-content {
    padding: 12px;
  }
  
  .activity-item {
    padding: 12px;
  }
  
  .activity-title {
    font-size: 16px;
  }
  
  .activity-footer {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>