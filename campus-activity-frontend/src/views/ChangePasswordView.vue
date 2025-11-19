<template>
  <div class="change-password-view">
    <!-- 顶部导航 -->
    <div class="header">
      <button class="back-btn" @click="$router.back()">‹</button>
      <h1 class="title">修改密码</h1>
      <div class="header-placeholder"></div>
    </div>
    


    <div class="content">
      <!-- 表单区域 -->
      <div class="form-section">
        <form @submit.prevent="handleSubmit">
          <!-- 当前密码 -->
          <div class="form-group">
            <label class="form-label">当前密码</label>
            <div class="input-wrapper">
              <input
                v-model="form.currentPassword"
                :type="showCurrentPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="请输入当前密码"
                :class="{ error: errors.currentPassword }"
              />
              <button
                type="button"
                class="toggle-password"
                @click="togglePasswordVisibility('current')"
              >
                {{ showCurrentPassword ? '👁️' : '🙈' }}
              </button>
            </div>
            <div v-if="errors.currentPassword" class="error-message">
              {{ errors.currentPassword }}
            </div>
          </div>

          <!-- 新密码 -->
          <div class="form-group">
            <label class="form-label">新密码</label>
            <div class="input-wrapper">
              <input
                v-model="form.newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="请输入新密码（6-20位字母数字组合）"
                :class="{ error: errors.newPassword }"
                @input="validatePassword"
              />
              <button
                type="button"
                class="toggle-password"
                @click="togglePasswordVisibility('new')"
              >
                {{ showNewPassword ? '👁️' : '🙈' }}
              </button>
            </div>
            <div v-if="errors.newPassword" class="error-message">
              {{ errors.newPassword }}
            </div>
            <!-- 密码强度指示器 -->
            <div v-if="form.newPassword" class="password-strength">
              <div class="strength-label">密码强度：</div>
              <div class="strength-bar">
                <div 
                  class="strength-fill" 
                  :class="passwordStrength.level"
                  :style="{ width: passwordStrength.width }"
                ></div>
              </div>
              <div class="strength-text" :class="passwordStrength.level">
                {{ passwordStrength.text }}
              </div>
            </div>
          </div>

          <!-- 确认新密码 -->
          <div class="form-group">
            <label class="form-label">确认新密码</label>
            <div class="input-wrapper">
              <input
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="请再次输入新密码"
                :class="{ error: errors.confirmPassword }"
                @input="validateConfirmPassword"
              />
              <button
                type="button"
                class="toggle-password"
                @click="togglePasswordVisibility('confirm')"
              >
                {{ showConfirmPassword ? '👁️' : '🙈' }}
              </button>
            </div>
            <div v-if="errors.confirmPassword" class="error-message">
              {{ errors.confirmPassword }}
            </div>
          </div>

          <!-- 提交按钮 -->
          <button 
            type="submit" 
            class="submit-btn"
            :disabled="isSubmitting || !isFormValid"
            :class="{ loading: isSubmitting }"
          >
            <span v-if="isSubmitting">修改中...</span>
            <span v-else>确认修改</span>
          </button>
        </form>
      </div>

      <!-- 安全提示 -->
      <div class="security-tips">
        <h3 class="tips-title">🔒 安全提示</h3>
        <ul class="tips-list">
          <li>密码长度建议6-20位字符</li>
          <li>建议使用字母、数字和特殊字符的组合</li>
          <li>不要使用过于简单的密码如生日、手机号等</li>
          <li>建议定期更换密码以保障账户安全</li>
        </ul>
      </div>
    </div>

    <!-- 成功提示弹窗 -->
    <div v-if="showSuccessModal" class="modal-overlay" @click="closeSuccessModal">
      <div class="modal-content success-modal" @click.stop>
        <div class="success-icon">✅</div>
        <h3 class="success-title">密码修改成功</h3>
        <p class="success-message">您的密码已成功更新</p>
        <button class="success-btn" @click="closeSuccessModal">确定</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()

// 表单数据
const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 错误信息
const errors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码可见性控制
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// 提交状态
const isSubmitting = ref(false)
const showSuccessModal = ref(false)

// 密码强度计算
const passwordStrength = computed(() => {
  const password = form.newPassword
  if (!password) return { level: '', width: '0%', text: '' }
  
  let score = 0
  
  // 长度检查
  if (password.length >= 6) score += 1
  if (password.length >= 10) score += 1
  
  // 字符类型检查
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password)) score += 1
  
  if (score <= 2) {
    return { level: 'weak', width: '33%', text: '弱' }
  } else if (score <= 4) {
    return { level: 'medium', width: '66%', text: '中等' }
  } else {
    return { level: 'strong', width: '100%', text: '强' }
  }
})

// 表单验证
const isFormValid = computed(() => {
  return form.currentPassword && 
         form.newPassword && 
         form.confirmPassword &&
         !errors.currentPassword &&
         !errors.newPassword &&
         !errors.confirmPassword &&
         form.newPassword === form.confirmPassword
})

// 切换密码可见性
const togglePasswordVisibility = (field) => {
  switch (field) {
    case 'current':
      showCurrentPassword.value = !showCurrentPassword.value
      break
    case 'new':
      showNewPassword.value = !showNewPassword.value
      break
    case 'confirm':
      showConfirmPassword.value = !showConfirmPassword.value
      break
  }
}

// 验证密码
const validatePassword = () => {
  const password = form.newPassword
  
  if (!password) {
    errors.newPassword = '请输入新密码'
    return
  }
  
  if (password.length < 6 || password.length > 20) {
    errors.newPassword = '密码长度应为6-20位字符'
    return
  }
  
  if (!/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/.test(password)) {
    errors.newPassword = '密码必须包含字母和数字'
    return
  }
  
  if (password === form.currentPassword) {
    errors.newPassword = '新密码不能与当前密码相同'
    return
  }
  
  errors.newPassword = ''
  
  // 如果确认密码已填写，重新验证确认密码
  if (form.confirmPassword) {
    validateConfirmPassword()
  }
}

// 验证确认密码
const validateConfirmPassword = () => {
  if (!form.confirmPassword) {
    errors.confirmPassword = '请确认新密码'
    return
  }
  
  if (form.confirmPassword !== form.newPassword) {
    errors.confirmPassword = '两次输入的密码不一致'
    return
  }
  
  errors.confirmPassword = ''
}

// 验证当前密码
const validateCurrentPassword = () => {
  if (!form.currentPassword) {
    errors.currentPassword = '请输入当前密码'
    return
  }
  
  errors.currentPassword = ''
}

// 提交表单
const handleSubmit = async () => {
  // 验证所有字段
  validateCurrentPassword()
  validatePassword()
  validateConfirmPassword()
  
  // 如果有错误，停止提交
  if (!isFormValid.value) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    // 调用实际的API
    const response = await authStore.changePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword
    })
    
    console.log('密码修改成功:', response)
    
    // 显示成功提示
    showSuccessModal.value = true
    
  } catch (error) {
    console.error('修改密码失败:', error)
    
    // 根据错误类型显示相应的错误信息
    if (error.message?.includes('当前密码不正确')) {
      errors.currentPassword = '当前密码不正确'
    } else if (error.message?.includes('网络')) {
      alert('网络错误，请稍后重试')
    } else {
      alert('修改密码失败，请稍后重试')
    }
  } finally {
    isSubmitting.value = false
  }
}

// 关闭成功弹窗
const closeSuccessModal = () => {
  showSuccessModal.value = false
  // 清空表单
  Object.assign(form, {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  // 返回上一页
  router.back()
}

// 检查用户登录状态
onMounted(() => {
  console.log('修改密码页面 - 认证检查开始')
  console.log('authStore.isAuthenticated:', authStore.isAuthenticated)
  console.log('authStore.token:', authStore.token)
  console.log('authStore.user:', authStore.user)
  console.log('authStore.loginTime:', authStore.loginTime)
  
  // 检查用户是否已登录
  if (!authStore.isAuthenticated) {
    console.log('用户未登录，跳转到登录页面')
    router.push('/login')
    return
  } else {
    console.log('用户已登录，可以访问修改密码页面')
  }
})
</script>

<style scoped>
.change-password-view {
  min-height: 100vh;
  background: #f5f5f5;
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

.content {
  padding: 20px 16px;
}

.form-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 12px 45px 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.form-input.error {
  border-color: #ff4d4f;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  color: #666;
  transition: color 0.3s ease;
}

.toggle-password:hover {
  color: #1890ff;
}

.error-message {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
  line-height: 1.4;
}

.password-strength {
  margin-top: 8px;
}

.strength-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.strength-bar {
  width: 100%;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.strength-fill.weak {
  background: #ff4d4f;
}

.strength-fill.medium {
  background: #faad14;
}

.strength-fill.strong {
  background: #52c41a;
}

.strength-text {
  font-size: 12px;
  font-weight: 500;
}

.strength-text.weak {
  color: #ff4d4f;
}

.strength-text.medium {
  color: #faad14;
}

.strength-text.strong {
  color: #52c41a;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
}

.submit-btn:hover:not(:disabled) {
  background: #40a9ff;
}

.submit-btn:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}

.submit-btn.loading {
  background: #d9d9d9;
  cursor: not-allowed;
}

.security-tips {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.tips-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.tips-list {
  margin: 0;
  padding-left: 16px;
}

.tips-list li {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 6px;
}

/* 弹窗样式 */
.modal-overlay {
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
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 32px 24px;
  margin: 20px;
  max-width: 320px;
  width: 100%;
  text-align: center;
}

.success-modal {
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.success-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.success-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.success-message {
  font-size: 14px;
  color: #666;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.success-btn {
  width: 100%;
  padding: 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
}

.success-btn:hover {
  background: #40a9ff;
}

/* 适配深色模式 */
@media (max-width: 480px) {
  .form-section {
    padding: 20px 16px;
  }
  
  .security-tips {
    padding: 16px;
  }
  
  .modal-content {
    padding: 24px 20px;
  }
}
</style>