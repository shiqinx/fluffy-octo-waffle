<template>
  <div class="activities-view">
    <!-- 顶部导航 -->
    <div class="header">
      <h1 class="title">活动与团队</h1>
      <button class="create-btn" @click="showCreateMenu = !showCreateMenu">+</button>
    </div>

    <!-- 搜索框 -->
    <div class="search-section">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchKeyword"
          placeholder="搜索活动或团队..."
          @input="handleSearch"
        />
        <span class="search-icon">🔍</span>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <button 
        class="filter-btn left-filter"
        :class="{ active: showTimeLocationFilter }"
        @click="toggleTimeLocationFilter"
      >
        <span>{{ getTimeLocationText }}</span>
        <span class="arrow">▼</span>
      </button>
      
      <button 
        class="filter-btn right-filter"
        :class="{ active: showTypeFilter }"
        @click="toggleTypeFilter"
      >
        <span>{{ currentType === 'activity' ? '活动' : '团队' }}</span>
        <span class="arrow">▼</span>
      </button>
    </div>

    <!-- 内容区 -->
    <div class="content-area">
      <!-- 活动列表 -->
      <div v-if="currentType === 'activity'" class="list-container">
        <ActivityList 
          :activities="filteredActivities"
          @item-click="goToActivityDetail"
        />
        
        <div v-if="filteredActivities.length === 0" class="empty-state">
          <div class="empty-icon">🎯</div>
          <p>暂无活动</p>
          <button @click="goToCreateActivity" class="create-first-btn">创建第一个活动</button>
        </div>
      </div>

      <!-- 团队列表 -->
      <div v-else class="list-container">
        <TeamList 
          :teams="filteredTeams"
          @item-click="goToTeamDetail"
        />
        
        <div v-if="filteredTeams.length === 0" class="empty-state">
          <div class="empty-icon">👥</div>
          <p>暂无团队</p>
          <button @click="goToCreateTeam" class="create-first-btn">创建第一个团队</button>
        </div>
      </div>
    </div>

    <!-- 创建菜单 -->
    <div v-if="showCreateMenu" class="create-menu">
      <div class="menu-item" @click="goToCreateActivity">
        <span class="icon">📝</span>
        <span>创建活动</span>
      </div>
      <div class="menu-item" @click="goToCreateTeam">
        <span class="icon">👥</span>
        <span>创建团队</span>
      </div>
      <div class="menu-item" @click="goToQuickMatch">
        <span class="icon">⚡</span>
        <span>快速组队</span>
      </div>
    </div>

    <!-- 遮罩层 -->
    <div 
      v-if="showCreateMenu" 
      class="overlay"
      @click="showCreateMenu = false"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useActivityStore } from '@/stores/activityStore'
import { useTeamStore } from '@/stores/teamStore'
import { getActivityList } from '@/api/activity'

const router = useRouter()
const activityStore = useActivityStore()
const teamStore = useTeamStore()

// 响应式数据
const searchKeyword = ref('')
const showCreateMenu = ref(false)
const showTimeLocationFilter = ref(false)
const showTypeFilter = ref(false)
const currentType = ref('activity') // 'activity' 或 'team'

// 筛选条件
const timeLocationFilters = ref({
  timeRange: 'all',
  sortBy: 'distance'
})

// 计算属性
const filteredActivities = computed(() => {
  let activities = activityStore.activities
  
  if (searchKeyword.value) {
    activities = activities.filter(activity => 
      activity.title.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }
  
  return activities
})

const filteredTeams = computed(() => {
  let teams = teamStore.teams
  
  if (searchKeyword.value) {
    teams = teams.filter(team => 
      team.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }
  
  return teams
})

const getTimeLocationText = computed(() => {
  const { timeRange, sortBy } = timeLocationFilters.value
  if (timeRange === 'today') return '今天'
  if (timeRange === 'week') return '本周'
  if (sortBy === 'distance') return '最近'
  return '时间/位置'
})

// 方法
const toggleTimeLocationFilter = () => {
  showTimeLocationFilter.value = !showTimeLocationFilter.value
  showTypeFilter.value = false
}

const toggleTypeFilter = () => {
  showTypeFilter.value = !showTypeFilter.value
  showTimeLocationFilter.value = false
}

const handleSearch = async () => {
  try {
    // 调用API搜索活动
    const response = await getActivityList({
      page: 1,
      pageSize: 20,
      keyword: searchKeyword.value
    })
    
    if (response.success && response.data?.items) {
      activityStore.activities = response.data.items
    } else {
      console.warn('搜索失败，使用现有数据')
    }
  } catch (error) {
    console.error('搜索失败:', error)
    // 搜索失败时使用现有的filteredActivities计算属性
  }
}

const goToActivityDetail = (activity) => {
  router.push(`/activities/${activity.id}`)
}

const goToTeamDetail = (team) => {
  router.push(`/team/${team.id}`)
}

const goToCreateActivity = () => {
  router.push('/create-activity')
  showCreateMenu.value = false
}

const goToCreateTeam = () => {
  router.push('/create-team')
  showCreateMenu.value = false
}

const goToQuickMatch = () => {
  router.push('/quick-match')
  showCreateMenu.value = false
}

// 初始化
onMounted(async () => {
  try {
    // 加载活动数据
    const activityResponse = await getActivityList({
      page: 1,
      pageSize: 20,
      keyword: searchKeyword.value
    })
    
    if (activityResponse.success && activityResponse.data?.items) {
      activityStore.activities = activityResponse.data.items
    }
  } catch (error) {
    console.error('加载活动失败:', error)
    // 保留store的loadActivities作为回退
    activityStore.loadActivities()
  }
  
  // 加载团队数据
  teamStore.loadTeams()
})
</script>

<style scoped>
.activities-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
}

.title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.create-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #1890ff;
  color: white;
  border: none;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.create-btn:hover {
  background: #40a9ff;
  transform: scale(1.05);
}

.search-section {
  padding: 12px 16px;
  background: white;
}

.search-box {
  position: relative;
}

.search-box input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  background: #f8f9fa;
}

.search-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.filter-bar {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
}

.filter-btn {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 16px;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-btn.active {
  border-color: #1890ff;
  color: #1890ff;
}

.filter-btn:hover {
  border-color: #1890ff;
}

.arrow {
  font-size: 12px;
  color: #999;
}

.content-area {
  flex: 1;
  overflow: auto;
}

.list-container {
  height: 100%;
}

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  padding: 40px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.create-first-btn {
  margin-top: 16px;
  padding: 10px 20px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.create-first-btn:hover {
  background: #40a9ff;
}

.create-menu {
  position: fixed;
  bottom: 80px;
  right: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  padding: 8px 0;
  z-index: 1001;
  animation: slideUp 0.3s ease;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: background 0.3s;
}

.menu-item:hover {
  background: #f5f5f5;
}

.menu-item .icon {
  margin-right: 12px;
  font-size: 16px;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 1000;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>