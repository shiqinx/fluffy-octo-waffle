<!-- @/views/ProfileView.vue -->
<template>
  <div class="profile-view">
    <!-- 用户信息卡片 -->
    <div class="user-card">
      <div class="user-avatar-section">
        <div class="avatar-container" @click="changeAvatar">
          <img :src="userInfo.avatar || defaultAvatar" alt="用户头像" class="avatar">
          <div class="avatar-overlay">
            <span>📷</span>
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
          <div class="menu-item" @click="goToMyActivities">
            <span class="menu-icon">📝</span>
            <span class="menu-text">我的活动</span>
            <span class="menu-arrow">›</span>
          </div>
          <div class="menu-item" @click="goToMyTeams">
            <span class="menu-icon">👥</span>
            <span class="menu-text">我的团队</span>
            <span class="menu-arrow">›</span>
          </div>
          <div class="menu-item" @click="goToMyEnrollments">
            <span class="menu-icon">✅</span>
            <span class="menu-text">我报名的</span>
            <span class="menu-arrow">›</span>
          </div>
        </div>
      </div>

      <div class="menu-group">
        <h3 class="menu-title">系统设置</h3>
        <div class="menu-list">
          <div class="menu-item" @click="goToSettings">
            <span class="menu-icon">⚙️</span>
            <span class="menu-text">系统设置</span>
            <span class="menu-arrow">›</span>
          </div>
          <div class="menu-item" @click="goToFeedback">
            <span class="menu-icon">💬</span>
            <span class="menu-text">帮助反馈</span>
            <span class="menu-arrow">›</span>
          </div>
          <div class="menu-item" @click="goToAbout">
            <span class="menu-icon">ℹ️</span>
            <span class="menu-text">关于我们</span>
            <span class="menu-arrow">›</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 退出登录 -->
    <div class="logout-section">
      <button class="logout-btn" @click="handleLogout">
        <span class="logout-icon">🚪</span>
        <span>退出登录</span>
      </button>
    </div>

    <!-- 底部安全区域 -->
    <div class="bottom-safe-area"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/authStore'
import { showConfirmDialog, showFailToast } from 'vant'
import { getUserInfo, getUserStatistics, userLogout } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()

// 默认头像
const defaultAvatar = 'https://via.placeholder.com/80/667eea/ffffff?text=头像'

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

// 方法
const changeAvatar = () => {
  // 实际项目中这里应该调用图片上传组件
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // 处理头像上传
      console.log('选择头像:', file)
      // userStore.updateAvatar(file)
    }
  }
  input.click()
}

const goToEditProfile = () => {
  router.push('/edit-profile')
}

const goToMyActivities = () => {
  router.push('/my-activities')
}

const goToMyTeams = () => {
  router.push('/my-teams')
}

const goToMyEnrollments = () => {
  router.push('/my-enrollments')
}

const goToSettings = () => {
  router.push('/settings')
}

const goToFeedback = () => {
  router.push('/feedback')
}

const goToAbout = () => {
  router.push('/about')
}

const handleLogout = async () => {
  try {
    await showConfirmDialog({
      title: '退出登录',
      message: '确定要退出登录吗？',
    })
    
    try {
      // 调用退出登录API
      const response = await userLogout()
      if (response.success) {
        console.log('服务器退出登录成功')
      } else {
        console.warn('服务器退出登录失败:', response.message)
      }
    } catch (error) {
      console.error('退出登录API调用失败:', error)
    }
    
    // 无论API是否成功，都执行本地退出逻辑
    authStore.logout()
    userStore.logout()
    router.push('/login')
  } catch (error) {
    // 用户取消操作
    console.log('用户取消退出登录')
  }
}

// 加载用户统计数据
const loadUserStats = async () => {
  try {
    const response = await getUserStatistics()
    if (response.success && response.data) {
      userStats.value = {
        createdActivities: response.data.createdActivities || 0,
        joinedActivities: response.data.joinedActivities || 0,
        creditScore: response.data.creditScore || 100,
        completionRate: response.data.completionRate || 0
      }
    } else {
      throw new Error(response.message || '获取用户统计数据失败')
    }
  } catch (error) {
    console.error('加载用户统计数据失败:', error)
    showFailToast('加载统计数据失败')
    // 使用默认数据作为回退
    userStats.value = {
      createdActivities: 0,
      joinedActivities: 0,
      creditScore: 100,
      completionRate: 0
    }
  }
}

// 初始化
onMounted(async () => {
  try {
    // 加载用户信息
    const response = await getUserInfo()
    if (response.success && response.data) {
      userStore.setUserInfo(response.data)
    } else {
      console.warn('获取用户信息失败:', response.message)
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
  }
  
  // 加载用户统计数据
  loadUserStats()
})
</script>

<style scoped>
.profile-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 70px; /* 为底部导航留出空间 */
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
  width: 24px;
  text-align: center;
}

.menu-text {
  flex: 1;
  font-size: 16px;
  color: #333;
}

.menu-arrow {
  color: #999;
  font-size: 18px;
}

.logout-section {
  padding: 20px 16px;
}

.logout-btn {
  width: 100%;
  padding: 14px;
  border: 1px solid #ff4d4f;
  border-radius: 8px;
  background: white;
  color: #ff4d4f;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.logout-btn:hover {
  background: #fff2f0;
}

.logout-icon {
  font-size: 18px;
}

/* 底部安全区域，确保内容不被底部导航覆盖 */
.bottom-safe-area {
  height: 60px;
  width: 100%;
}
</style>