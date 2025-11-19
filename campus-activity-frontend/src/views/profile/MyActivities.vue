<!-- @/views/profile/MyActivities.vue -->
<template>
  <div class="my-activities-view">
    <van-nav-bar 
      title="我的活动" 
      left-text="返回" 
      left-arrow 
      @click-left="handleBack"
      fixed 
      placeholder 
    />
    
    <!-- 活动分类标签栏 -->
    <div class="tab-bar">
        <van-tabs 
          v-model:active="activeTab" 
          @change="handleTabChange"
          sticky
          animated
        >
          <van-tab title="全部"></van-tab>
          <van-tab title="我创建的"></van-tab>
          <van-tab title="我参加的"></van-tab>
          <van-tab title="已结束"></van-tab>
        </van-tabs>
    </div>
    
    <!-- 活动列表区域 -->
    <div class="activities-container">
      <!-- 活动列表 -->
      <div v-if="activities.length > 0" class="activities-list">
        <van-swipe-cell 
          v-for="(activity, index) in activities" 
          :key="activity.id"
          :right-width="65"
          @open="handleOpen(activity, index)"
        >
          <van-cell 
            @click="navigateToActivity(activity.id)"
            :class="['activity-card', { 'activity-card-disabled': activity.status === 'ended' }]"
            clickable
          >
            <template #extra>
              <div class="activity-status"
                   :class="`status-${activity.status}`"
              >
                {{ getStatusText(activity.status) }}
              </div>
            </template>
            <div class="activity-content">
              <h3 class="activity-title">{{ activity.title }}</h3>
              <div class="activity-info">
                <van-icon name="calendar-o" size="14" color="#666" />
                <span class="activity-time">{{ formatTime(activity.startTime) }}</span>
                <van-icon name="location-o" size="14" color="#666" />
                <span class="activity-location">{{ activity.location }}</span>
              </div>
              <div class="activity-footer">
                <div class="activity-stats">
                  <van-icon name="people-o" size="14" color="#999" />
                  <span class="activity-participants">
                    {{ activity.participants }}/{{ activity.maxParticipants || '不限' }}人
                  </span>
                </div>
                <div class="activity-tags">
                  <van-tag 
                    v-for="(tag, tagIndex) in activity.tags.slice(0, 2)" 
                    :key="tagIndex"
                    size="small"
                    color="#f0f0f0"
                    text-color="#666"
                  >
                    {{ tag }}</van-tag>
                </div>
              </div>
              <div v-if="activity.isCreator" class="creator-badge">
                创建者
              </div>
            </div>
            <template #right>
              <div class="swipe-buttons">
                <van-button 
                  v-if="activity.status !== 'ended' && activity.isCreator"
                  type="primary" 
                  text="编辑"
                  size="small"
                  @click="handleEditActivity(activity.id)"
                />
                <van-button 
                  type="danger" 
                  text="删除"
                  size="small"
                  @click="handleDeleteActivity(activity.id)"
                />
              </div>
            </template>
          </van-cell>
        </van-swipe-cell>
      </div>
      <!-- 空状态提示 -->
        <div v-if="!loading" class="empty-state">
        <van-empty description="暂无活动" />
        <van-button 
          type="primary" 
          size="large" 
          v-if="activeTab === 0 || activeTab === 1" 
          @click="navigateToCreateActivity"
        >
          创建活动
        </van-button>
        <van-button 
          type="primary" 
          size="large" 
          v-else 
          @click="navigateToDiscover"
        >
          浏览活动
        </van-button>
      </div>
      <
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <van-loading type="spinner" color="#1989fa" />
        <p class="loading-text">加载中...</p>
      </div>
    </div>
    
    <!-- 下拉刷新和上拉加载更多 -->
    <van-pull-refresh 
      v-model="refreshing" 
      @refresh="onRefresh"
      success-text="刷新成功"
    >
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
        :offset="100"
      >
        <!-- 列表内容已在上面渲染 -->
      </van-list>
    </van-pull-refresh>
    
    <!-- 删除确认对话框 -->
    <van-dialog
      v-model:show="deleteDialog.show"
      title="确认删除"
      show-cancel-button
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    >
      确定要删除活动 "{{ deleteDialog.activityTitle }}" 吗？此操作无法撤销。
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { 
  showToast, 
  showConfirmDialog,
  Dialog as vanDialog,
  PullRefresh as vanPullRefresh,
  List as vanList,
  Loading as vanLoading,
  Empty as vanEmpty,
  Button as vanButton,
  Tag as vanTag,
  Icon as vanIcon,
  Cell as vanCell,
  SwipeCell as vanSwipeCell,
  Tabs as vanTabs,
  Tab as vanTab,
  NavBar as vanNavBar
} from 'vant'
import { useActivityStore } from '@/stores/activityStore'
import { formatTime } from '@/utils/date'

const router = useRouter()
const activityStore = useActivityStore()

// 状态管理
const activeTab = ref(0) // 当前选中的标签页：0=全部, 1=我创建的, 2=我参加的, 3=已结束
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const currentPage = ref(1)
const pageSize = 10
const selectedSwipe = ref(null) // 当前打开的swipe-cell索引

// 删除对话框状态
const deleteDialog = reactive({
  show: false,
  activityId: null,
  activityTitle: ''
})

// 活动列表
const activities = ref([])
const allActivities = ref([]) // 存储所有活动，用于筛选

// 活动状态文本映射
const statusTextMap = {
  'pending': '未开始',
  'ongoing': '进行中',
  'ended': '已结束'
}

// 根据当前标签页筛选活动
const filteredActivities = computed(() => {
  if (activeTab.value === 0) return allActivities.value // 全部
  if (activeTab.value === 1) return allActivities.value.filter(act => act.isCreator) // 我创建的
  if (activeTab.value === 2) return allActivities.value.filter(act => !act.isCreator) // 我参加的
  if (activeTab.value === 3) return allActivities.value.filter(act => act.status === 'ended') // 已结束
  return allActivities.value
})

// 格式化时间
// 直接使用从工具导入的formatTime函数

// 获取状态文本
const getStatusText = (status) => {
  return statusTextMap[status] || status
}

// 处理标签页切换
const handleTabChange = (index) => {
  console.log('🔄 切换标签页:', index)
  activeTab.value = index
  // 重置分页状态
  resetListState()
  // 重置活动列表为筛选后的数据
  activities.value = [...filteredActivities.value]
}

// 重置列表状态
const resetListState = () => {
  currentPage.value = 1
  finished.value = false
  loading.value = false
  refreshing.value = false
}

// 加载活动数据
const loadActivities = async () => {
  try {
    loading.value = true
    console.log('🔄 加载活动数据，页码:', currentPage.value)
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 在真实环境中，这里应该调用API获取数据
    // const response = await activityStore.getMyActivities(currentPage.value, pageSize, activeTab.value)
    
    // 模拟活动数据
    const mockActivities = generateMockActivities()
    
    // 检查是否是第一页
    if (currentPage.value === 1) {
      allActivities.value = mockActivities
    } else {
      allActivities.value = [...allActivities.value, ...mockActivities]
    }
    
    // 更新当前标签页的活动列表
    activities.value = [...filteredActivities.value]
    
    // 检查是否已加载全部数据
    if (mockActivities.length < pageSize) {
      finished.value = true
    }
    
    console.log('✅ 活动数据加载成功，总数:', activities.value.length)
  } catch (error) {
    console.error('加载活动数据失败:', error)
    showToast('加载失败，请重试')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 下拉刷新
const onRefresh = () => {
  console.log('🔄 下拉刷新')
  resetListState()
  loadActivities()
}

// 上拉加载更多
const onLoad = () => {
  console.log('🔄 上拉加载更多')
  if (finished.value) {
    loading.value = false
    return
  }
  
  currentPage.value++
  loadActivities()
}

// 处理活动卡片打开
const handleOpen = (activity, index) => {
  console.log('📋 活动卡片打开:', activity.id)
  // 关闭其他已打开的卡片
  if (selectedSwipe.value !== null && selectedSwipe.value !== index) {
    // 在真实环境中，这里可以通过ref或其他方式关闭之前打开的卡片
  }
  selectedSwipe.value = index
}

// 跳转到活动详情
const navigateToActivity = (activityId) => {
  console.log('🚀 跳转到活动详情:', activityId)
  router.push(`/activities/${activityId}`)
}

// 跳转到创建活动页面
const navigateToCreateActivity = () => {
  console.log('🚀 跳转到创建活动页面')
  router.push('/activities/create')
}

// 跳转到发现页面
const navigateToDiscover = () => {
  console.log('🚀 跳转到发现页面')
  router.push('/')
}

// 编辑活动
const handleEditActivity = (activityId) => {
  console.log('✏️ 编辑活动:', activityId)
  router.push(`/activities/edit/${activityId}`)
}

// 删除活动
const handleDeleteActivity = (activityId) => {
  console.log('🗑️ 准备删除活动:', activityId)
  // 查找活动信息
  const activity = activities.value.find(act => act.id === activityId)
  if (activity) {
    deleteDialog.activityId = activityId
    deleteDialog.activityTitle = activity.title
    deleteDialog.show = true
  }
}

// 确认删除
const confirmDelete = async () => {
  try {
    loading.value = true
    console.log('🗑️ 确认删除活动:', deleteDialog.activityId)
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 在真实环境中，这里应该调用API删除活动
    // await activityStore.deleteActivity(deleteDialog.activityId)
    
    // 从列表中移除
    const index = activities.value.findIndex(act => act.id === deleteDialog.activityId)
    if (index >= 0) {
      activities.value.splice(index, 1)
    }
    
    // 同时从全部活动列表中移除
    const allIndex = allActivities.value.findIndex(act => act.id === deleteDialog.activityId)
    if (allIndex >= 0) {
      allActivities.value.splice(allIndex, 1)
    }
    
    showToast('删除成功')
    console.log('✅ 活动删除成功')
  } catch (error) {
    console.error('删除活动失败:', error)
    showToast('删除失败，请重试')
  } finally {
    loading.value = false
    deleteDialog.show = false
    resetDeleteDialog()
  }
}

// 取消删除
const cancelDelete = () => {
  console.log('❌ 取消删除活动')
  resetDeleteDialog()
}

// 重置删除对话框状态
const resetDeleteDialog = () => {
  deleteDialog.activityId = null
  deleteDialog.activityTitle = ''
}

// 返回上一页
const handleBack = () => {
  console.log('↩️ 返回上一页')
  router.back()
}

// 生成模拟活动数据
const generateMockActivities = () => {
  const statuses = ['pending', 'ongoing', 'ended']
  const now = new Date()
  
  return [
    {
      id: `act-${Date.now()}-1`,
      title: '校园马拉松比赛',
      startTime: new Date(now.getTime() + 86400000 * 2).toISOString(), // 2天后
      location: '操场',
      participants: 120,
      maxParticipants: 200,
      status: 'pending',
      tags: ['体育', '比赛'],
      isCreator: true
    },
    {
      id: `act-${Date.now()}-2`,
      title: '编程竞赛工作坊',
      startTime: new Date(now.getTime() - 86400000).toISOString(), // 1天前
      location: '计算机实验室',
      participants: 45,
      maxParticipants: 60,
      status: 'ongoing',
      tags: ['技术', '学习'],
      isCreator: false
    },
    {
      id: `act-${Date.now()}-3`,
      title: '春季音乐节',
      startTime: new Date(now.getTime() - 86400000 * 5).toISOString(), // 5天前
      location: '音乐厅',
      participants: 300,
      maxParticipants: 300,
      status: 'ended',
      tags: ['音乐', '艺术'],
      isCreator: false
    },
    {
      id: `act-${Date.now()}-4`,
      title: '创业分享会',
      startTime: new Date(now.getTime() + 86400000 * 7).toISOString(), // 7天后
      location: '学术报告大厅',
      participants: 56,
      maxParticipants: 100,
      status: 'pending',
      tags: ['创业', '分享'],
      isCreator: true
    },
    {
      id: `act-${Date.now()}-5`,
      title: '环保志愿者活动',
      startTime: new Date(now.getTime() + 86400000).toISOString(), // 1天后
      location: '校园花园',
      participants: 28,
      maxParticipants: 50,
      status: 'pending',
      tags: ['环保', '公益'],
      isCreator: false
    }
  ]
}

// 初始化页面
onMounted(() => {
  console.log('🔄 初始化我的活动页面')
  loadActivities()
})
</script>

<style scoped>
.my-activities-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding-top: 46px; /* 为固定导航栏留出空间 */
}

/* 标签栏样式 */
.tab-bar {
  background: white;
  margin-bottom: 12px;
}

/* 活动列表容器 */
.activities-container {
  padding-bottom: 20px;
}

/* 活动卡片样式 */
.activity-card {
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.activity-card:active {
  transform: scale(0.98);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.activity-card-disabled {
  opacity: 0.7;
}

.activity-content {
  padding: 16px;
  position: relative;
}

.activity-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0 0 12px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 14px;
}

.activity-time,
.activity-location {
  color: #666;
  margin-left: 4px;
}

.activity-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-stats {
  display: flex;
  align-items: center;
}

.activity-participants {
  font-size: 12px;
  color: #999;
  margin-left: 4px;
}

.activity-tags {
  display: flex;
  gap: 6px;
}

/* 活动状态样式 */
.activity-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-pending {
  background: #e6f7ff;
  color: #1890ff;
}

.status-ongoing {
  background: #f6ffed;
  color: #52c41a;
}

.status-ended {
  background: #f5f5f5;
  color: #999;
}

/* 创建者标签 */
.creator-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 2px 8px;
  background: #f0f0f0;
  border-radius: 10px;
  font-size: 12px;
  color: #666;
}

/* 滑动按钮样式 */
.swipe-buttons {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.swipe-buttons .van-button {
  flex: 1;
  border-radius: 0;
  margin: 0;
}

/* 加载状态样式 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.loading-text {
  margin-top: 12px;
  color: #999;
  font-size: 14px;
}

/* 空状态样式 */
.empty-state {
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-state .van-button {
  margin-top: 20px;
  min-width: 180px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .activity-info {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .activity-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>