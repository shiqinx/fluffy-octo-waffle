<!-- @/views/activity/EditActivity.vue -->
<template>
  <div class="edit-activity">
    <!-- 顶部导航 -->
    <div class="header">
      <button class="back-btn" @click="handleBack">‹</button>
      <h1 class="title">编辑活动</h1>
      <button 
        class="save-btn" 
        @click="handleSave"
        :disabled="saving || !isFormValid"
      >
        {{ saving ? '保存中...' : '保存' }}
      </button>
    </div>

    <!-- 主要内容 -->
    <div class="main-content" v-if="!loading">
      <form @submit.prevent="handleSave" class="activity-form">
        <!-- 基本信息 -->
        <div class="form-section">
          <h3 class="section-title">基本信息</h3>
          
          <div class="form-group" :class="{ error: errors.title }">
            <label class="form-label">活动标题 *</label>
            <input
              type="text"
              v-model="form.title"
              class="form-input"
              placeholder="请输入活动标题"
              maxlength="50"
            />
            <span v-if="errors.title" class="error-message">{{ errors.title }}</span>
          </div>

          <div class="form-group" :class="{ error: errors.category }">
            <label class="form-label">活动类型 *</label>
            <div class="category-selector">
              <div 
                v-for="cat in categories" 
                :key="cat.value"
                class="category-option"
                :class="{ active: form.category === cat.value }"
                @click="form.category = cat.value"
              >
                <span class="category-icon">{{ cat.icon }}</span>
                <span class="category-label">{{ cat.label }}</span>
              </div>
            </div>
            <span v-if="errors.category" class="error-message">{{ errors.category }}</span>
          </div>

          <div class="form-group" :class="{ error: errors.description }">
            <label class="form-label">活动描述 *</label>
            <textarea
              v-model="form.description"
              class="form-textarea"
              placeholder="请描述活动内容、要求等信息"
              rows="4"
              maxlength="500"
            ></textarea>
            <span v-if="errors.description" class="error-message">{{ errors.description }}</span>
          </div>
        </div>

        <!-- 时间设置 -->
        <div class="form-section">
          <h3 class="section-title">时间设置</h3>
          
          <div class="form-group" :class="{ error: errors.startTime }">
            <label class="form-label">开始时间 *</label>
            <input
              type="datetime-local"
              v-model="form.startTime"
              class="form-input"
              :min="minStartTime"
            />
            <span v-if="errors.startTime" class="error-message">{{ errors.startTime }}</span>
          </div>

          <div class="form-group" :class="{ error: errors.endTime }">
            <label class="form-label">结束时间 *</label>
            <input
              type="datetime-local"
              v-model="form.endTime"
              class="form-input"
              :min="form.startTime || minStartTime"
            />
            <span v-if="errors.endTime" class="error-message">{{ errors.endTime }}</span>
          </div>

          <div class="form-group" :class="{ error: errors.registrationDeadline }">
            <label class="form-label">报名截止时间</label>
            <input
              type="datetime-local"
              v-model="form.registrationDeadline"
              class="form-input"
              :max="form.startTime"
            />
            <span v-if="errors.registrationDeadline" class="error-message">{{ errors.registrationDeadline }}</span>
          </div>
        </div>

        <!-- 地点设置 -->
        <div class="form-section">
          <h3 class="section-title">地点设置</h3>
          
          <div class="form-group" :class="{ error: errors.location }">
            <label class="form-label">活动地点 *</label>
            <div class="location-selector" @click="selectLocation">
              <div class="location-display">
                <span v-if="form.location" class="location-text">
                  {{ form.location.name }}
                </span>
                <span v-else class="location-placeholder">选择活动地点</span>
              </div>
              <span class="location-icon">📍</span>
            </div>
            <span v-if="errors.location" class="error-message">{{ errors.location }}</span>
          </div>

          <!-- 地图预览 -->
          <div v-if="form.location" class="map-preview">
            <div class="map-placeholder">
              <span>🗺️</span>
              <p>地图预览: {{ form.location.name }}</p>
              <p class="map-address">{{ form.location.address }}</p>
            </div>
          </div>
        </div>

        <!-- 人数设置 -->
        <div class="form-section">
          <h3 class="section-title">人数设置</h3>
          
          <div class="form-group" :class="{ error: errors.maxParticipants }">
            <label class="form-label">最大参与人数 *</label>
            <input
              type="number"
              v-model.number="form.maxParticipants"
              class="form-input"
              min="1"
              max="1000"
            />
            <span v-if="errors.maxParticipants" class="error-message">{{ errors.maxParticipants }}</span>
          </div>
        </div>

        <!-- 报名设置 -->
        <div class="form-section">
          <h3 class="section-title">报名设置</h3>
          
          <div class="form-group">
            <label class="form-label">报名审核</label>
            <div class="toggle-group">
              <label class="toggle-option">
                <span class="toggle-label">需要审核报名</span>
                <label class="switch">
                  <input type="checkbox" v-model="form.requiresApproval">
                  <span class="slider"></span>
                </label>
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>

    <!-- 加载状态 -->
    <div v-else class="loading-container">
      <div class="loading-spinner"></div>
      <span>加载活动信息中...</span>
    </div>

    <!-- 内置地点选择器 -->
    <div v-if="showLocationPicker" class="location-picker-overlay" @click="showLocationPicker = false">
      <div class="location-picker" @click.stop>
        <div class="picker-header">
          <h3>选择活动地点</h3>
          <button class="close-btn" @click="showLocationPicker = false">×</button>
        </div>
        
        <!-- 搜索框 -->
        <div class="search-box">
          <input
            type="text"
            v-model="locationSearch"
            placeholder="搜索地点..."
            class="search-input"
          />
        </div>

        <!-- 地点列表 -->
        <div class="location-list">
          <div
            v-for="building in filteredLocations"
            :key="building.key"
            class="location-item"
            :class="{ selected: form.location?.key === building.key }"
            @click="selectBuilding(building)"
          >
            <div class="location-info">
              <div class="location-name">{{ building.name }}</div>
              <div class="location-type">{{ getBuildingTypeName(building.type) }}</div>
              <div class="location-address">{{ building.address }}</div>
            </div>
            <div v-if="form.location?.key === building.key" class="selected-icon">✓</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showConfirmDialog, showFailToast } from 'vant'
import { campusBuildings } from '@/config/map'
import { useActivityStore } from '@/stores/activity'
import { useUserStore } from '@/stores/userStore'
import { editActivity, getActivityDetail } from '@/api/activity'

const router = useRouter()
const route = useRoute()
const activityStore = useActivityStore()
const userStore = useUserStore()

// 响应式数据
const loading = ref(true)
const saving = ref(false)
const showLocationPicker = ref(false)
const locationSearch = ref('')

// 表单数据
const form = reactive({
  title: '',
  category: '',
  description: '',
  startTime: '',
  endTime: '',
  registrationDeadline: '',
  location: null,
  maxParticipants: 1,
  requiresApproval: false
})

// 错误信息
const errors = reactive({})

// 计算属性
const minStartTime = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 30)
  return now.toISOString().slice(0, 16)
})

const isFormValid = computed(() => {
  return form.title && 
         form.category && 
         form.description && 
         form.startTime && 
         form.endTime && 
         form.location &&
         form.maxParticipants > 0
})

// 地点列表
const locationsList = computed(() => {
  return Object.keys(campusBuildings).map(key => ({
    key,
    ...campusBuildings[key]
  }))
})

const filteredLocations = computed(() => {
  if (!locationSearch.value.trim()) {
    return locationsList.value
  }
  
  const keyword = locationSearch.value.toLowerCase()
  return locationsList.value.filter(building =>
    building.name.toLowerCase().includes(keyword) ||
    building.address.toLowerCase().includes(keyword)
  )
})

// 分类选项
const categories = [
  { value: 'lecture', label: '讲座', icon: '🎤' },
  { value: 'sports', label: '运动', icon: '⚽' },
  { value: 'game', label: '桌游', icon: '🎮' },
  { value: 'study', label: '学习', icon: '📚' },
  { value: 'other', label: '其他', icon: '🎯' }
]

// 方法
const loadActivityData = async () => {
  try {
    const activityId = route.params.id
    console.log('🔍 EditActivity: 获取活动ID:', activityId, '(类型:', typeof activityId, ')')
    
    if (!activityId) {
      showToast('活动ID无效')
      router.back()
      return
    }

    // 调用真实API获取活动数据
    const response = await getActivityDetail(activityId)
    
    if (!response.success || !response.data) {
      throw new Error(response.message || '活动不存在')
    }

    const activity = response.data

    // 检查权限：只有组织者可以编辑
    if (activity.organizer?.id !== userStore.userInfo?.id) {
      showToast('只有活动组织者可以编辑活动')
      router.back()
      return
    }

    // 填充表单数据
    Object.assign(form, {
      title: activity.title || '',
      category: activity.category || activity.type || '',
      description: activity.description || '',
      startTime: activity.startTime ? new Date(activity.startTime).toISOString().slice(0, 16) : '',
      endTime: activity.endTime ? new Date(activity.endTime).toISOString().slice(0, 16) : '',
      registrationDeadline: activity.registrationDeadline ? new Date(activity.registrationDeadline).toISOString().slice(0, 16) : '',
      location: activity.location || null,
      maxParticipants: activity.maxParticipants || activity.participants?.length || 1,
      requiresApproval: activity.requiresApproval || false
    })

  } catch (error) {
    console.error('加载活动数据失败:', error)
    showFailToast(error.message || '加载活动信息失败')
    router.back()
  } finally {
    loading.value = false
  }
}

const validateForm = () => {
  const newErrors = {}
  
  if (!form.title.trim()) {
    newErrors.title = '请输入活动标题'
  } else if (form.title.length < 2) {
    newErrors.title = '活动标题至少需要2个字符'
  }
  
  if (!form.category) {
    newErrors.category = '请选择活动类型'
  }
  
  if (!form.description.trim()) {
    newErrors.description = '请输入活动描述'
  } else if (form.description.length < 10) {
    newErrors.description = '活动描述至少需要10个字符'
  }
  
  if (!form.startTime) {
    newErrors.startTime = '请选择开始时间'
  }
  
  if (!form.endTime) {
    newErrors.endTime = '请选择结束时间'
  } else if (form.startTime && new Date(form.endTime) <= new Date(form.startTime)) {
    newErrors.endTime = '结束时间必须晚于开始时间'
  }
  
  if (form.registrationDeadline && form.startTime && new Date(form.registrationDeadline) >= new Date(form.startTime)) {
    newErrors.registrationDeadline = '报名截止时间必须早于活动开始时间'
  }
  
  if (!form.location) {
    newErrors.location = '请选择活动地点'
  }
  
  if (!form.maxParticipants || form.maxParticipants < 1) {
    newErrors.maxParticipants = '最大参与人数至少为1人'
  } else if (form.maxParticipants > 1000) {
    newErrors.maxParticipants = '最大参与人数不能超过1000人'
  }
  
  Object.assign(errors, newErrors)
  return Object.keys(newErrors).length === 0
}

const handleSave = async () => {
  if (!validateForm()) {
    showToast('请检查表单填写是否正确')
    return
  }

  try {
    saving.value = true
    
    const activityId = route.params.id
    console.log('🔍 EditActivity: 保存活动ID:', activityId, '(类型:', typeof activityId, ')')
    
    // 准备更新数据
    const updateData = {
      title: form.title.trim(),
      category: form.category,
      type: form.category, // 兼容旧字段
      description: form.description.trim(),
      startTime: new Date(form.startTime),
      endTime: new Date(form.endTime),
      registrationDeadline: form.registrationDeadline ? new Date(form.registrationDeadline) : null,
      location: form.location,
      maxParticipants: form.maxParticipants,
      requiresApproval: form.requiresApproval
    }

    // 调用真实API更新活动
    const response = await editActivity(activityId, updateData)
    
    if (response.success) {
      showToast('活动更新成功')
      router.push(`/activities/${activityId}`)
    } else {
      throw new Error(response.message || '更新失败')
    }
    
  } catch (error) {
    console.error('保存活动失败:', error)
    showFailToast(error.message || '保存失败，请重试')
  } finally {
    saving.value = false
  }
}

const handleBack = async () => {
  // 检查是否有未保存的更改
  const hasChanges = checkFormChanges()
  if (hasChanges) {
    try {
      await showConfirmDialog({
        title: '确认离开',
        message: '您有未保存的更改，确定要离开吗？'
      })
    } catch {
      return // 用户取消
    }
  }
  router.back()
}

const checkFormChanges = () => {
  // 这里可以检查表单是否有更改
  // 简化版本，实际应该与原始数据比较
  return form.title || form.description || form.category
}

const selectLocation = () => {
  showLocationPicker.value = true
}

const selectBuilding = (building) => {
  form.location = {
    key: building.key,
    name: building.name,
    address: building.address,
    coords: building.coords,
    type: building.type
  }
  showLocationPicker.value = false
  locationSearch.value = ''
}

const getBuildingTypeName = (type) => {
  const names = {
    'teaching': '教学区', 'admin': '行政区', 'lab': '实验楼',
    'library': '图书馆', 'dorm': '宿舍区', 'dining': '食堂',
    'sports': '体育设施', 'gate': '校门', 'transport': '交通设施',
    'other': '其他'
  }
  return names[type] || '其他'
}

// 生命周期
onMounted(() => {
  loadActivityData()
})
</script>

<style scoped>
.edit-activity {
  min-height: 100vh;
  background: #f8f9fa;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #e9ecef;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  font-size: 24px;
  background: none;
  border: none;
  color: #495057;
  cursor: pointer;
  padding: 8px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #212529;
  margin: 0;
}

.save-btn {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.save-btn:hover:not(:disabled) {
  background: #0056b3;
}

.save-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.main-content {
  padding: 20px;
  padding-bottom: 70px;
}

.activity-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e9ecef;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  margin-bottom: 8px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #007bff;
}

.form-group.error .form-input,
.form-group.error .form-textarea {
  border-color: #dc3545;
}

.error-message {
  display: block;
  font-size: 12px;
  color: #dc3545;
  margin-top: 4px;
}

.category-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
}

.category-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-option:hover {
  border-color: #007bff;
  background: #f8f9ff;
}

.category-option.active {
  border-color: #007bff;
  background: #007bff;
  color: white;
}

.category-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.category-label {
  font-size: 12px;
  font-weight: 500;
}

.location-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.location-selector:hover {
  border-color: #007bff;
}

.location-display {
  flex: 1;
}

.location-text {
  font-size: 14px;
  color: #212529;
  font-weight: 500;
}

.location-placeholder {
  font-size: 14px;
  color: #6c757d;
}

.location-icon {
  font-size: 18px;
  margin-left: 12px;
}

.map-preview {
  margin-top: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.map-placeholder span {
  font-size: 24px;
  display: block;
  margin-bottom: 8px;
}

.map-placeholder p {
  margin: 4px 0;
  font-size: 14px;
  color: #495057;
}

.map-address {
  font-size: 12px;
  color: #6c757d;
}

.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toggle-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
}

.toggle-label {
  font-size: 14px;
  font-weight: 500;
  color: #495057;
}

.switch {
  position: relative;
  display: inline-block;
  width: 48px;
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
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #007bff;
}

input:checked + .slider:before {
  transform: translateX(24px);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: #6c757d;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e9ecef;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 地点选择器样式 */
.location-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.location-picker {
  background: white;
  border-radius: 16px 16px 0 0;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.picker-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #212529;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-box {
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.location-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.location-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 4px;
}

.location-item:hover {
  background: #f8f9fa;
}

.location-item.selected {
  background: #e7f3ff;
  border: 2px solid #007bff;
}

.location-info {
  flex: 1;
}

.location-name {
  font-size: 16px;
  font-weight: 500;
  color: #212529;
  margin-bottom: 4px;
}

.location-type {
  font-size: 12px;
  color: #007bff;
  margin-bottom: 4px;
}

.location-address {
  font-size: 12px;
  color: #6c757d;
}

.selected-icon {
  width: 24px;
  height: 24px;
  background: #007bff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
}
</style>