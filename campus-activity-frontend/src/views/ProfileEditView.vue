<!-- @/views/ProfileEditView.vue -->
<template>
  <!-- 使用与ProfileView.vue一致的命名风格 -->
  <div class="profile-edit-view">
    <van-nav-bar
      title="编辑资料"
      left-text="取消"
      right-text="保存"
      @click-left="handleCancel"
      @click-right="handleSave"
    />

    <!-- 头像上传区域 -->
    <div class="avatar-section">
      <CustomAvatar
        :src="formData.avatar"
        :placeholder="defaultAvatar"
        :size="100"
        :editable="true"
        @change="handleAvatarChange"
      />
    </div>

    <!-- 表单区域 -->
    <div class="form-section">
      <div class="form-item">
        <div class="form-label">真实姓名</div>
        <CustomInput
          v-model="formData.realName"
          placeholder="请输入真实姓名"
          maxlength="20"
          icon="user-o"
        />
      </div>

      <div class="form-item">
        <div class="form-label">学号</div>
        <van-field
          v-model="formData.studentId"
          placeholder="请输入学号"
          maxlength="20"
          readonly
        />
        <div class="form-hint">学号不可修改</div>
      </div>

      <div class="form-item">
        <div class="form-label">院系专业</div>
        <CustomInput
          v-model="formData.department"
          placeholder="请输入院系专业"
          maxlength="50"
          icon="shop-o"
        />
      </div>

      <div class="form-item">
        <div class="form-label">班级</div>
        <CustomInput
          v-model="formData.class"
          placeholder="请输入班级"
          maxlength="20"
          icon="friends-o"
        />
      </div>

      <div class="form-item">
        <div class="form-label">联系电话</div>
        <CustomInput
          v-model="formData.phone"
          type="tel"
          placeholder="请输入联系电话"
          maxlength="11"
          pattern="[0-9]*"
          icon="phone-o"
        />
      </div>

      <div class="form-item">
        <div class="form-label">电子邮箱</div>
        <CustomInput
          v-model="formData.email"
          type="email"
          placeholder="请输入电子邮箱"
          maxlength="50"
          icon="mail-o"
        />
      </div>

      <div class="form-item">
        <div class="form-label">个人简介</div>
        <CustomInput
          v-model="formData.bio"
          type="textarea"
          placeholder="请输入个人简介"
          maxlength="200"
          :rows="4"
          show-word-limit
          icon="edit-o"
        />
      </div>

      <div class="form-item">
        <div class="form-label">兴趣标签</div>
        <div class="tags-container">
          <div
            v-for="tag in formData.tags"
            :key="tag"
            class="tag-item"
          >
            <span>{{ tag }}</span>
            <van-icon
              name="close"
              size="14"
              class="tag-close"
              @click.stop="removeTag(tag)"
            />
          </div>
          <div class="add-tag" @click="showTagDialog = true">
            <van-icon name="plus" size="16" />
            <span>添加标签</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 标签选择弹窗 -->
    <van-popup
      v-model:show="showTagDialog"
      position="bottom"
      round
      :style="{ height: '70%' }"
    >
      <div class="popup-header">
        <h3>选择兴趣标签</h3>
        <van-icon name="close" @click="showTagDialog = false" />
      </div>
      <div class="popup-content">
        <div class="popular-tags">
          <div
            v-for="tag in popularTags"
            :key="tag"
            class="tag-option"
            :class="{ selected: formData.tags.includes(tag) }"
            @click="toggleTag(tag)"
          >
            {{ tag }}
          </div>
        </div>
        <div class="custom-tag-section">
          <van-field
            v-model="newTag"
            placeholder="输入自定义标签"
            maxlength="8"
            show-word-limit
            :suffix="suffixIcon"
            @click-suffix="addCustomTag"
          />
        </div>
      </div>
      <div class="popup-footer">
        <van-button
          block
          type="primary"
          @click="confirmTags"
        >
          确定
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { showToast, showConfirmDialog, showLoadingToast, showFailToast } from 'vant'
import { updateUserInfo, uploadAvatar, updateUserTags } from '@/api/user'
import CustomAvatar from '@/components/Profile/CustomAvatar.vue'
import CustomButton from '@/components/Profile/CustomButton.vue'
import CustomInput from '@/components/Profile/CustomInput.vue'
import CustomSelect from '@/components/Profile/CustomSelect.vue'

const router = useRouter()
const userStore = useUserStore()
// avatarInput 已不再需要，CustomAvatar组件内部处理了文件选择逻辑
const showTagDialog = ref(false)
const newTag = ref('')

// 默认头像
const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiNlMWUxZTEiLz4KPHBhdGggZD0iTTQwIDQ0QzQ0LjQxODMgNDQgNDggNDAuNDE4MyA0OCAzNkM0OCAzMS41ODE3IDQ0LjQxODMgMjggNDAgMjhDMzUuNTgxNyAyOCAzMiAzMS41ODE3IDMyIDM2QzMyIDQwLjQxODMgMzUuNTgxNyA0NCA0MCA0NFoiIGZpbGw9IiM5OTk5OTkiLz4KPHBhdGggZD0iTTU2IDUyQzU2IDU4LjYyNzQgNTAuNjI3NCA2NCA0NCA2NEgzNkMyOS4zNzI2IDY0IDI0IDU4LjYyNzQgMjQgNTJWMjRINTZWNTRaIiBmaWxsPSIjOTk5OTk5Ii8+Cjwvc3ZnPgo='

// 表单数据
const formData = reactive({
  realName: '',
  studentId: '',
  department: '',
  class: '',
  phone: '',
  email: '',
  bio: '',
  avatar: '',
  tags: []
})

// 热门标签
const popularTags = [
  '运动', '音乐', '电影', '阅读', '摄影', '旅行',
  '美食', '编程', '设计', '艺术', '舞蹈', '科技',
  '创业', '公益', '游戏', '动漫', '历史', '外语'
]

// 计算属性：输入框后缀图标
const suffixIcon = computed(() => {
  return {
    name: 'plus',
    size: 16,
    color: '#1989fa',
  }
})

// 处理头像变更
const handleAvatarChange = (data) => {
  if (!data || !data.preview) return
  formData.avatar = data.preview
  // 注意：头像的实际上传会在保存时进行
}

// 添加自定义标签
const addCustomTag = () => {
  if (!newTag.value.trim()) {
    showToast('标签不能为空')
    return
  }
  if (formData.tags.includes(newTag.value.trim())) {
    showToast('该标签已存在')
    return
  }
  if (formData.tags.length >= 8) {
    showToast('最多添加8个标签')
    return
  }
  formData.tags.push(newTag.value.trim())
  newTag.value = ''
}

// 切换标签选择
const toggleTag = (tag) => {
  const index = formData.tags.indexOf(tag)
  if (index > -1) {
    formData.tags.splice(index, 1)
  } else {
    if (formData.tags.length >= 8) {
      showToast('最多添加8个标签')
      return
    }
    formData.tags.push(tag)
  }
}

// 移除标签
const removeTag = (tag) => {
  const index = formData.tags.indexOf(tag)
  if (index > -1) {
    formData.tags.splice(index, 1)
  }
}

// 确认标签选择
const confirmTags = () => {
  showTagDialog.value = false
}

// 处理取消
const handleCancel = () => {
  if (hasChanges()) {
    showConfirmDialog({
      title: '提示',
      message: '是否放弃编辑？未保存的修改将丢失。'
    }).then(() => {
      router.back()
    }).catch(() => {
      // 用户取消操作
    })
  } else {
    router.back()
  }
}

// 处理保存
const handleSave = async () => {
  // 表单验证
  if (!formData.realName.trim()) {
    showToast('请输入真实姓名')
    return
  }
  if (!formData.studentId.trim()) {
    showToast('请输入学号')
    return
  }
  if (!formData.department.trim()) {
    showToast('请输入院系专业')
    return
  }
  if (formData.phone && !/^1[3-9]\d{9}$/.test(formData.phone)) {
    showToast('请输入正确的手机号')
    return
  }
  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    showToast('请输入正确的邮箱地址')
    return
  }

  try {
    // 显示加载中提示
    showLoadingToast({
      message: '保存中...',
      forbidClick: true,
    })
    
    // 准备更新数据
    const updateData = {
      realName: formData.realName.trim(),
      department: formData.department.trim(),
      class: formData.class.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      bio: formData.bio.trim()
    }
    
    // 如果头像有变化，先上传头像
    if (formData.avatar && formData.avatar !== userStore.userInfo?.avatar) {
      try {
        // 检查是否是文件对象（新上传的头像）
        if (formData.avatar instanceof File) {
          const avatarResponse = await uploadAvatar(formData.avatar)
          if (avatarResponse.success && avatarResponse.data) {
            updateData.avatar = avatarResponse.data.avatarUrl
          } else {
            throw new Error(avatarResponse.message || '头像上传失败')
          }
        } else {
          // 如果是base64或URL，直接使用
          updateData.avatar = formData.avatar
        }
      } catch (error) {
        console.error('头像上传失败:', error)
        throw new Error('头像上传失败: ' + error.message)
      }
    }
    
    // 更新用户基本信息
    const response = await updateUserInfo(updateData)
    
    if (!response.success) {
      throw new Error(response.message || '更新用户信息失败')
    }
    
    // 更新用户标签
    if (JSON.stringify(formData.tags) !== JSON.stringify(userStore.userInfo?.tags || [])) {
      try {
        const tagsResponse = await updateUserTags(formData.tags)
        if (!tagsResponse.success) {
          console.warn('更新标签失败:', tagsResponse.message)
        }
      } catch (error) {
        console.warn('更新标签API调用失败:', error)
      }
    }
    
    showToast('保存成功')
    
    // 更新本地store中的用户信息
    await userStore.fetchUserInfo()
    
    router.back()
  } catch (error) {
    hideLoadingToast()
    console.error('保存失败:', error)
    showFailToast(error.message || '保存失败，请重试')
  }
}

// 检查是否有修改
const hasChanges = () => {
  const userInfo = userStore.userInfo || {}
  return (
    formData.realName !== userInfo.realName ||
    formData.department !== userInfo.department ||
    formData.class !== userInfo.class ||
    formData.phone !== userInfo.phone ||
    formData.email !== userInfo.email ||
    formData.bio !== userInfo.bio ||
    formData.avatar !== userInfo.avatar ||
    JSON.stringify(formData.tags) !== JSON.stringify(userInfo.tags || [])
  )
}

// 加载用户资料
const loadUserProfile = () => {
  const userInfo = userStore.userInfo || {}
  Object.assign(formData, {
    realName: userInfo.realName || '',
    studentId: userInfo.studentId || '',
    department: userInfo.department || '',
    class: userInfo.class || '',
    phone: userInfo.phone || '',
    email: userInfo.email || '',
    bio: userInfo.bio || '',
    avatar: userInfo.avatar || '',
    tags: userInfo.tags || []
  })
}

// 初始化
onMounted(() => {
  loadUserProfile()
})
</script>

<style scoped>
.profile-edit-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
}

/* 与ProfileView.vue保持一致的通用样式 */
.avatar-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid #f0f0f0;
  object-fit: cover;
}

.avatar-section {
  background: white;
  padding: 20px;
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s ease;
}

.avatar-section:hover {
  background: #fafafa;
}

.form-section {
  background: white;
  margin-top: 10px;
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.form-item {
  padding: 0 16px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s ease;
}

.form-item:hover {
  background-color: #fafafa;
}

.form-item:last-child {
  border-bottom: none;
}

.form-label {
  font-size: 14px;
  color: #666;
  margin: 12px 0 8px 0;
  font-weight: 500;
  transition: color 0.3s ease;
}

.form-item:hover .form-label {
  color: #333;
}

.form-hint {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  margin-bottom: 12px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 12px;
  gap: 8px;
}

.tag-item {
  display: flex;
  align-items: center;
  background: #f0f8ff;
  color: #1989fa;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 14px;
}

.tag-close {
  margin-left: 4px;
  cursor: pointer;
}

.add-tag {
  display: flex;
  align-items: center;
  color: #999;
  padding: 4px 10px;
  border: 1px dashed #ddd;
  border-radius: 16px;
  font-size: 14px;
  cursor: pointer;
}

.add-tag span {
  margin-left: 4px;
}

/* 弹窗样式增强 */
.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  background: #fff;
}

.popup-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.popup-content {
  padding: 16px;
  overflow-y: auto;
  max-height: calc(70vh - 120px);
  background: #fafafa;
}

.popular-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.tag-option {
  padding: 6px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #fff;
}

.tag-option:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-color: #1989fa;
}

.tag-option.selected {
  background: #1989fa;
  color: white;
  border-color: #1989fa;
}

.custom-tag-section {
  margin-top: 20px;
  background: #fff;
  padding: 12px;
  border-radius: 8px;
}

.popup-footer {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
  background: #fff;
}

/* 标签选择弹窗过渡动画 */
:deep(.van-popup--bottom) {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 标签输入框动画 */
:deep(.van-field__control) {
  transition: all 0.3s ease;
}

/* 全局过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 页面加载动画 */
.profile-edit-view {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>