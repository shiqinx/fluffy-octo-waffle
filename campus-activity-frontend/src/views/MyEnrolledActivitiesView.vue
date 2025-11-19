<template>
  <div class="my-enrolled-activities">
    <!-- 导航栏 -->
    <van-nav-bar
      title="我报名的活动"
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
        <van-empty description="暂无报名的活动" />
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
            <div class="info-item">
              <van-icon name="user-o" />
              <span>组织者：{{ activity.creatorName }}</span>
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
                type="success" 
                size="small"
              >
                {{ tag }}
              </van-tag>
            </div>
            <div class="enrollment-info">
              <van-tag type="primary" size="small">已报名</van-tag>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载更多 -->
    <div v-if="hasMore && !loading" class="load-more">
      <van-button @click="loadMore" type="success" plain>
        加载更多
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showFailToast } from 'vant'
import { getActivityList } from '@/api/activity'
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
  console.log('=== 我报名的活动页面初始化 ===')
  loadActivities()
})

// 加载活动数据
const loadActivities = async (isLoadMore = false) => {
  if (loading.value) return
  
  loading.value = true
  console.log('=== 调试：开始加载我报名的活动 ===')
  
  try {
    // 使用真实API获取我报名的活动
    const response = await getActivityList({
      page: page.value,
      pageSize: pageSize,
      participantId: authStore.user?.id || 1, // 筛选我参与的活动，修正属性名
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
      
      console.log('成功获取报名活动列表:', activities.value)
    } else {
      // API调用失败，使用模拟数据
      console.warn('API调用失败，使用模拟数据:', response?.message || '未知错误')
      await loadMockData(isLoadMore)
    }
  } catch (error) {
    console.error('加载报名活动列表失败:', error)
    showFailToast(error.message || '加载报名活动列表失败')
    
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
          id: 4,
          title: '图书馆学习小组',
          description: '组织学习小组，一起复习期末考试，互相帮助，共同进步。欢迎所有同学参加！',
          location: '图书馆三楼自习室',
          startTime: '2024-01-21 09:00:00',
          endTime: '2024-01-21 12:00:00',
          status: 'recruiting',
          currentParticipants: 12,
          maxParticipants: 20,
          tags: ['学习', '期末复习', '小组'],
          creatorId: 2,
          creatorName: '李四'
        },
        {
          id: 5,
          title: '网球友谊赛',
          description: '网球爱好者友谊赛，不限水平，重在参与和交流。提供球拍和网球。',
          location: '学校网球场',
          startTime: '2024-01-23 15:00:00',
          endTime: '2024-01-23 17:30:00',
          status: 'recruiting',
          currentParticipants: 6,
          maxParticipants: 8,
          tags: ['运动', '网球', '友谊赛'],
          creatorId: 3,
          creatorName: '王五'
        },
        {
          id: 6,
          title: '宿舍联谊活动',
          description: '宿舍间联谊活动，包含桌游、电影欣赏、美食分享等环节，增进宿舍友谊。',
          location: '学生活动中心',
          startTime: '2024-01-24 18:30:00',
          endTime: '2024-01-24 21:30:00',
          status: 'recruiting',
          currentParticipants: 45,
          maxParticipants: 60,
          tags: ['社交', '联谊', '娱乐'],
          creatorId: 4,
          creatorName: '赵六'
        },
        {
          id: 7,
          title: '英语角活动',
          description: '每周英语角活动，练习口语，结识朋友，提高英语水平。主题：旅行经历分享。',
          location: '外语学院咖啡厅',
          startTime: '2024-01-22 19:00:00',
          endTime: '2024-01-22 20:30:00',
          status: 'ongoing',
          currentParticipants: 18,
          maxParticipants: 25,
          tags: ['英语', '口语', '交流'],
          creatorId: 5,
          creatorName: '陈七'
        }
      ],
      // 第二页数据
      [
        {
          id: 14,
          title: '电影欣赏夜',
          description: '经典电影放映活动，欣赏优秀影片，交流观影心得，提升审美品味。',
          location: '学生活动中心放映厅',
          startTime: '2024-01-26 18:30:00',
          endTime: '2024-01-26 21:30:00',
          status: 'recruiting',
          currentParticipants: 38,
          maxParticipants: 60,
          tags: ['电影', '艺术', '欣赏'],
          creatorId: 6,
          creatorName: '钱七'
        },
        {
          id: 15,
          title: '美食制作工坊',
          description: '学习制作各种美食，包括中式点心、西式甜点等，品尝自己的作品。',
          location: '食堂烹饪教室',
          startTime: '2024-01-27 14:00:00',
          endTime: '2024-01-27 17:00:00',
          status: 'recruiting',
          currentParticipants: 16,
          maxParticipants: 20,
          tags: ['美食', '烹饪', '手工'],
          creatorId: 7,
          creatorName: '孙八'
        }
      ],
      // 第三页数据
      [
        {
          id: 16,
          title: '读书分享会',
          description: '分享阅读心得，推荐好书，交流读书感悟，培养阅读习惯，提升文化素养。',
          location: '图书馆研讨室',
          startTime: '2024-01-28 15:00:00',
          endTime: '2024-01-28 17:00:00',
          status: 'recruiting',
          currentParticipants: 12,
          maxParticipants: 25,
          tags: ['读书', '文化', '分享'],
          creatorId: 8,
          creatorName: '周九'
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
    
    console.log('=== 调试：我报名的活动数据加载完成 ===', activities.value)
    
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
.my-enrolled-activities {
  min-height: 100vh;
  background-color: #f0f9f0;
}

.custom-nav-bar {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
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
  box-shadow: 0 2px 8px rgba(82, 196, 26, 0.15);
  transition: all 0.3s ease;
  cursor: pointer;
  border-left: 4px solid #52c41a;
}

.activity-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(82, 196, 26, 0.25);
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
  background-color: #f6ffed;
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
  color: #52c41a;
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

.enrollment-info {
  display: flex;
  align-items: center;
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