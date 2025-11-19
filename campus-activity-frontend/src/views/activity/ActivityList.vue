<template>
  <div class="activities-teams-page">
    <!-- 搜索框 -->
    <div class="search-box">
      <van-search
        v-model="searchKeyword"
        placeholder="搜索活动或团队..."
        shape="round"
        @search="onSearch"
        show-action
        @clear="handleClear"
        @input="handleSearchInput"
      />
    </div>

    <!-- 筛选栏 -->
    <div class="filter-section">
      <!-- 左侧：时间/位置筛选 -->
      <div class="filter-group">
        <div class="filter-label">筛选:</div>
        <div class="filter-buttons">
          <van-button 
            v-for="filter in timeLocationFilters" 
            :key="filter.value"
            :type="getFilterType(filter.value, 'timeLocation')"
            size="small"
            @click="onTimeLocationFilterClick(filter.value)"
          >
            {{ filter.text }}
          </van-button>
        </div>
      </div>

      <!-- 右侧：活动/团队筛选 -->
      <div class="filter-group">
        <div class="filter-label">类型:</div>
        <div class="filter-buttons">
          <van-button 
            v-for="type in contentTypes" 
            :key="type.value"
            :type="getFilterType(type.value, 'content')"
            size="small"
            @click="onContentTypeClick(type.value)"
          >
            {{ type.text }}
          </van-button>
        </div>
      </div>
    </div>

    <!-- 错误消息 -->
    <div v-if="errorMessage" class="error-message">
      <van-icon name="circle-warning" color="#ee0a24" />
      <span>{{ errorMessage }}</span>
      <van-button size="small" @click="loadData">重试</van-button>
    </div>
    
    <!-- 内容区域 -->
    <div class="content-section">
      <!-- 活动列表 -->
      <div v-if="currentContentType === 'activity'" class="activity-list">
        <!-- 加载状态 -->
        <div v-if="loading && filteredActivities.length === 0" class="loading-container">
          <van-loading type="spinner" color="#1989fa" />
          <p>加载中...</p>
        </div>
        
        <!-- 活动卡片 -->
        <div 
          v-for="activity in filteredActivities" 
          :key="activity.id"
          class="activity-card"
          @click="navigateToDetail('activity', activity.id)"
        >
          <div class="card-header">
            <h3 class="title">{{ activity?.title || '未命名活动' }}</h3>
            <div class="status-tags">
              <van-tag :type="getActivityType(activity?.type)" size="medium">
                {{ getActivityTypeText(activity?.type) }}
              </van-tag>
              <!-- 活动审核状态 -->
              <van-tag 
                v-if="activity?.auditStatus && activity.auditStatus !== 'approved'" 
                :type="getAuditStatusType(activity.auditStatus)"
                size="small"
              >
                {{ getAuditStatusText(activity.auditStatus) }}
              </van-tag>
            </div>
          </div>
          
          <div class="card-content">
            <div class="info-item">
              <van-icon name="location-o" />
              <span>{{ activity?.locationName || activity?.location?.name || '未设置地点' }}</span>
            </div>
            <div class="info-item">
              <van-icon name="clock-o" />
              <span>{{ formatTime(activity?.startTime) }}</span>
            </div>
            <div class="info-item">
              <van-icon name="friends-o" />
              <span>{{ activity?.currentParticipants || 0 }}/{{ activity?.maxParticipants || 0 }}人</span>
            </div>
            <!-- 信誉分要求显示 -->
            <div class="info-item" v-if="activity?.minCreditScore">
              <van-icon name="star-o" />
              <span>信誉分要求: {{ activity.minCreditScore }}分</span>
            </div>
          </div>
          
          <div class="card-footer">
            <div class="distance">
              <van-icon name="location" />
              <span>{{ activity?.distance || 0 }}km</span>
            </div>
            <div class="organizer">
              <span>{{ activity?.organizer?.name || '未知组织者' }}</span>
            </div>
          </div>

          <!-- 报名按钮和状态 -->
          <div class="action-buttons">
            <van-button 
              v-if="!activity?.isEnrolled"
              type="primary" 
              size="small"
              @click.stop="onEnrollActivity(activity)"
              :disabled="!userStore.canEnrollActivity"
            >
              {{ userStore.canEnrollActivity ? '报名参加' : '信誉分不足' }}
            </van-button>
            
            <div v-else class="enrolled-actions">
              <!-- 报名审核状态 -->
              <van-button 
                v-if="activity.enrollmentStatus === 'approved'"
                type="success" 
                size="small"
                disabled
              >
                已通过
              </van-button>
              <van-button 
                v-else-if="activity.enrollmentStatus === 'pending'"
                type="warning" 
                size="small"
                disabled
              >
                审核中
              </van-button>
              <van-button 
                v-else-if="activity.enrollmentStatus === 'rejected'"
                type="danger" 
                size="small"
                @click.stop="onReapplyActivity(activity)"
              >
                重新申请
              </van-button>

              <!-- 已通过的活动操作 -->
              <div v-if="activity.enrollmentStatus === 'approved'" class="approved-actions">
                <!-- 签到按钮 -->
                <van-button 
                  v-if="canCheckIn(activity)"
                  type="primary" 
                  size="small"
                  @click.stop="onCheckIn(activity)"
                >
                  签到
                </van-button>
                <!-- 请假按钮 -->
                <van-button 
                  v-if="canLeave(activity)"
                  type="warning" 
                  size="small"
                  @click.stop="onApplyLeave(activity)"
                >
                  请假
                </van-button>
                <!-- 已签到状态 -->
                <van-button 
                  v-else-if="activity.checkedIn"
                  type="success" 
                  size="small"
                  disabled
                >
                  已签到
                </van-button>
                <!-- 请假状态 -->
                <van-button 
                  v-else-if="activity.leaveStatus === 'pending'"
                  type="warning" 
                  size="small"
                  disabled
                >
                  请假审核中
                </van-button>
                <van-button 
                  v-else-if="activity.leaveStatus === 'approved'"
                  type="info" 
                  size="small"
                  disabled
                >
                  已批准请假
                </van-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 团队列表 -->
      <div v-else class="team-list">
        <!-- 加载状态 -->
        <div v-if="loading && filteredTeams.length === 0" class="loading-container">
          <van-loading type="spinner" color="#1989fa" />
          <p>加载中...</p>
        </div>
        
        <div 
          v-for="team in filteredTeams" 
          :key="team.id"
          class="team-card"
          @click="navigateToDetail('team', team.id)"
        >
          <div class="card-header">
            <h3 class="title">{{ team?.name || '未命名团队' }}</h3>
            <van-tag type="primary" size="medium">{{ team?.type || '团队' }}</van-tag>
          </div>
          
          <div class="card-content">
            <p class="description">{{ team?.description || '暂无描述' }}</p>
            <div class="info-item">
              <van-icon name="friends-o" />
              <span>{{ team?.currentMembers || 0 }}/{{ team?.maxMembers || 0 }}人</span>
            </div>
            <div class="info-item">
              <van-icon name="user-circle-o" />
              <span>队长: {{ team?.leader?.name || '未知' }}</span>
            </div>
          </div>

          <!-- 加入按钮 -->
          <div class="action-buttons">
            <van-button 
              v-if="!team?.isMember"
              type="primary" 
              size="small"
              @click.stop="onJoinTeam(team)"
            >
              申请加入
            </van-button>
            <van-button 
              v-else
              type="success" 
              size="small"
              disabled
            >
              已加入
            </van-button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="showEmptyState" class="empty-state">
        <van-empty :description="emptyDescription">
          <van-button 
            round 
            type="primary" 
            @click="directCreate"
          >
            立即创建
          </van-button>
        </van-empty>
      </div>
    </div>

    <!-- 创建按钮 -->
    <div class="create-fab" @click="showSimpleMenu = true">
      <van-icon name="plus" size="24" color="#fff" />
    </div>

    <!-- 简单的创建菜单 -->
    <div v-if="showSimpleMenu" class="simple-menu-overlay" @click="showSimpleMenu = false">
      <div class="simple-menu" @click.stop>
        <div class="menu-item" @click="createActivity">创建活动</div>
        <div class="menu-item" @click="createTeam">创建团队</div>
        <div class="menu-cancel" @click="showSimpleMenu = false">取消</div>
      </div>
    </div>

    <!-- 请假申请弹窗 -->
    <van-dialog 
      v-model:show="showLeaveDialog" 
      title="请假申请" 
      show-cancel-button
      @confirm="submitLeaveApplication"
    >
      <div class="leave-dialog-content">
        <van-field
          v-model="leaveReason"
          type="textarea"
          placeholder="请输入请假原因..."
          rows="3"
          autosize
        />
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog, showDialog, showFailToast } from 'vant'
import { useUserStore } from '@/stores/userStore'
import { useActivityStore } from '@/stores/activityStore'
import { useTeamStore } from '@/stores/team'
import { 
  getActivityList,
  joinActivity,
  checkInActivity,
  deleteActivity
} from '@/api/activity'
import { calculateDistance } from '@/utils/location.js'
import { getUserLocation } from '@/utils/map.js'

const router = useRouter()
const userStore = useUserStore()
const activityStore = useActivityStore()
const teamStore = useTeamStore()

// 响应式数据
const searchKeyword = ref('')
const currentTimeLocationFilter = ref('all')
const currentContentType = ref('activity')
const showSimpleMenu = ref(false)
const showLeaveDialog = ref(false)
const leaveReason = ref('')
const currentLeaveActivity = ref(null)
// 加载状态
const loading = ref(false)
const refreshing = ref(false)
const errorMessage = ref('')

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const pagination = ref({
  total: 0,
  page: 1
})

// 筛选选项
const timeLocationFilters = [
  { text: '全部', value: 'all' },
  { text: '今天', value: 'today' },
  { text: '本周', value: 'week' },
  { text: '附近', value: 'nearby' },
  { text: '热门', value: 'popular' }
]

const contentTypes = [
  { text: '活动', value: 'activity' },
  { text: '团队', value: 'team' }
]

// 从store获取数据
const activities = computed(() => {
  console.log('🔄 activities 计算属性被调用，当前活动数量:', activityStore.activities?.length || 0)
  console.log('🔄 activityStore.activities 详细内容:', activityStore.activities)
  
  return activityStore.activities || []
})
const teams = computed(() => teamStore.teams || [])

// 数据加载函数
const loadData = async () => {
  loading.value = true
  errorMessage.value = ''
  
  try {
    console.log('🔄 ActivityList.loadData 开始加载活动数据')
    
    // 检查localStorage中是否有活动数据，如果没有则初始化默认数据
    const existingActivities = localStorage.getItem('campus_activities')
    if (!existingActivities) {
      console.log('📝 localStorage中没有活动数据，初始化默认数据')
      
      // 设置正确的默认数据到localStorage
      const correctDefaultActivities = [
        {
          id: 1,
          title: '中医养生讲座',
          type: 'study',
          category: 'study',
          locationName: '学术报告厅',
          description: '邀请中医专家讲解中医养生知识，分享传统保健方法。',
          startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          currentParticipants: 15,
          maxParticipants: 30,
          organizer: { id: 2, name: '中医学院', creditScore: 98 },
          distance: 0.8,
          isEnrolled: false,
          status: 'open'
        },
        {
          id: 2,
          title: '摄影作品展览',
          type: 'culture',
          category: 'culture',
          locationName: '艺术展厅',
          description: '展示学生摄影作品，分享摄影技巧，交流创作心得。',
          startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
          currentParticipants: 12,
          maxParticipants: 25,
          organizer: { id: 3, name: '摄影协会', creditScore: 92 },
          distance: 0.3,
          isEnrolled: false,
          status: 'open'
        },
        {
          id: 3,
          title: '编程马拉松大赛',
          type: 'tech',
          category: 'tech',
          locationName: '创新实验室',
          description: '24小时编程挑战赛，主题为智慧校园，展示编程技能。',
          startTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          currentParticipants: 8,
          maxParticipants: 20,
          organizer: { id: 4, name: '计算机学院', creditScore: 96 },
          distance: 1.2,
          isEnrolled: false,
          status: 'open'
        },
        {
          id: 4,
          title: '音乐节',
          type: 'culture',
          category: 'culture',
          locationName: '露天剧场',
          description: '年度校园音乐节，邀请校内外乐队演出，享受音乐盛宴。',
          startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
          currentParticipants: 25,
          maxParticipants: 40,
          organizer: { id: 5, name: '学生会', creditScore: 94 },
          distance: 0.6,
          isEnrolled: false,
          status: 'open'
        },
        {
          id: 5,
          title: '篮球友谊赛',
          type: 'sports',
          category: 'sports',
          locationName: '篮球场1',
          description: '周末篮球比赛，欢迎所有篮球爱好者参加。',
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
          currentParticipants: 4,
          maxParticipants: 8,
          organizer: { id: 1, name: '篮球社', creditScore: 95 },
          distance: 0.5,
          isEnrolled: false,
          status: 'open'
        },
        {
          id: 6,
          title: '图书馆学习小组',
          type: 'study',
          category: 'study',
          locationName: '图书馆三楼研讨室',
          description: '图书馆学习小组，共同学习，互相进步',
          startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          currentParticipants: 10,
          maxParticipants: 20,
          organizer: { id: 6, name: '刘老师', creditScore: 90 },
          distance: 0.2,
          isEnrolled: false,
          status: 'open'
        }
      ]
      
      localStorage.setItem('campus_activities', JSON.stringify(correctDefaultActivities))
    } else {
      console.log('📋 localStorage中已有活动数据，直接使用')
    }
    
    // 正常加载活动数据，不强制重置
    await activityStore.loadActivities(false) // 不强制重置，保留现有数据
    console.log('✅ 活动数据加载完成，当前活动数量:', activityStore.activities.length)
    console.log('📋 活动数据详情:', activityStore.activities.map(a => ({ 
      id: a.id, 
      title: a.title, 
      type: a.type,
      startTime: a.startTime,
      locationName: a.locationName
    })))
    
    // 如果有用户信息，加载用户数据
    if (userStore.isLoggedIn) {
      console.log('👤 用户已登录，加载用户相关数据')
      await Promise.all([
        userStore.loadUserActivities(),
        userStore.loadUserTeams()
      ])
    } else {
      console.log('👤 用户未登录，跳过用户数据加载')
    }
    
    if (currentContentType.value === 'team') {
      // 团队数据保持原有逻辑
      if (teamStore && typeof teamStore.fetchTeams === 'function') {
        await teamStore.fetchTeams()
      } else {
        // 使用模拟数据
        console.warn('使用模拟团队数据')
        teamStore.teams = [
          {
            id: 1,
            name: '篮球爱好者',
            type: '运动',
            description: '热爱篮球运动的同学们组成的团队',
            currentMembers: 8,
            maxMembers: 20,
            leader: {
              name: '张三',
              avatar: ''
            },
            isMember: false
          },
          {
            id: 2,
            name: '学习互助小组',
            type: '学习',
            description: '互相帮助，共同进步的学习小组',
            currentMembers: 5,
            maxMembers: 10,
            leader: {
              name: '李四',
              avatar: ''
            },
            isMember: true
          }
        ]
      }
    }
    
    console.log('🎉 页面加载完成，活动列表应该显示', activityStore.activities.length, '个活动')
    
  } catch (err) {
    console.error('❌ 加载数据失败:', err)
    errorMessage.value = err.message || '加载数据失败，请稍后重试'
    
    // 移除硬编码的mock数据，直接使用store中的数据
    console.log('📝 使用store中的活动数据，数量:', activityStore.activities.length)
    console.log('📝 活动数据详情:', activityStore.activities.map(a => ({ id: a.id, title: a.title })))
  } finally {
    loading.value = false
  }
}

const filteredActivities = computed(() => {
  let result = [...activities.value]
  console.log('🔄 filteredActivities 开始计算，原始活动数量:', result.length)
  console.log('🔄 原始活动详情:', result.map(a => ({ id: a.id, title: a.title, type: a.type })))
  
  // 搜索关键词筛选
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase().trim()
    result = result.filter(activity => {
      const title = activity?.title || ''
      const description = activity?.description || ''
      const locationName = activity?.locationName || activity?.location?.name || ''
      const organizerName = activity?.organizer?.name || ''
      
      return title.toLowerCase().includes(keyword) ||
             description.toLowerCase().includes(keyword) ||
             locationName.toLowerCase().includes(keyword) ||
             organizerName.toLowerCase().includes(keyword)
    })
    console.log('🔄 搜索筛选后活动数量:', result.length)
    console.log('🔄 搜索筛选后活动详情:', result.map(a => ({ id: a.id, title: a.title, type: a.type })))
  }
  
  // 时间/位置筛选
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  
  console.log('🔄 当前筛选条件:', currentTimeLocationFilter.value)
  
  switch (currentTimeLocationFilter.value) {
    case 'today':
      result = result.filter(activity => {
        if (!activity?.startTime) return false
        const activityDate = new Date(activity.startTime)
        return activityDate >= today && activityDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)
      })
      console.log('🔄 today筛选后活动数量:', result.length)
      break
    case 'week':
      result = result.filter(activity => {
        if (!activity?.startTime) return false
        const activityDate = new Date(activity.startTime)
        return activityDate >= weekStart && activityDate <= weekEnd
      })
      console.log('🔄 week筛选后活动数量:', result.length)
      break
    case 'nearby':
      // 筛选1公里以内的活动
      result = result.filter(activity => (activity?.distance || 0) <= 1)
      console.log('🔄 nearby筛选后活动数量:', result.length)
      break
    case 'popular':
      // 按参与人数排序，显示最受欢迎的活动
      result.sort((a, b) => {
        const ratioA = (a.currentParticipants || 0) / (a.maxParticipants || 1)
        const ratioB = (b.currentParticipants || 0) / (b.maxParticipants || 1)
        return ratioB - ratioA
      })
      console.log('🔄 popular排序后活动数量:', result.length)
      break
  }
  
  console.log('🔄 最终筛选结果:', result.map(a => ({ id: a.id, title: a.title, type: a.type })))
  return result
})

const filteredTeams = computed(() => {
  let result = [...teams.value]
  
  // 搜索关键词筛选
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase().trim()
    result = result.filter(team => {
      const name = team?.name || ''
      const description = team?.description || ''
      const type = team?.type || ''
      const leaderName = team?.leader?.name || ''
      
      return name.toLowerCase().includes(keyword) ||
             description.toLowerCase().includes(keyword) ||
             type.toLowerCase().includes(keyword) ||
             leaderName.toLowerCase().includes(keyword)
    })
  }
  
  // 对于团队，根据筛选条件进行排序
  if (currentTimeLocationFilter.value === 'popular') {
    // 按成员数比例排序
    result.sort((a, b) => {
      const ratioA = (a.currentMembers || 0) / (a.maxMembers || 1)
      const ratioB = (b.currentMembers || 0) / (b.maxMembers || 1)
      return ratioB - ratioA
    })
  }
  
  return result
})

const showEmptyState = computed(() => {
  if (currentContentType.value === 'activity') {
    return filteredActivities.value.length === 0
  } else {
    return filteredTeams.value.length === 0
  }
})

const emptyDescription = computed(() => {
  return `暂无${currentContentType.value === 'activity' ? '活动' : '团队'}`
})

// 方法
const getFilterType = (value, type) => {
  if (type === 'timeLocation') {
    return currentTimeLocationFilter.value === value ? 'primary' : 'default'
  } else {
    return currentContentType.value === value ? 'primary' : 'default'
  }
}

const getActivityType = (type) => {
  const typeMap = {
    sports: 'danger',
    study: 'primary',
    game: 'success',
    lecture: 'warning',
    culture: 'success',
    tech: 'primary'
  }
  return typeMap[type] || 'default'
}

const getActivityTypeText = (type) => {
  const typeMap = {
    sports: '运动',
    study: '学习',
    game: '游戏',
    lecture: '讲座',
    culture: '文化',
    tech: '技术'
  }
  return typeMap[type] || type || '其他'
}

const getAuditStatusType = (status) => {
  const typeMap = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return typeMap[status] || 'default'
}

const getAuditStatusText = (status) => {
  const textMap = {
    pending: '审核中',
    approved: '已通过',
    rejected: '未通过'
  }
  return textMap[status] || status
}

const formatTime = (timeString) => {
  if (!timeString) return '时间未定'
  try {
    return new Date(timeString).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return '时间格式错误'
  }
}

const canCheckIn = (activity) => {
  if (!activity?.isEnrolled || activity.enrollmentStatus !== 'approved') {
    return false
  }
  if (activity.checkedIn || activity.leaveStatus === 'approved') {
    return false
  }
  const now = new Date()
  const startTime = new Date(activity.startTime)
  const endTime = new Date(activity.endTime)
  return now >= startTime && now <= endTime
}

const canLeave = (activity) => {
  if (!activity?.isEnrolled || activity.enrollmentStatus !== 'approved') {
    return false
  }
  if (activity.checkedIn || activity.leaveStatus) {
    return false
  }
  const now = new Date()
  const startTime = new Date(activity.startTime)
  return now < startTime
}

// 搜索功能优化
let searchTimer = null

const handleSearchInput = () => {
  // 防抖处理搜索输入
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  
  searchTimer = setTimeout(() => {
    onSearch()
  }, 300)
}

const onSearch = () => {
  // 直接执行搜索（因为我们已经在computed中实现了搜索逻辑）
  console.log('执行搜索:', searchKeyword.value)
}

const handleClear = () => {
  searchKeyword.value = ''
  console.log('清除搜索')
}

const onTimeLocationFilterClick = (value) => {
  currentTimeLocationFilter.value = value
}

const onContentTypeClick = (value) => {
  currentContentType.value = value
  // 切换内容类型时重新加载数据
  loadData()
}

// 导航到详情页
const navigateToDetail = (type, id) => {
  if (type === 'activity') {
    router.push(`/activities/${id}`)
  } else if (type === 'team') {
    router.push(`/teams/${id}`)
  }
}

// 处理信誉分相关操作
const handleCreditScore = async (activity, action) => {
  try {
    let scoreChange = 0
    let message = ''
    
    // 根据用户行为调整信誉分
    switch (action) {
      case 'enroll':
        scoreChange = 1
        message = '报名活动获得1点信誉分'
        break
      case 'complete':
        scoreChange = 5
        message = '完成活动获得5点信誉分'
        break
      case 'quit':
        scoreChange = -3
        message = '中途退出活动扣除3点信誉分'
        break
      case 'noshow':
        scoreChange = -5
        message = '未参加且未请假扣除5点信誉分'
        break
      case 'leave':
        scoreChange = 0
        message = '请假获批，不影响信誉分'
        break
    }
    
    // 实际项目中应该调用API更新信誉分
    console.log(`信誉分变化: ${scoreChange}, 原因: ${message}`)
    
    // 如果有信誉分变化，更新用户信息并显示提示
    if (scoreChange !== 0) {
      userStore.updateCreditScore(scoreChange, message, activity?.id)
      showToast(message)
    }
  } catch (error) {
    console.error('更新信誉分失败:', error)
    showToast('更新信誉分失败', { type: 'error' })
  }
}

const onEnrollActivity = async (activity) => {
  try {
    // 检查信誉分要求
    const minScore = activity.minCreditScore || 60
    if (userStore.currentCreditScore < minScore) {
      await showDialog({
        title: '信誉分不足',
        message: `您的信誉分${userStore.currentCreditScore}分低于要求的${minScore}分，无法报名活动。请先提高信誉分。`
      })
      return
    }

    await showConfirmDialog({
      title: '报名确认',
      message: `确定要报名参加"${activity.title}"吗？报名后需要组织者审核。`
    })
    
    // 使用带验证的API加入活动
    const response = await validatedApi.joinActivity(activity.id, {
      userId: userStore.userInfo?.id,
      message: '我想参加这个活动'
    })
    
    if (response.success) {
      // 更新本地状态
      activity.isEnrolled = true
      activity.enrollmentStatus = 'pending'
      activity.currentParticipants += 1
      
      // 报名获得1点信誉分
      await handleCreditScore(activity, 'enroll')
      showToast('报名成功，等待组织者审核')
    } else {
      throw new Error(response.message || '报名失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('报名失败:', error)
      showFailToast(error.message || '报名失败，请稍后重试')
    }
  }
}

const onReapplyActivity = async (activity) => {
  try {
    await showConfirmDialog({
      title: '重新申请',
      message: '确定要重新申请参加这个活动吗？'
    })
    
    activity.enrollmentStatus = 'pending'
    showToast('已重新提交申请，等待组织者审核')
  } catch {
    // 用户取消
  }
}

const onCheckIn = async (activity) => {
  try {
    const userLocation = await getUserLocation().catch(error => {
      console.warn('获取用户位置失败，无法进行签到验证:', error)
      showFailToast('无法获取您的位置，请检查位置权限设置')
      throw new Error('位置获取失败')
    })
    const activityLocation = activity.checkInLocation
    const distance = calculateDistance(userLocation, activityLocation)
    
    if (distance > activity.checkInRadius) {
      await showDialog({
        title: '签到失败',
        message: `您不在签到范围内。请在活动地点${activity.checkInRadius}米范围内签到。`
      })
      return
    }

    await showConfirmDialog({
      title: '签到确认',
      message: `确定要签到"${activity.title}"吗？`
    })
    
    // 调用真实API
    const response = await checkInActivity(activity.id)
    
    if (response.success) {
      activity.checkedIn = true
      userStore.updateCreditScore(5, `参加活动"${activity.title}"签到成功`, activity.id)
      showToast('签到成功！信誉分+5')
    } else {
      throw new Error(response.message || '签到失败')
    }
  } catch (error) {
    console.error('签到失败:', error)
    showFailToast(error.message || '签到失败，请重试')
  }
}

const onApplyLeave = (activity) => {
  currentLeaveActivity.value = activity
  leaveReason.value = ''
  showLeaveDialog.value = true
}

const submitLeaveApplication = async () => {
  if (!leaveReason.value.trim()) {
    showToast('请输入请假原因')
    return
  }

  try {
    currentLeaveActivity.value.leaveStatus = 'pending'
    showLeaveDialog.value = false
    
    showToast('请假申请已提交，等待组织者审核')
    
    // 处理信誉分（请假不扣分）
    await handleCreditScore(currentLeaveActivity.value, 'leave')
    
    setTimeout(() => {
      if (Math.random() > 0.3) {
        currentLeaveActivity.value.leaveStatus = 'approved'
        currentLeaveActivity.value.isEnrolled = false
        currentLeaveActivity.value.currentParticipants -= 1
        showToast('您的请假申请已通过')
      } else {
        currentLeaveActivity.value.leaveStatus = 'rejected'
        showToast('您的请假申请未通过，请按时参加活动')
      }
    }, 5000)
    
  } catch (error) {
    console.error('请假申请失败:', error)
    showToast('请假申请失败，请重试')
  }
}

const checkAutoDeduction = async () => {
  try {
    // 从store获取用户信誉分
    const currentCreditScore = userStore.userInfo?.creditScore || 0
    console.log('检查信誉分自动扣除，当前信誉分:', currentCreditScore)
    
    const now = new Date()
    activities.value.forEach(activity => {
      const endTime = new Date(activity.endTime)
      if (now > endTime && activity.isEnrolled && 
          activity.enrollmentStatus === 'approved' && 
          !activity.checkedIn && 
          activity.leaveStatus !== 'approved') {
        
        // 调用API扣除信誉分
        userStore.updateCreditScore(-5, `未参加活动"${activity.title}"且未签到`, activity.id)
        showToast(`您因未参加活动《${activity.title}》，信誉分被扣除5分`, { type: 'warning' })
        
        activity.isEnrolled = false
        activity.currentParticipants -= 1
      }
    })
  } catch (error) {
    console.error('信誉分检查失败:', error)
  }
}

// getUserLocation函数已从@/utils/map.js导入，此处删除重复定义

// calculateDistance函数已从@/utils/location.js导入，此处删除重复定义

const onJoinTeam = async (team) => {
  try {
    await showConfirmDialog({
      title: '加入确认',
      message: `确定要申请加入"${team.name}"吗？`
    })
    
    team.isMember = true
    team.currentMembers += 1
    showToast('申请成功，等待队长审核')
  } catch {
    // 用户取消
  }
}

const createActivity = () => {
  showSimpleMenu.value = false
  router.push('/activities/create').catch(err => {
    console.error('路由跳转失败:', err)
    window.location.href = '/activities/create'
  })
}

const createTeam = () => {
  showSimpleMenu.value = false
  router.push('/teams/create').catch(err => {
    console.error('路由跳转失败:', err)
    window.location.href = '/teams/create'
  })
}

const directCreate = () => {
  if (currentContentType.value === 'activity') {
    createActivity()
  } else {
    createTeam()
  }
}

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  try {
    await loadData()
  } finally {
    refreshing.value = false
  }
}

onMounted(async () => {
  if (!userStore.userInfo) {
    userStore.setUserInfo({
      id: 1,
      name: '当前用户',
      creditScore: 80
    })
  }
  
  // 获取用户位置（静默处理错误）
  getUserLocation().catch(error => {
    console.log('获取用户位置失败，但不影响页面功能')
  })
  
  // 调用loadData函数加载数据
  await loadData()
  
  // 设置定时检查信誉分扣除
  setInterval(checkAutoDeduction, 60000) // 每分钟检查一次
})

// 页面激活时重新加载数据（从其他页面返回时）
onActivated(async () => {
  console.log('🔄 ActivityList页面被激活，重新加载数据')
  await loadData()
})
</script>

<style scoped>
.activities-teams-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 80px; /* 增加底部间距，避免与FAB按钮重叠 */
}

.search-box {
  background: white;
  padding: 10px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.filter-section {
  background: white;
  padding: 12px;
  border-bottom: 1px solid #eee;
  display: flex;
  gap: 16px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

.filter-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.error-message {
  background: #fff2f2;
  color: #ee0a24;
  padding: 12px;
  margin: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.content-section {
  padding: 12px;
}

.loading-container {
  text-align: center;
  padding: 40px 0;
  color: #666;
}

/* 活动/团队卡片样式 */
.activity-card,
.team-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.activity-card:active,
.team-card:active {
  transform: scale(0.98);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.title {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
  flex: 1;
  margin-right: 8px;
  color: #333;
}

.status-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.card-content {
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 14px;
  color: #666;
}

.description {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.4;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #999;
  margin-bottom: 12px;
}

.distance,
.organizer {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
}

.enrolled-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.approved-actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  margin-top: 60px;
}

/* 创建按钮样式 - 这是关键！ */
.create-fab {
  position: fixed;
  bottom: 90px; /* 增加与底部导航栏的间距 */
  right: 20px;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #1989fa, #007aff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(25, 137, 250, 0.4);
  z-index: 1000;
  cursor: pointer;
  transition: all 0.3s ease;
}

.create-fab:active {
  transform: scale(0.95);
  box-shadow: 0 2px 8px rgba(25, 137, 250, 0.6);
}

/* 简单菜单样式 */
.simple-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: flex-end;
}

.simple-menu {
  background: white;
  width: 100%;
  border-radius: 16px 16px 0 0;
  overflow: hidden;
}

.menu-item {
  padding: 18px 20px;
  text-align: center;
  font-size: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-item:active {
  background: #f5f5f5;
}

.menu-cancel {
  padding: 15px 20px;
  text-align: center;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  margin-top: 8px;
  background: #f8f8f8;
}

.leave-dialog-content {
  padding: 16px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .filter-section {
    flex-direction: column;
    gap: 12px;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .filter-buttons {
    flex: 1;
    justify-content: flex-start;
  }
  
  .create-fab {
    bottom: 80px; /* 移动端也相应调整 */
    right: 16px;
    width: 52px;
    height: 52px;
  }
}

/* 信誉分不足样式 */
:deep(.van-button--primary[disabled]) {
  background-color: #ccc !important;
  border-color: #ccc !important;
  color: #999 !important;
}
</style>