<template>
  <div class="settings-view">
    <!-- 顶部导航 -->
    <div class="header">
      <button class="back-btn" @click="$router.back()">‹</button>
      <h1 class="title">设置</h1>
      <div class="header-placeholder"></div>
    </div>

    <div class="settings-content">
      <!-- 账号设置 -->
      <div class="settings-section">
        <h3 class="section-title">账号设置</h3>
        <div class="settings-list">
          <div class="setting-item" @click="changePassword">
            <div class="setting-info">
              <span class="setting-icon">🔒</span>
              <span class="setting-text">修改密码</span>
            </div>
            <span class="setting-arrow">›</span>
          </div>
          
          <div class="setting-item" @click="bindPhone">
            <div class="setting-info">
              <span class="setting-icon">📱</span>
              <span class="setting-text">绑定手机</span>
              <span class="setting-status" :class="{ bound: isPhoneBound }">
                {{ isPhoneBound ? '已绑定' : '未绑定' }}
              </span>
            </div>
            <span class="setting-arrow">›</span>
          </div>
          
          <div class="setting-item" @click="bindEmail">
            <div class="setting-info">
              <span class="setting-icon">📧</span>
              <span class="setting-text">绑定邮箱</span>
              <span class="setting-status" :class="{ bound: isEmailBound }">
                {{ isEmailBound ? '已绑定' : '未绑定' }}
              </span>
            </div>
            <span class="setting-arrow">›</span>
          </div>
        </div>
      </div>

      <!-- 通知设置 -->
      <div class="settings-section">
        <h3 class="section-title">通知设置</h3>
        <div class="settings-list">
          <div class="setting-item toggle-item">
            <div class="setting-info">
              <span class="setting-icon">🔔</span>
              <span class="setting-text">活动提醒</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="notifications.activity" @change="saveNotificationSettings">
              <span class="slider"></span>
            </label>
          </div>
          
          <div class="setting-item toggle-item">
            <div class="setting-info">
              <span class="setting-icon">💬</span>
              <span class="setting-text">消息通知</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="notifications.message" @change="saveNotificationSettings">
              <span class="slider"></span>
            </label>
          </div>
          
          <div class="setting-item toggle-item">
            <div class="setting-info">
              <span class="setting-icon">📢</span>
              <span class="setting-text">系统公告</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="notifications.system" @change="saveNotificationSettings">
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- 隐私设置 -->
      <div class="settings-section">
        <h3 class="section-title">隐私设置</h3>
        <div class="settings-list">
          <div class="setting-item toggle-item">
            <div class="setting-info">
              <span class="setting-icon">📍</span>
              <span class="setting-text">位置共享</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="privacy.location" @change="savePrivacySettings">
              <span class="slider"></span>
            </label>
          </div>
          
          <div class="setting-item" @click="showProfileVisibility">
            <div class="setting-info">
              <span class="setting-icon">👤</span>
              <span class="setting-text">资料可见性</span>
              <span class="setting-value">{{ getVisibilityText(privacy.profileVisibility) }}</span>
            </div>
            <span class="setting-arrow">›</span>
          </div>
          
          <div class="setting-item" @click="showActivityVisibility">
            <div class="setting-info">
              <span class="setting-icon">📊</span>
              <span class="setting-text">活动记录可见性</span>
              <span class="setting-value">{{ getVisibilityText(privacy.activityVisibility) }}</span>
            </div>
            <span class="setting-arrow">›</span>
          </div>
        </div>
      </div>

      <!-- 通用设置 -->
      <div class="settings-section">
        <h3 class="section-title">通用设置</h3>
        <div class="settings-list">
          <div class="setting-item" @click="changeLanguage">
            <div class="setting-info">
              <span class="setting-icon">🌐</span>
              <span class="setting-text">语言设置</span>
              <span class="setting-value">{{ language }}</span>
            </div>
            <span class="setting-arrow">›</span>
          </div>
          
          <div class="setting-item" @click="changeTheme">
            <div class="setting-info">
              <span class="setting-icon">🎨</span>
              <span class="setting-text">主题模式</span>
              <span class="setting-value">{{ getThemeText(theme) }}</span>
            </div>
            <span class="setting-arrow">›</span>
          </div>
          
          <div class="setting-item" @click="changeFontSize">
            <div class="setting-info">
              <span class="setting-icon">🔤</span>
              <span class="setting-text">字体大小</span>
              <span class="setting-value">{{ getFontSizeText(fontSize) }}</span>
            </div>
            <span class="setting-arrow">›</span>
          </div>
          
          <div class="setting-item" @click="clearCache">
            <div class="setting-info">
              <span class="setting-icon">🧹</span>
              <span class="setting-text">清除缓存</span>
              <span class="setting-value">{{ cacheSize }}</span>
            </div>
            <span class="setting-arrow">›</span>
          </div>
        </div>
      </div>

      <!-- 关于 -->
      <div class="settings-section">
        <h3 class="section-title">关于</h3>
        <div class="settings-list">
          <div class="setting-item" @click="checkVersion">
            <div class="setting-info">
              <span class="setting-icon">ℹ️</span>
              <span class="setting-text">版本信息</span>
              <span class="setting-value">v{{ appVersion }}</span>
            </div>
            <span class="setting-arrow">›</span>
          </div>
          
          <div class="setting-item" @click="viewUserAgreement">
            <div class="setting-info">
              <span class="setting-icon">📄</span>
              <span class="setting-text">用户协议</span>
            </div>
            <span class="setting-arrow">›</span>
          </div>
          
          <div class="setting-item" @click="viewPrivacyPolicy">
            <div class="setting-info">
              <span class="setting-icon">🛡️</span>
              <span class="setting-text">隐私政策</span>
            </div>
            <span class="setting-arrow">›</span>
          </div>
          
          <div class="setting-item" @click="giveFeedback">
            <div class="setting-info">
              <span class="setting-icon">💭</span>
              <span class="setting-text">意见反馈</span>
            </div>
            <span class="setting-arrow">›</span>
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
    </div>

    <!-- 选择器弹窗 -->
    <SelectionModal 
      v-if="showVisibilityModal"
      :title="visibilityModalTitle"
      :options="visibilityOptions"
      :selected="currentVisibility"
      @select="handleVisibilitySelect"
      @close="showVisibilityModal = false"
    />

    <SelectionModal 
      v-if="showThemeModal"
      title="选择主题模式"
      :options="themeOptions"
      :selected="theme"
      @select="handleThemeSelect"
      @close="showThemeModal = false"
    />

    <SelectionModal 
      v-if="showFontSizeModal"
      title="选择字体大小"
      :options="fontSizeOptions"
      :selected="fontSize"
      @select="handleFontSizeSelect"
      @close="showFontSizeModal = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

// 内联选择器弹窗组件
const SelectionModal = defineComponent({
  props: {
    title: String,
    options: Array,
    selected: String
  },
  emits: ['select', 'close'],
  setup(props, { emit }) {
    const handleSelect = (value) => {
      emit('select', value)
      emit('close')
    }
    
    return {
      handleSelect
    }
  },
  template: `
    <div class="modal-overlay" @click="$emit('close')">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
          <button class="modal-close" @click="$emit('close')">✕</button>
        </div>
        <div class="modal-body">
          <div 
            v-for="option in options" 
            :key="option.value"
            class="option-item"
            :class="{ selected: option.value === selected }"
            @click="handleSelect(option.value)"
          >
            <div class="option-text">{{ option.label }}</div>
            <div v-if="option.value === selected" class="option-check">✓</div>
          </div>
        </div>
      </div>
    </div>
  `
})

// 响应式数据
const isPhoneBound = ref(false)
const isEmailBound = ref(false)
const appVersion = ref('1.0.0')
const cacheSize = ref('12.5 MB')

const notifications = reactive({
  activity: true,
  message: true,
  system: true
})

const privacy = reactive({
  location: true,
  profileVisibility: 'public',
  activityVisibility: 'friends'
})

const language = ref('简体中文')
const theme = ref('auto')
const fontSize = ref('normal')

// 弹窗控制
const showVisibilityModal = ref(false)
const showThemeModal = ref(false)
const showFontSizeModal = ref(false)
const visibilityModalTitle = ref('')
const currentVisibility = ref('')
const visibilityType = ref('') // 'profile' or 'activity'

// 选项配置
const visibilityOptions = [
  { value: 'public', label: '公开' },
  { value: 'friends', label: '仅好友' },
  { value: 'private', label: '仅自己' }
]

const themeOptions = [
  { value: 'light', label: '浅色模式' },
  { value: 'dark', label: '深色模式' },
  { value: 'auto', label: '跟随系统' }
]

const fontSizeOptions = [
  { value: 'small', label: '小' },
  { value: 'normal', label: '标准' },
  { value: 'large', label: '大' },
  { value: 'xlarge', label: '特大' }
]

// 方法
const changePassword = () => {
  router.push('/change-password')
}

const bindPhone = () => {
  router.push('/bind-phone')
}

const bindEmail = () => {
  router.push('/bind-email')
}

const showProfileVisibility = () => {
  visibilityModalTitle.value = '资料可见性'
  currentVisibility.value = privacy.profileVisibility
  visibilityType.value = 'profile'
  showVisibilityModal.value = true
}

const showActivityVisibility = () => {
  visibilityModalTitle.value = '活动记录可见性'
  currentVisibility.value = privacy.activityVisibility
  visibilityType.value = 'activity'
  showVisibilityModal.value = true
}

const handleVisibilitySelect = (value) => {
  if (visibilityType.value === 'profile') {
    privacy.profileVisibility = value
  } else {
    privacy.activityVisibility = value
  }
  savePrivacySettings()
  showVisibilityModal.value = false
}

const changeLanguage = () => {
  // 语言设置逻辑
  console.log('打开语言设置')
}

const changeTheme = () => {
  showThemeModal.value = true
}

const handleThemeSelect = (value) => {
  theme.value = value
  applyTheme(value)
  saveGeneralSettings()
  showThemeModal.value = false
}

const changeFontSize = () => {
  showFontSizeModal.value = true
}

const handleFontSizeSelect = (value) => {
  fontSize.value = value
  applyFontSize(value)
  saveGeneralSettings()
  showFontSizeModal.value = false
}

const clearCache = async () => {
  if (confirm('确定要清除缓存吗？')) {
    try {
      // 清除缓存逻辑
      localStorage.removeItem('cache_data')
      sessionStorage.clear()
      cacheSize.value = '0 MB'
      alert('缓存清除成功')
    } catch (error) {
      console.error('清除缓存失败:', error)
      alert('清除缓存失败')
    }
  }
}

const checkVersion = () => {
  alert(`当前版本: ${appVersion.value}\n已是最新版本`)
}

const viewUserAgreement = () => {
  window.open('/user-agreement', '_blank')
}

const viewPrivacyPolicy = () => {
  window.open('/privacy-policy', '_blank')
}

const giveFeedback = () => {
  router.push('/feedback')
}

const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    userStore.logout()
    router.push('/login')
  }
}

const getVisibilityText = (visibility) => {
  const map = {
    public: '公开',
    friends: '仅好友',
    private: '仅自己'
  }
  return map[visibility] || visibility
}

const getThemeText = (theme) => {
  const map = {
    light: '浅色模式',
    dark: '深色模式',
    auto: '跟随系统'
  }
  return map[theme] || theme
}

const getFontSizeText = (size) => {
  const map = {
    small: '小',
    normal: '标准',
    large: '大',
    xlarge: '特大'
  }
  return map[size] || size
}

const saveNotificationSettings = async () => {
  try {
    // 保存通知设置到服务器
    console.log('保存通知设置:', notifications)
  } catch (error) {
    console.error('保存通知设置失败:', error)
  }
}

const savePrivacySettings = async () => {
  try {
    // 保存隐私设置到服务器
    console.log('保存隐私设置:', privacy)
  } catch (error) {
    console.error('保存隐私设置失败:', error)
  }
}

const saveGeneralSettings = async () => {
  try {
    // 保存通用设置到服务器
    const settings = {
      language: language.value,
      theme: theme.value,
      fontSize: fontSize.value
    }
    console.log('保存通用设置:', settings)
  } catch (error) {
    console.error('保存通用设置失败:', error)
  }
}

const applyTheme = (theme) => {
  // 应用主题逻辑
  document.documentElement.setAttribute('data-theme', theme)
}

const applyFontSize = (size) => {
  // 应用字体大小逻辑
  const sizes = {
    small: '14px',
    normal: '16px',
    large: '18px',
    xlarge: '20px'
  }
  document.documentElement.style.fontSize = sizes[size] || '16px'
}

// 加载设置
const loadSettings = async () => {
  try {
    // 从服务器加载用户设置
    // 这里使用模拟数据
    isPhoneBound.value = true
    isEmailBound.value = false
    
    // 加载通知设置
    Object.assign(notifications, {
      activity: true,
      message: true,
      system: false
    })
    
    // 加载隐私设置
    Object.assign(privacy, {
      location: true,
      profileVisibility: 'public',
      activityVisibility: 'friends'
    })
    
    // 加载通用设置
    language.value = '简体中文'
    theme.value = 'auto'
    fontSize.value = 'normal'
    
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

// 初始化
onMounted(() => {
  loadSettings()
  applyTheme(theme.value)
  applyFontSize(fontSize.value)
})
</script>

<style scoped>
.settings-view {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
}

.back-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  margin-right: 12px;
}

.title {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  text-align: center;
}

.header-placeholder {
  width: 32px;
}

.settings-content {
  padding-bottom: 20px;
}

.settings-section {
  background: white;
  margin-bottom: 12px;
}

.section-title {
  font-size: 14px;
  color: #999;
  margin: 0;
  padding: 16px 16px 8px;
  font-weight: normal;
}

.settings-list {
  margin: 0 -16px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  cursor: pointer;
  transition: background 0.3s;
  border-bottom: 1px solid #f8f8f8;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item:hover {
  background: #fafafa;
}

.setting-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.setting-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.setting-text {
  font-size: 16px;
  color: #333;
}

.setting-status {
  font-size: 12px;
  color: #999;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 10px;
}

.setting-status.bound {
  background: #e6f7ff;
  color: #1890ff;
}

.setting-value {
  font-size: 14px;
  color: #666;
}

.setting-arrow {
  color: #999;
  font-size: 18px;
}

.toggle-item {
  cursor: default;
}

.toggle-item:hover {
  background: white;
}

/* 开关样式 */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #1890ff;
}

input:checked + .slider:before {
  transform: translateX(20px);
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
/* 选择器弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.modal-close:hover {
  background-color: #f5f5f5;
}

.modal-body {
  padding: 12px 0;
}

.option-item {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.option-item:hover {
  background-color: #f8f9fa;
}

.option-item.selected {
  background-color: #e3f2fd;
  color: #1976d2;
}

.option-text {
  font-size: 16px;
}

.option-check {
  font-size: 18px;
  font-weight: bold;
}

</style>