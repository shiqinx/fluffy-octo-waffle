<template>
  <div class="avatar-upload">
    <div class="avatar-container" @click="triggerUpload">
      <img :src="avatarUrl" alt="用户头像" class="avatar-image" />
      <div class="avatar-overlay">
        <div class="upload-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M12 5L5 12M12 5L19 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>更换头像</span>
        </div>
      </div>
    </div>
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="file-input"
      @change="handleFileChange"
    />
    
    <div v-if="uploading" class="uploading-indicator">
      <div class="loading-spinner"></div>
      <span>{{ uploadProgress }}%</span>
    </div>
    
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { showToast } from 'vant'

const props = defineProps({
  modelValue: {
    type: String,
    default: '/default-avatar.png'
  }
})

const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const avatarUrl = ref(props.modelValue)
const uploading = ref(false)
const uploadProgress = ref(0)
const errorMessage = ref('')

// 监听 prop 变化
watch(() => props.modelValue, (newValue) => {
  avatarUrl.value = newValue
})

// 触发文件选择
const triggerUpload = () => {
  if (!uploading.value) {
    fileInput.value?.click()
  }
}

// 处理文件选择
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // 检查文件大小（限制为 5MB）
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    errorMessage.value = '文件大小不能超过 5MB'
    showToast(errorMessage.value)
    // 清空文件输入，允许重新选择
    event.target.value = ''
    return
  }
  
  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    errorMessage.value = '请选择图片文件'
    showToast(errorMessage.value)
    event.target.value = ''
    return
  }
  
  // 显示预览
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarUrl.value = e.target.result
  }
  reader.readAsDataURL(file)
  
  // 触发上传
  uploadAvatar(file)
  
  // 清空文件输入
  event.target.value = ''
}

// 上传头像
const uploadAvatar = async (file) => {
  errorMessage.value = ''
  uploading.value = true
  uploadProgress.value = 0
  
  try {
    // 模拟上传进度
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += Math.floor(Math.random() * 10)
      }
    }, 200)
    
    // 导入上传函数
    const { uploadAvatar } = await import('@/api/user')
    const response = await uploadAvatar(file)
    
    clearInterval(progressInterval)
    uploadProgress.value = 100
    
    // 更新头像 URL
    if (response.success && response.data?.avatar) {
      avatarUrl.value = response.data.avatar
      emit('update:modelValue', response.data.avatar)
      showToast('头像上传成功')
    }
    
  } catch (error) {
    console.error('头像上传失败:', error)
    errorMessage.value = error?.message || '头像上传失败'
    showToast(errorMessage.value)
    
    // 恢复原头像
    avatarUrl.value = props.modelValue
  } finally {
    // 延迟隐藏上传指示器，让用户看到 100% 进度
    setTimeout(() => {
      uploading.value = false
      uploadProgress.value = 0
    }, 500)
  }
}
</script>

<style scoped>
.avatar-upload {
  position: relative;
  display: inline-block;
}

.avatar-container {
  position: relative;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
  transition: transform 0.2s ease;
  width: 120px;
  height: 120px;
}

.avatar-container:hover {
  transform: scale(1.05);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.upload-icon {
  color: white;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.upload-icon span {
  font-size: 12px;
  white-space: nowrap;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: -1;
}

.uploading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  z-index: 10;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.error-message {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  color: #ee0a24;
  font-size: 12px;
  white-space: nowrap;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>