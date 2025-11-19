<!-- @/views/ProfileView.vue -->
<template>
  <div class="profile-view">
    <van-nav-bar title="个人中心" fixed placeholder />
    
    <!-- 用户信息卡片 -->
    <div class="user-card">
      <div class="user-avatar-section">
        <div class="avatar-container" @click="changeAvatar">
          <img :src="userInfo.avatar || defaultAvatar" alt="用户头像" class="avatar">
          <div class="avatar-overlay">
            <van-icon name="photograph" size="24" color="white" />
          </div>
        </div>
        <button class="edit-profile-btn" @click="goToEditProfile">编辑资料</button>
      </div>
      
      <div class="user-info">
        <h2 class="user-name">{{ userInfo.realName }}</h2>
        <p class="user-id">学号: {{ userInfo.studentId }}</p>
        <p class="user-department">{{ userInfo.department }}</p>
      </div>
    </div>

    <!-- 数据统计 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number">{{ userStats.createdActivities }}</div>
          <div class="stat-label">发布活动</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ userStats.joinedActivities }}</div>
          <div class="stat-label">参与活动</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ userStats.creditScore }}</div>
          <div class="stat-label">信誉分数</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ userStats.completionRate }}%</div>
          <div class="stat-label">完成率</div>
        </div>
      </div>
    </div>

    <!-- 功能菜单 -->
    <div class="menu-section">
      <div class="menu-group">
        <h3 class="menu-title">我的内容</h3>
        <div class="menu-list">
          <div class="menu-item" @click="goToMyCreatedActivities">
            <van-icon name="notes-o" class="menu-icon" />
            <span class="menu-text">我发布的活动</span>
            <van-icon name="arrow" class="menu-arrow" />
          </div>
          <div class="menu-item" @click="goToMyEnrolledActivities">
            <van-icon name="passed" class="menu-icon" />
            <span class="menu-text">我报名的活动</span>
            <van-icon name="arrow" class="menu-arrow" />
          </div>
          <div class="menu-item" @click="goToMyTeams">
            <van-icon name="friends-o" class="menu-icon" />
            <span class="menu-text">我的团队</span>
            <van-icon name="arrow" class="menu-arrow" />
          </div>
        </div>
      </div>

      <div class="menu-group">
        <h3 class="menu-title">系统设置</h3>
        <div class="menu-list">
          <div class="menu-item" @click="goToSettings">
            <van-icon name="setting-o" class="menu-icon" />
            <span class="menu-text">系统设置</span>
            <van-icon name="arrow" class="menu-arrow" />
          </div>
          <div class="menu-item" @click="clearData">
            <van-icon name="delete-o" class="menu-icon" />
            <span class="menu-text text-danger">清理活动数据</span>
            <van-icon name="arrow" class="menu-arrow" />
          </div>
          <div class="menu-item" @click="goToFeedback">
            <van-icon name="comment-o" class="menu-icon" />
            <span class="menu-text">帮助反馈</span>
            <van-icon name="arrow" class="menu-arrow" />
          </div>
          <div class="menu-item" @click="goToAbout">
            <van-icon name="info-o" class="menu-icon" />
            <span class="menu-text">关于我们</span>
            <van-icon name="arrow" class="menu-arrow" />
          </div>
        </div>
      </div>
    </div>

    <!-- 退出登录 -->
    <div class="logout-section">
      <van-button 
        class="logout-btn" 
        type="default" 
        size="large" 
        @click="handleLogout"
      >
        <van-icon name="revoke" />
        退出登录
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/auth'
import { showConfirmDialog, showToast, showFailToast } from 'vant'
import { useActivityStore } from '@/stores/activity' // 导入正确的activity store
import { getUserInfo, getUserStatistics, userLogout } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()
const activityStore = useActivityStore()

// 使用base64头像
const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiNlMWUxZTEiLz4KPHBhdGggZD0iTTQwIDQ0QzQ0LjQxODMgNDQgNDggNDAuNDE4MyA0OCAzNkM0OCAzMS41ODE3IDQ0LjQxODMgMjggNDAgMjhDMzUuNTgxNyAyOCAzMiAzMS41ODE3IDMyIDM2QzMyIDQwLjQxODMgMzUuNTgxNyA0NCA0MCA0NFoiIGZpbGw9IiM5OTk5OTkiLz4KPHBhdGggZD0iTTU2IDUyQzU2IDU4LjYyNzQgNTAuNjI3NCA2NCA0NCA2NEgzNkMyOS4zNzI2IDY0IDI0IDU4LjYyNzQgMjQgNTJWMjRINTZWNTRaIiBmaWxsPSIjOTk5OTk5Ii8+Cjwvc3ZnPgo='

// 用户信息
const userInfo = computed(() => userStore.userInfo || {
  realName: '未设置',
  studentId: '未设置',
  department: '未设置院系',
  avatar: defaultAvatar
})

// 用户统计数据
const userStats = ref({
  createdActivities: 0,
  joinedActivities: 0,
  creditScore: 100,
  completionRate: 0
})

const handleLogout = async () => {
  try {
    await showConfirmDialog({
      title: '确认退出',
      message: '确定要退出登录吗？',
    })
    
    console.log('🚪 开始退出登录流程...')
    
    try {
      // 使用真实API退出登录
      const response = await userLogout()
      
      if (response.success) {
        console.log('✅ 服务器退出登录成功')
      } else {
        console.warn('⚠️ 服务器退出登录失败，但继续本地清理:', response.message)
      }
    } catch (error) {
      console.warn('⚠️ 退出登录API调用失败，但继续本地清理:', error)
    }
    
    // 调用 auth store 的退出登录方法（会同时清除 user store）
    if (authStore && typeof authStore.logoutUser === 'function') {
      console.log('🔐 调用 authStore.logoutUser()')
      authStore.logoutUser()
    } else {
      console.warn('❌ authStore.logoutUser 方法不存在')
      // 备用方案：手动清除
      userStore.logout()
      localStorage.clear()
    }
    
    console.log('✅ 退出登录完成，跳转到登录页')
    
    showToast('退出登录成功')
    
    // 使用 replace 跳转到登录页
    router.replace('/login').then(() => {
      console.log('✅ 成功跳转到登录页')
    }).catch((error) => {
      console.error('❌ 跳转失败:', error)
      // 如果路由跳转失败，强制刷新到登录页
      window.location.href = '/login'
    })
    
  } catch (error) {
    // 用户取消操作
    console.log('用户取消退出登录')
  }
}

// 更换头像
const changeAvatar = () => {
  console.log('更换头像')
  // 这里可以实现头像上传功能
}

// 编辑资料
const goToEditProfile = () => {
  console.log('编辑资料')
  router.push('/profile/edit')
}

// 我发布的活动
const goToMyCreatedActivities = () => {
  console.log('我发布的活动')
  router.push('/my-created-activities')
}

// 我报名的活动
const goToMyEnrolledActivities = () => {
  console.log('我报名的活动')
  router.push('/my-enrolled-activities')
}

// 我的团队
const goToMyTeams = () => {
  console.log('我的团队')
  router.push('/my-teams')
}

// 系统设置
const goToSettings = () => {
  console.log('系统设置')
  router.push('/settings')
}

// 帮助反馈
const goToFeedback = () => {
  console.log('帮助反馈')
  router.push('/feedback')
}

// 关于我们
const goToAbout = () => {
  console.log('关于我们')
  router.push('/about')
}

// 清理活动数据
const clearData = async () => {
  try {
    await showConfirmDialog({
      title: '确认清理',
      message: '确定要清理所有活动数据吗？这将删除所有存储在本地的活动信息，但不会影响您的用户信息。'
    })
    
    const success = activityStore.clearActivitiesStorage()
    if (success) {
      showToast('活动数据已成功清理！请刷新页面以查看效果。')
    } else {
      showToast('清理数据失败，请重试。')
    }
  } catch (error) {
    // 用户取消操作不显示错误
    if (error !== 'cancel') {
      console.error('清理数据时出错:', error)
      showToast('清理数据时出现错误，请重试。')
    }
  }
}

// 加载用户统计数据
const loadUserStats = async () => {
  try {
    // 使用真实API获取用户统计信息
    const response = await getUserStatistics()
    
    if (response.success && response.data) {
      const stats = response.data
      userStats.value = {
        createdActivities: stats.totalActivities || 0,
        joinedActivities: stats.joinedActivities || 0,
        creditScore: userStore.userInfo?.creditScore || 100,
        completionRate: stats.completionRate || 0
      }
      console.log('成功获取用户统计信息:', userStats.value)
    } else {
      throw new Error(response.message || '获取用户统计信息失败')
    }
  } catch (error) {
    console.error('加载用户统计数据失败:', error)
    showFailToast(error.message || '加载统计数据失败')
    
    // 如果API调用失败，回退到本地计算
    await loadUserStatsFromLocal()
  }
}

// 从本地数据计算用户统计信息（作为回退方案）
const loadUserStatsFromLocal = async () => {
  try {
    // 获取用户的活动数据
    await activityStore.loadActivities()
    const activities = activityStore.activities || []
    
    // 计算统计数据
    const createdActivities = activities.filter(activity => 
      activity.organizer?.id === userStore.userId || activity.organizerId === userStore.userId
    ).length
    
    const joinedActivities = activities.filter(activity => 
      activity.isEnrolled && 
      activity.organizer?.id !== userStore.userId && 
      activity.organizerId !== userStore.userId
    ).length
    
    // 计算完成率（已结束且用户参与的活动）
    const currentTime = new Date()
    const completedActivities = activities.filter(activity => 
      activity.isEnrolled && 
      new Date(activity.endTime) < currentTime
    ).length
    
    const totalEnrolledActivities = activities.filter(activity => 
      activity.isEnrolled && 
      activity.organizer?.id !== userStore.userId && 
      activity.organizerId !== userStore.userId
    ).length
    
    const completionRate = totalEnrolledActivities > 0 
      ? Math.round((completedActivities / totalEnrolledActivities) * 100)
      : 0
    
    userStats.value = {
      createdActivities,
      joinedActivities,
      creditScore: userStore.userInfo?.creditScore || 100,
      completionRate
    }
  } catch (error) {
    console.error('从本地数据计算统计信息失败:', error)
    // 如果本地计算也失败，使用默认值
    userStats.value = {
      createdActivities: 0,
      joinedActivities: 0,
      creditScore: userStore.userInfo?.creditScore || 100,
      completionRate: 0
    }
  }
}

// 初始化
onMounted(() => {
  loadUserStats()
})
</script>

<style scoped>
.profile-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 70px;
}

.user-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px 20px;
}

.user-avatar-section {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.avatar-container {
  position: relative;
  margin-right: 16px;
  cursor: pointer;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.3);
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.edit-profile-btn {
  padding: 6px 12px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  background: transparent;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.edit-profile-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.user-info {
  flex: 1;
}

.user-name {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 600;
}

.user-id {
  margin: 0 0 4px 0;
  font-size: 14px;
  opacity: 0.9;
}

.user-department {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.stats-section {
  background: white;
  padding: 20px;
  margin-bottom: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.menu-section {
  background: white;
  margin-bottom: 12px;
}

.menu-group {
  padding: 0 16px;
}

.menu-group:not(:last-child) {
  border-bottom: 1px solid #f0f0f0;
}

.menu-title {
  font-size: 14px;
  color: #999;
  margin: 16px 0 8px 0;
  font-weight: normal;
}

.menu-list {
  margin: 0 -16px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  transition: background 0.3s;
  border-bottom: 1px solid #f8f8f8;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background: #fafafa;
}

.menu-icon {
  font-size: 18px;
  margin-right: 12px;
  color: #666;
}

.menu-text {
  flex: 1;
  font-size: 16px;
  color: #333;
}

.menu-arrow {
  color: #999;
  font-size: 16px;
}

.logout-section {
  padding: 20px 16px;
  margin-bottom: 40px;
}

.logout-btn {
  width: 100%;
}
</style>