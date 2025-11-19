<!-- @/views/profile/EditProfile.vue -->
<template>
  <div class="edit-profile-view">
    <van-nav-bar 
      title="编辑资料" 
      left-text="返回" 
      right-text="保存" 
      left-arrow 
      @click-left="handleBack" 
      @click-right="handleSave"
      :right-disabled="!canSave || loading"
      fixed 
      placeholder 
    />
    
    <!-- 头像编辑区域 -->
    <div class="avatar-section">
      <div class="avatar-container" @click="handleAvatarUpload">
        <img :src="form.avatar || defaultAvatar" alt="用户头像" class="avatar">
        <div class="avatar-overlay">
          <van-icon name="photograph" size="24" color="white" />
          <span class="upload-text">更换头像</span>
        </div>
      </div>
      <p class="avatar-hint">点击头像可更换</p>
      <input 
        ref="avatarInput" 
        type="file" 
        accept="image/*" 
        style="display: none" 
        @change="onAvatarChange"
      >
    </div>

    <!-- 表单区域 -->
    <div class="form-section">
      <van-form @submit="handleSave" ref="profileForm">
        <van-cell-group inset>
          <!-- 真实姓名 -->
          <van-field
            v-model="form.realName"
            name="realName"
            label="真实姓名"
            placeholder="请输入真实姓名"
            :rules="[{ required: true, message: '请输入真实姓名' }]"
          />
          
          <!-- 学号 -->
          <van-field
            v-model="form.studentId"
            name="studentId"
            label="学号"
            placeholder="请输入学号"
            :disabled="true"
            :rules="[{ required: true, message: '请输入学号' }]"
          />
          
          <!-- 院系 -->
          <van-field
            v-model="form.department"
            name="department"
            label="院系"
            placeholder="请输入院系名称"
            :rules="[{ required: true, message: '请输入院系名称' }]"
          />
          
          <!-- 专业 -->
          <van-field
            v-model="form.major"
            name="major"
            label="专业"
            placeholder="请输入专业名称"
          />
          
          <!-- 班级 -->
          <van-field
            v-model="form.className"
            name="className"
            label="班级"
            placeholder="请输入班级"
          />
          
          <!-- 手机号 -->
          <van-field
            v-model="form.phone"
            name="phone"
            label="手机号"
            placeholder="请输入手机号"
            :rules="[{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]"
          />
          
          <!-- 简介 -->
          <van-field
            v-model="form.bio"
            name="bio"
            label="个人简介"
            type="textarea"
            placeholder="请输入个人简介"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </van-cell-group>
      </van-form>
    </div>
    
    <!-- 加载提示 -->
    <van-overlay :show="loading" z-index="999">
      <div class="loading-wrapper">
        <van-loading type="spinner" color="#1989fa" />
        <p class="loading-text">保存中...</p>
      </div>
    </van-overlay>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog, uploadFile, showFailToast } from 'vant'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/auth'
import { getUserInfo, updateUserInfo, uploadAvatar } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()
const avatarInput = ref(null)
const profileForm = ref(null)
const loading = ref(false)

// 使用与ProfileView相同的默认头像
const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiNlMWUxZTEiLz4KPHBhdGggZD0iTTQwIDQ0QzQ0LjQxODMgNDQgNDggNDAuNDE4MyA0OCAzNkM0OCAzMS41ODE3IDQ0LjQxODMgMjggNDAgMjhDMzUuNTgxNyAyOCAzMiAzMS41ODE3IDMyIDM2QzMyIDQwLjQxODMgMzUuNTgxNyA0NCA0MCA0NFoiIGZpbGw9IiM5OTk5OTkiLz4KPHBhdGggZD0iTTU2IDUyQzU2IDU4LjYyNzQgNTAuNjI3NCA2NCA0NCA2NEgzNkMyOS4zNzI2IDY0IDI0IDU4LjYyNzQgMjQgNTJWMjRINTZWNTRaIiBmaWxsPSIjOTk5OTk5Ii8+Cjwvc3ZnPgo='

// 表单数据
const form = reactive({
  realName: '',
  studentId: '',
  department: '',
  major: '',
  className: '',
  phone: '',
  bio: '',
  avatar: ''
})

// 原始数据，用于比较是否有修改
const originalForm = reactive({})

// 计算属性：是否可以保存
const canSave = computed(() => {
  // 检查是否有任何字段被修改
  return Object.keys(form).some(key => {
    // 排除avatar字段单独检查
    if (key === 'avatar') return false
    return form[key] !== originalForm[key]
  })
})

// 处理头像上传点击
const handleAvatarUpload = () => {
  if (avatarInput.value) {
    avatarInput.value.click()
  }
}

// 处理头像文件选择
const onAvatarChange = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // 检查文件类型
  if (!file.type.match('image.*')) {
    showToast('请选择图片文件')
    event.target.value = ''
    return
  }
  
  // 检查文件大小（限制5MB）
  if (file.size > 5 * 1024 * 1024) {
    showToast('图片大小不能超过5MB')
    event.target.value = ''
    return
  }
  
  // 读取图片文件并显示预览
  const reader = new FileReader()
  reader.onload = (e) => {
    form.avatar = e.target.result
  }
  reader.readAsDataURL(file)
  
  // 清空input，允许再次选择同一文件
  setTimeout(() => {
    event.target.value = ''
  }, 100)
}

// 加载用户数据
const loadUserData = async () => {
  try {
    // 从API获取用户信息
    const response = await getUserInfo()
    if (response.success && response.data) {
      // 更新本地store
      userStore.setUserInfo(response.data)
      
      // 填充表单数据
      form.realName = response.data.realName || ''
      form.studentId = response.data.studentId || ''
      form.department = response.data.department || ''
      form.major = response.data.major || ''
      form.className = response.data.className || ''
      form.phone = response.data.phone || ''
      form.bio = response.data.bio || ''
      form.avatar = response.data.avatar || ''
      
      // 保存原始数据用于比较
      Object.assign(originalForm, { ...form })
      console.log('✅ 用户数据已加载')
    } else {
      throw new Error(response.message || '获取用户信息失败')
    }
  } catch (error) {
    console.error('加载用户数据失败:', error)
    showFailToast('加载用户数据失败')
  }
}

// 保存用户资料
const handleSave = async () => {
  try {
    // 验证表单
    if (profileForm.value) {
      const valid = await profileForm.value.validate()
      if (!valid) return
    }
    
    loading.value = true
    console.log('💾 开始保存用户资料:', { ...form })
    
    // 准备更新数据
    const updateData = {
      realName: form.realName.trim(),
      department: form.department.trim(),
      major: form.major.trim(),
      className: form.className.trim(),
      phone: form.phone.trim(),
      bio: form.bio.trim()
    }
    
    // 如果头像有变化，先上传头像
    if (form.avatar && form.avatar !== originalForm.avatar) {
      try {
        // 检查是否是文件对象（新上传的头像）
        if (form.avatar instanceof File) {
          const avatarResponse = await uploadAvatar(form.avatar)
          if (avatarResponse.success && avatarResponse.data) {
            updateData.avatar = avatarResponse.data.avatarUrl
          } else {
            throw new Error(avatarResponse.message || '头像上传失败')
          }
        } else if (form.avatar.startsWith('data:image/')) {
          // 如果是base64，需要转换为文件对象
          const response = await fetch(form.avatar)
          const blob = await response.blob()
          const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
          const avatarResponse = await uploadAvatar(file)
          if (avatarResponse.success && avatarResponse.data) {
            updateData.avatar = avatarResponse.data.avatarUrl
          } else {
            throw new Error(avatarResponse.message || '头像上传失败')
          }
        } else {
          // 如果是URL，直接使用
          updateData.avatar = form.avatar
        }
      } catch (error) {
        console.error('头像上传失败:', error)
        throw new Error('头像上传失败: ' + error.message)
      }
    }
    
    // 调用API更新用户信息
    const response = await updateUserInfo(updateData)
    
    if (!response.success) {
      throw new Error(response.message || '更新用户信息失败')
    }
    
    // 更新本地userStore中的用户信息
    await userStore.fetchUserInfo()
    
    // 同时更新authStore中的用户信息
    if (authStore.user) {
      authStore.setAuth(authStore.token, userStore.userInfo)
    }
    
    console.log('✅ 用户资料保存成功')
    showToast('保存成功')
    
    // 更新原始数据
    Object.assign(originalForm, { ...form })
    
    // 返回上一页
    handleBack()
  } catch (error) {
    console.error('保存用户资料失败:', error)
    showFailToast(error.message || '保存失败，请重试')
  } finally {
    loading.value = false
  }
}

// 返回上一页
const handleBack = () => {
  // 如果有未保存的修改，提示用户
  if (canSave.value || form.avatar !== originalForm.avatar) {
    showConfirmDialog({
      title: '确认离开',
      message: '您有未保存的修改，确定要离开吗？',
    }).then(() => {
      // 用户确认离开
      router.back()
    }).catch(() => {
      // 用户取消离开
      console.log('用户取消离开编辑页面')
    })
  } else {
    // 没有修改，直接返回
    router.back()
  }
}

// 初始化加载数据
onMounted(() => {
  console.log('🔄 初始化编辑资料页面')
  loadUserData()
})
</script>

<style scoped>
.edit-profile-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding-top: 46px; /* 为固定导航栏留出空间 */
  padding-bottom: 30px;
}

/* 头像编辑区域 */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0;
  background: white;
  margin-bottom: 12px;
}

.avatar-container {
  position: relative;
  width: 100px;
  height: 100px;
  margin-bottom: 12px;
  cursor: pointer;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e5e5e5;
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.upload-text {
  color: white;
  font-size: 12px;
  margin-top: 4px;
}

.avatar-hint {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* 表单区域 */
.form-section {
  background: white;
  padding-bottom: 20px;
}

/* 加载提示样式 */
.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
}

.loading-text {
  margin-top: 10px;
  color: #666;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .avatar-section {
    padding: 20px 0;
  }
  
  .avatar-container {
    width: 80px;
    height: 80px;
  }
}
</style>