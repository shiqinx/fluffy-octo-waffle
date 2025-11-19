<!-- @/views/profile/MyTeams.vue -->
<template>
  <div class="my-teams-view">
    <van-nav-bar 
      title="我的团队" 
      left-text="返回" 
      right-text="创建" 
      left-arrow 
      @click-left="handleBack" 
      @click-right="handleCreateTeam"
      fixed 
      placeholder 
    />
    
    <!-- 团队分类标签栏 -->
    <div class="tab-bar">
        <van-tabs 
          v-model:active="activeTab" 
          @change="handleTabChange"
          sticky
          animated
        >
          <van-tab title="全部"></van-tab>
          <van-tab title="我创建的"></van-tab>
          <van-tab title="我加入的"></van-tab>
        </van-tabs>
    </div>
    
    <!-- 团队列表区域 -->
    <div class="teams-container">
      <!-- 团队列表 -->
      <div v-if="teams.length > 0" class="teams-list">
        <van-swipe-cell 
          v-for="(team, index) in teams" 
          :key="team.id"
          :right-width="65"
          @open="handleOpen(team, index)"
        >
          <van-cell 
            @click="navigateToTeamDetail(team.id)"
            class="team-card"
            clickable
          >
            <template #left>
              <div class="team-logo"
                   :style="{ backgroundColor: getTeamColor(team.id) }"
              >
                <span class="team-logo-text">{{ getTeamLogoText(team.name) }}</span>
              </div>
            </template>
            <div class="team-content">
              <h3 class="team-name">{{ team.name }}</h3>
              <p class="team-description">{{ team.description }}</p>
              <div class="team-info">
                <div class="team-meta">
                  <van-icon name="people-o" size="14" color="#999" />
                  <span class="team-members">{{ team.memberCount }}名成员</span>
                  <van-icon name="star-o" size="14" color="#999" />
                  <span class="team-activities">{{ team.activityCount }}个活动</span>
                </div>
                <div v-if="team.isCreator" class="creator-badge">
                  创建者
                </div>
              </div>
              <div class="team-tags">
                <van-tag 
                  v-for="(tag, tagIndex) in team.tags.slice(0, 3)" 
                  :key="tagIndex"
                  size="small"
                  color="#f0f0f0"
                  text-color="#666"
                >
                  {{ tag }}</van-tag>
              </div>
            </div>
            <template #right>
              <div class="swipe-buttons">
                <van-button 
                  v-if="team.isCreator"
                  type="primary" 
                  text="管理"
                  size="small"
                  @click="handleManageTeam(team.id)"
                />
                <van-button 
                  type="danger" 
                  text="退出"
                  size="small"
                  @click="handleQuitTeam(team.id)"
                />
              </div>
            </template>
          </van-cell>
        </van-swipe-cell>
      </div>
      <!-- 空状态提示 -->
        <div v-if="!loading" class="empty-state">
        <van-empty description="暂无团队">
          <van-button 
            type="primary" 
            size="large" 
            @click="handleCreateTeam"
            slot="bottom"
          >
            创建团队
          </van-button>
        </van-empty>
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
    
    <!-- 退出团队确认对话框 -->
    <van-dialog
      v-model:show="quitDialog.show"
      title="确认退出"
      show-cancel-button
      @confirm="confirmQuit"
      @cancel="cancelQuit"
    >
      {{ quitDialog.isCreator ? 
          '作为团队创建者，退出将解散团队。确定要解散团队 "' + quitDialog.teamName + '" 吗？' : 
          '确定要退出团队 "' + quitDialog.teamName + '" 吗？' 
      }}
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
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
import { useTeamStore } from '@/stores/team'

const router = useRouter()
const teamStore = useTeamStore()

// 状态管理
const activeTab = ref(0) // 当前选中的标签页：0=全部, 1=我创建的, 2=我加入的
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const currentPage = ref(1)
const pageSize = 10
const selectedSwipe = ref(null) // 当前打开的swipe-cell索引

// 退出对话框状态
const quitDialog = reactive({
  show: false,
  teamId: null,
  teamName: '',
  isCreator: false
})

// 团队列表
const teams = ref([])
const allTeams = ref([]) // 存储所有团队，用于筛选

// 根据当前标签页筛选团队
const filteredTeams = computed(() => {
  if (activeTab.value === 0) return allTeams.value // 全部
  if (activeTab.value === 1) return allTeams.value.filter(team => team.isCreator) // 我创建的
  if (activeTab.value === 2) return allTeams.value.filter(team => !team.isCreator) // 我加入的
  return allTeams.value
})

// 获取团队颜色（根据ID生成）
const getTeamColor = (id) => {
  // 根据团队ID生成固定的颜色
  const colors = [
    '#f56c6c', '#e6a23c', '#5cb87a', 
    '#1989fa', '#6f7ad3', '#909399'
  ]
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

// 获取团队Logo文字（取团队名称前2个字符）
const getTeamLogoText = (name) => {
  return name ? name.slice(0, 2) : '团队'
}

// 处理标签页切换
const handleTabChange = (index) => {
  console.log('🔄 切换标签页:', index)
  activeTab.value = index
  // 重置分页状态
  resetListState()
  // 重置团队列表为筛选后的数据
  teams.value = [...filteredTeams.value]
}

// 重置列表状态
const resetListState = () => {
  currentPage.value = 1
  finished.value = false
  loading.value = false
  refreshing.value = false
}

// 加载团队数据
const loadTeams = async () => {
  try {
    loading.value = true
    console.log('🔄 加载团队数据，页码:', currentPage.value)
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 在真实环境中，这里应该调用API获取数据
    // const response = await teamStore.getMyTeams(currentPage.value, pageSize, activeTab.value)
    
    // 模拟团队数据
    const mockTeams = generateMockTeams()
    
    // 检查是否是第一页
    if (currentPage.value === 1) {
      allTeams.value = mockTeams
    } else {
      allTeams.value = [...allTeams.value, ...mockTeams]
    }
    
    // 更新当前标签页的团队列表
    teams.value = [...filteredTeams.value]
    
    // 检查是否已加载全部数据
    if (mockTeams.length < pageSize) {
      finished.value = true
    }
    
    console.log('✅ 团队数据加载成功，总数:', teams.value.length)
  } catch (error) {
    console.error('加载团队数据失败:', error)
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
  loadTeams()
}

// 上拉加载更多
const onLoad = () => {
  console.log('🔄 上拉加载更多')
  if (finished.value) {
    loading.value = false
    return
  }
  
  currentPage.value++
  loadTeams()
}

// 处理团队卡片打开
const handleOpen = (team, index) => {
  console.log('📋 团队卡片打开:', team.id)
  // 关闭其他已打开的卡片
  if (selectedSwipe.value !== null && selectedSwipe.value !== index) {
    // 在真实环境中，这里可以通过ref或其他方式关闭之前打开的卡片
  }
  selectedSwipe.value = index
}

// 跳转到团队详情
const navigateToTeamDetail = (teamId) => {
  console.log('🚀 跳转到团队详情:', teamId)
  router.push(`/teams/${teamId}`)
}

// 创建团队
const handleCreateTeam = () => {
  console.log('🚀 跳转到创建团队页面')
  router.push('/teams/create')
}

// 管理团队
const handleManageTeam = (teamId) => {
  console.log('⚙️ 管理团队:', teamId)
  router.push(`/teams/${teamId}`)
}

// 退出团队
const handleQuitTeam = (teamId) => {
  console.log('👋 准备退出团队:', teamId)
  // 查找团队信息
  const team = teams.value.find(t => t.id === teamId)
  if (team) {
    quitDialog.teamId = teamId
    quitDialog.teamName = team.name
    quitDialog.isCreator = team.isCreator
    quitDialog.show = true
  }
}

// 确认退出
const confirmQuit = async () => {
  try {
    loading.value = true
    console.log('👋 确认退出团队:', quitDialog.teamId)
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 在真实环境中，这里应该调用API退出/解散团队
    // await teamStore.quitTeam(quitDialog.teamId)
    
    // 从列表中移除
    const index = teams.value.findIndex(team => team.id === quitDialog.teamId)
    if (index >= 0) {
      teams.value.splice(index, 1)
    }
    
    // 同时从全部团队列表中移除
    const allIndex = allTeams.value.findIndex(team => team.id === quitDialog.teamId)
    if (allIndex >= 0) {
      allTeams.value.splice(allIndex, 1)
    }
    
    showToast(quitDialog.isCreator ? '团队已解散' : '已退出团队')
    console.log('✅', quitDialog.isCreator ? '团队解散成功' : '退出团队成功')
  } catch (error) {
    console.error(quitDialog.isCreator ? '解散团队失败:' : '退出团队失败:', error)
    showToast(quitDialog.isCreator ? '解散失败，请重试' : '退出失败，请重试')
  } finally {
    loading.value = false
    quitDialog.show = false
    resetQuitDialog()
  }
}

// 取消退出
const cancelQuit = () => {
  console.log('❌ 取消退出团队')
  resetQuitDialog()
}

// 重置退出对话框状态
const resetQuitDialog = () => {
  quitDialog.teamId = null
  quitDialog.teamName = ''
  quitDialog.isCreator = false
}

// 返回上一页
const handleBack = () => {
  console.log('↩️ 返回上一页')
  router.back()
}

// 生成模拟团队数据
const generateMockTeams = () => {
  return [
    {
      id: `team-${Date.now()}-1`,
      name: '编程兴趣小组',
      description: '热爱编程的同学们一起学习交流的平台',
      memberCount: 45,
      activityCount: 12,
      tags: ['编程', '技术', '学习'],
      isCreator: true
    },
    {
      id: `team-${Date.now()}-2`,
      name: '篮球队',
      description: '校园篮球爱好者的聚集地',
      memberCount: 28,
      activityCount: 24,
      tags: ['体育', '篮球', '运动'],
      isCreator: false
    },
    {
      id: `team-${Date.now()}-3`,
      name: '摄影社团',
      description: '记录美好瞬间，分享摄影技巧',
      memberCount: 36,
      activityCount: 8,
      tags: ['摄影', '艺术', '兴趣'],
      isCreator: false
    },
    {
      id: `team-${Date.now()}-4`,
      name: '志愿者协会',
      description: '传递爱心，服务社会',
      memberCount: 89,
      activityCount: 15,
      tags: ['公益', '志愿者', '服务'],
      isCreator: true
    },
    {
      id: `team-${Date.now()}-5`,
      name: '创业俱乐部',
      description: '交流创业经验，孵化创业项目',
      memberCount: 32,
      activityCount: 10,
      tags: ['创业', '商业', '创新'],
      isCreator: false
    }
  ]
}

// 初始化页面
onMounted(() => {
  console.log('🔄 初始化我的团队页面')
  loadTeams()
})
</script>

<style scoped>
.my-teams-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding-top: 46px; /* 为固定导航栏留出空间 */
}

/* 标签栏样式 */
.tab-bar {
  background: white;
  margin-bottom: 12px;
}

/* 团队列表容器 */
.teams-container {
  padding-bottom: 20px;
}

/* 团队卡片样式 */
.team-card {
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.team-card:active {
  transform: scale(0.98);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.team-content {
  flex: 1;
  padding: 16px 0;
  position: relative;
}

/* 团队Logo样式 */
.team-logo {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.team-logo-text {
  color: white;
  font-size: 18px;
  font-weight: 500;
}

/* 团队信息样式 */
.team-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.team-description {
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  display: box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  box-orient: vertical;
  max-height: 40px;
}

.team-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.team-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
}

.team-members,
.team-activities {
  color: #999;
  margin-left: 4px;
}

/* 创建者标签 */
.creator-badge {
  padding: 2px 8px;
  background: #f0f0f0;
  border-radius: 10px;
  font-size: 12px;
  color: #666;
}

/* 标签样式 */
.team-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
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
}

/* 响应式设计 */
@media (max-width: 480px) {
  .team-logo {
    width: 50px;
    height: 50px;
  }
  
  .team-logo-text {
    font-size: 16px;
  }
  
  .team-description {
    -webkit-line-clamp: 1;
    line-clamp: 1;
  }
  
  .team-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>