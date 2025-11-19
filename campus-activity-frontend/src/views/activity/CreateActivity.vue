<template>
  <div class="create-activity">
    <!-- 顶部导航 -->
    <div class="header">
      <button class="back-btn" @click="handleBack">‹</button>
      <h1 class="title">创建活动</h1>
      <button class="save-btn" @click="saveDraft" :disabled="saving">
        {{ saving ? '保存中...' : '存草稿' }}
      </button>
    </div>

    <div class="form-container">
      <form @submit.prevent="handleSubmit">
        <!-- 基本信息 -->
        <div class="form-section">
          <h3 class="section-title">基本信息</h3>
          
          <!-- 活动标题 -->
          <div class="form-group" :class="{ error: errors.title }">
            <label class="form-label">活动标题 *</label>
            <input
              v-model="form.title"
              type="text"
              placeholder="请输入活动标题"
              maxlength="30"
              class="form-input"
            />
            <div class="char-count">{{ form.title.length }}/30</div>
            <span v-if="errors.title" class="error-message">{{ errors.title }}</span>
          </div>

          <!-- 活动分类 -->
          <div class="form-group" :class="{ error: errors.category }">
            <label class="form-label">活动分类 *</label>
            <div class="category-grid">
              <label
                v-for="category in categories"
                :key="category.value"
                :class="['category-option', { active: form.category === category.value }]"
              >
                <input
                  type="radio"
                  v-model="form.category"
                  :value="category.value"
                  class="radio-input"
                />
                <span class="category-icon">{{ category.icon }}</span>
                <span class="category-label">{{ category.label }}</span>
              </label>
            </div>
            <span v-if="errors.category" class="error-message">{{ errors.category }}</span>
          </div>

          <!-- 活动描述 -->
          <div class="form-group" :class="{ error: errors.description }">
            <label class="form-label">活动描述 *</label>
            <textarea
              v-model="form.description"
              placeholder="请简单描述活动内容、要求等信息..."
              maxlength="300"
              rows="4"
              class="form-textarea"
            ></textarea>
            <div class="char-count">{{ form.description.length }}/300</div>
            <span v-if="errors.description" class="error-message">{{ errors.description }}</span>
          </div>
        </div>

        <!-- 活动设置 -->
        <div class="form-section">
          <h3 class="section-title">活动设置</h3>
          
          <!-- 人数限制 -->
          <div class="form-group">
            <label class="form-label">人数限制 *</label>
            <div class="number-input-group">
              <button
                type="button"
                class="number-btn"
                @click="decreaseParticipants"
                :disabled="form.maxParticipants <= 2"
              >-</button>
              <input
                v-model.number="form.maxParticipants"
                type="number"
                min="2"
                max="50"
                class="number-input"
              />
              <button
                type="button"
                class="number-btn"
                @click="increaseParticipants"
                :disabled="form.maxParticipants >= 50"
              >+</button>
            </div>
          </div>

          <!-- 开始时间 -->
          <div class="form-group" :class="{ error: errors.startTime }">
            <label class="form-label">开始时间 *</label>
            <input
              v-model="form.startTime"
              type="datetime-local"
              :min="minStartTime"
              class="form-input"
            />
            <span v-if="errors.startTime" class="error-message">{{ errors.startTime }}</span>
          </div>

          <!-- 结束时间 -->
          <div class="form-group" :class="{ error: errors.endTime }">
            <label class="form-label">结束时间 *</label>
            <input
              v-model="form.endTime"
              type="datetime-local"
              :min="form.startTime || minStartTime"
              class="form-input"
            />
            <span v-if="errors.endTime" class="error-message">{{ errors.endTime }}</span>
          </div>
        </div>

        <!-- 地点设置 -->
        <div class="form-section">
          <h3 class="section-title">地点设置</h3>
          
          <!-- 活动地点 -->
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

        <!-- 报名审核 -->
        <div class="form-section">
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

        <!-- 底部操作栏 -->
        <div class="form-actions">
          <button
            type="button"
            class="btn secondary"
            @click="handleBack"
            :disabled="submitting"
          >
            取消
          </button>
          <button
            type="submit"
            class="btn primary"
            :disabled="submitting || !isFormValid"
          >
            {{ submitting ? '发布中...' : '发布活动' }}
          </button>
        </div>
      </form>
    </div>

    <!-- 内置地点选择器 -->
    <div v-if="showLocationPicker" class="location-picker-overlay" @click="showLocationPicker = false">
      <div class="location-picker" @click.stop>
        <div class="picker-header">
          <h3>选择活动地点</h3>
          <button class="close-btn" @click="showLocationPicker = false">×</button>
        </div>
        
        <div class="picker-content">
          <div class="search-box">
            <input
              v-model="locationSearch"
              type="text"
              placeholder="搜索地点..."
              class="search-input"
            />
          </div>
          
          <div class="location-list">
            <div
              v-for="building in filteredLocations"
              :key="building.key"
              class="location-item"
              @click="handleLocationSelect(building)"
            >
              <div class="location-icon">📍</div>
              <div class="location-info">
                <div class="location-name">{{ building.name }}</div>
                <div class="location-address">{{ building.address }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showFailToast } from 'vant'
import { useActivityStore } from '@/stores/activity'
import { createActivity } from '@/api/activity'
import { campusBuildings } from '@/config/map.js'

const router = useRouter()
const activityStore = useActivityStore()

// 响应式数据
const form = reactive({
  title: '',
  category: '',
  description: '',
  maxParticipants: 10,
  startTime: '',
  endTime: '',
  location: null,
  requiresApproval: true
})

const errors = reactive({})
const submitting = ref(false)
const saving = ref(false)
const showLocationPicker = ref(false)
const locationSearch = ref('')

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
         form.location
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
const validateForm = () => {
  const newErrors = {}
  
  if (!form.title.trim()) {
    newErrors.title = '请输入活动标题'
  } else if (form.title.length < 2) {
    newErrors.title = '标题至少2个字符'
  }
  
  if (!form.category) {
    newErrors.category = '请选择活动分类'
  }
  
  if (!form.description.trim()) {
    newErrors.description = '请输入活动描述'
  } else if (form.description.length < 5) {
    newErrors.description = '描述至少5个字符'
  }
  
  if (!form.startTime) {
    newErrors.startTime = '请选择开始时间'
  }
  
  if (!form.endTime) {
    newErrors.endTime = '请选择结束时间'
  } else if (form.startTime && new Date(form.endTime) <= new Date(form.startTime)) {
    newErrors.endTime = '结束时间必须晚于开始时间'
  }
  
  if (!form.location) {
    newErrors.location = '请选择活动地点'
  }
  
  Object.assign(errors, newErrors)
  return Object.keys(newErrors).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  submitting.value = true
  
  try {
    // 计算报名时间：从现在开始到活动开始前1小时
    const now = new Date()
    const startTime = new Date(form.startTime)
    const enrollEndTime = new Date(startTime.getTime() - 60 * 60 * 1000) // 活动开始前1小时
    
    const activityData = {
      title: form.title,
      category: form.category,
      description: form.description,
      startTime: form.startTime,
      endTime: form.endTime,
      enrollStartTime: now.toISOString(), // 报名开始时间为现在
      enrollEndTime: enrollEndTime.toISOString(), // 报名结束时间为活动开始前1小时
      location: {
        name: form.location?.name || '',
        address: form.location?.address || ''
      },
      coords: form.location?.coords || null,
      maxParticipants: form.maxParticipants,
      tags: form.tags || [],
      coverImage: form.coverImage || '',
      status: 'recruiting'
    }
    
    console.log('准备创建活动，数据:', activityData)
    
    // 使用带验证的API创建活动
    const response = await validatedApi.createActivity(activityData)
    
    if (response.success) {
      showToast('活动创建成功！')
      localStorage.removeItem('activity_draft')
      
      // 先刷新活动列表数据，确保新活动被添加到store中
      console.log('🔄 创建活动成功后，立即刷新活动列表数据')
      try {
        // 等待一小段时间确保数据已写入localStorage
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // 强制重新从localStorage加载数据
        await activityStore.loadActivities()
        console.log('✅ 活动列表数据已刷新，当前活动数量:', activityStore.activities.length)
        
        // 验证新活动是否已添加
        const newActivityExists = activityStore.activities.some(a => 
          a.id === response.data.id || a.title === activityData.title
        )
        
        if (!newActivityExists) {
          console.warn('⚠️ 新活动未在列表中找到，尝试手动添加')
          // 手动添加新活动到store，确保使用正确的localStorage key
          const manualActivity = {
            ...response.data,
            locationName: response.data.location?.name || response.data.location || '',
            isEnrolled: false,
            isApproved: false,
            isCreator: true,
            distance: 0,
            participants: [],
            currentParticipants: response.data.currentParticipants || 1
          }
          activityStore.activities.unshift(manualActivity)
          // 确保使用正确的localStorage key 'campus_activities'
          localStorage.setItem('campus_activities', JSON.stringify(activityStore.activities))
          console.log('✅ 手动添加活动成功，已保存到campus_activities')
        }
      } catch (error) {
        console.error('刷新活动列表失败:', error)
      }
      
      // 数据刷新完成后再跳转页面
      router.push('/activities')
    } else {
      throw new Error(response.message || '创建活动失败')
    }
  } catch (error) {
    console.error('创建活动失败:', error)
    showFailToast(error.message || '创建活动失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const saveDraft = async () => {
  saving.value = true
  try {
    localStorage.setItem('activity_draft', JSON.stringify(form))
    alert('草稿保存成功')
  } catch (error) {
    console.error('保存草稿失败:', error)
  } finally {
    saving.value = false
  }
}

const handleBack = () => {
  if (form.title || form.description) {
    if (confirm('确定要离开吗？未保存的内容将会丢失。')) {
      router.back()
    }
  } else {
    router.back()
  }
}

const selectLocation = () => {
  showLocationPicker.value = true
}

const handleLocationSelect = (location) => {
  form.location = location
  showLocationPicker.value = false
}

const decreaseParticipants = () => {
  if (form.maxParticipants > 2) {
    form.maxParticipants--
  }
}

const increaseParticipants = () => {
  if (form.maxParticipants < 50) {
    form.maxParticipants++
  }
}

// 加载草稿
const loadDraft = () => {
  const draft = localStorage.getItem('activity_draft')
  if (draft) {
    Object.assign(form, JSON.parse(draft))
  }
}

// 设置默认时间
const setDefaultTimes = () => {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  form.startTime = tomorrow.toISOString().slice(0, 16)
  
  const endTime = new Date(tomorrow)
  endTime.setHours(endTime.getHours() + 2)
  form.endTime = endTime.toISOString().slice(0, 16)
}

// 初始化
onMounted(() => {
  loadDraft()
  if (!form.startTime) {
    setDefaultTimes()
  }
})
</script>

<style scoped>
.create-activity {
  min-height: 100vh;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  margin-right: 12px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  text-align: center;
}

.save-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 16px;
  background: white;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.save-btn:hover:not(:disabled) {
  border-color: #1890ff;
  color: #1890ff;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-container {
  padding: 16px;
  padding-bottom: 80px;
  min-height: 100vh;
}

.form-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: #333;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.form-group {
  margin-bottom: 24px;
  position: relative;
}

.form-group.error .form-input,
.form-group.error .form-textarea,
.form-group.error .location-selector {
  border-color: #ff4d4f;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 16px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
  box-sizing: border-box;
  background: #fff;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
  line-height: 1.5;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.error-message {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 8px;
  display: block;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.category-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  background: #fafafa;
}

.category-option.active {
  border-color: #1890ff;
  background: #e6f7ff;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.category-option:hover {
  border-color: #1890ff;
  transform: translateY(-1px);
}

.radio-input {
  display: none;
}

.category-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.category-label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.number-input-group {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 200px;
}

.number-btn {
  width: 44px;
  height: 44px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background: white;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.number-btn:hover:not(:disabled) {
  border-color: #1890ff;
  color: #1890ff;
  background: #f0f8ff;
}

.number-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f5;
}

.number-input {
  width: 80px;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
}

.location-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.3s;
  background: white;
}

.location-selector:hover {
  border-color: #1890ff;
  background: #f0f8ff;
}

.location-text {
  color: #333;
  font-size: 16px;
  font-weight: 500;
}

.location-placeholder {
  color: #999;
  font-size: 16px;
}

.location-icon {
  font-size: 20px;
}

.map-preview {
  margin-top: 16px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  text-align: center;
  border: 1px solid #e8e8e8;
}

.map-placeholder span {
  font-size: 48px;
  margin-bottom: 12px;
  display: block;
}

.map-placeholder p {
  margin: 8px 0;
  color: #333;
  font-size: 16px;
}

.map-address {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toggle-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #fafafa;
  border-radius: 12px;
}

.toggle-label {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

/* 开关样式 */
.switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
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
  border-radius: 28px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #1890ff;
}

input:checked + .slider:before {
  transform: translateX(24px);
}

.form-actions {
  position: fixed;
  bottom: 60px;
  left: 0;
  right: 0;
  background: white;
  padding: 20px 16px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  gap: 16px;
  z-index: 10000;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.btn {
  flex: 1;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.secondary {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #dcdfe6;
}

.btn.secondary:hover:not(:disabled) {
  background: #e8e8e8;
  border-color: #c0c4cc;
}

.btn.primary {
  background: #1890ff;
  color: white;
}

.btn.primary:hover:not(:disabled) {
  background: #40a9ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

/* 地点选择器样式 */
.location-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.location-picker {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e8e8e8;
  background: #fafafa;
}

.picker-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s;
}

.close-btn:hover {
  background: #f0f0f0;
}

.picker-content {
  padding: 20px;
}

.search-box {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 16px;
  border: 1px solid #dcdfe6;
  border-radius: 12px;
  font-size: 16px;
  background: #f8f9fa;
}

.search-input:focus {
  outline: none;
  border-color: #1890ff;
  background: white;
}

.location-list {
  max-height: 400px;
  overflow-y: auto;
}

.location-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
}

.location-item:hover {
  border-color: #1890ff;
  background: #f0f8ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.location-icon {
  font-size: 24px;
  margin-right: 16px;
}

.location-info {
  flex: 1;
}

.location-name {
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
  font-size: 16px;
}

.location-address {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-container {
    padding: 12px;
    padding-bottom: 70px;
  }
  
  .form-section {
    padding: 16px;
    margin-bottom: 12px;
  }
  
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  
  .form-actions {
    bottom: 60px;
    padding: 12px 16px;
    z-index: 10000;
  }
  
  .btn {
    padding: 14px;
    font-size: 15px;
  }
}
</style>