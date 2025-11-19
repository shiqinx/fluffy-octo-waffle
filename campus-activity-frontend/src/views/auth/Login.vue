<!-- @/views/auth/Login.vue -->
<template>
  <div class="login-page gradient-bg">
    <div class="login-container">
      <!-- 头部 -->
      <div class="login-header">
        <div class="logo-placeholder">
          <van-icon name="friends-o" size="48" color="white" />
        </div>
        <h1 class="title">校园活动平台</h1>
        <p class="subtitle">基于位置的校园活动与组队平台</p>
      </div>

      <!-- 登录表单 -->
      <div class="login-form card">
        <van-form @submit="onSubmit" class="form">
          <van-cell-group inset>
            <!-- 学号输入框 -->
            <div class="custom-field">
              <div class="field-label">学号</div>
              <div class="input-wrapper">
                <input
                  v-model="form.studentId"
                  type="text"
                  class="custom-input"
                  placeholder="请输入学号"
                  @input="validateField('studentId')"
                />
                <div 
                  v-if="form.studentId" 
                  class="clear-icon" 
                  @click="clearStudentId"
                >
                  ×
                </div>
              </div>
            </div>
            
            <!-- 密码输入框 -->
            <div class="custom-field">
              <div class="field-label">密码</div>
              <div class="input-wrapper">
                <input
                  v-model="form.password"
                  type="password"
                  class="custom-input"
                  placeholder="请输入密码"
                  @input="validateField('password')"
                />
                <div 
                  v-if="form.password" 
                  class="clear-icon" 
                  @click="clearPassword"
                >
                  ×
                </div>
              </div>
            </div>
          </van-cell-group>

          <!-- 记住密码和忘记密码 -->
          <div class="login-options">
            <van-checkbox v-model="rememberPassword" shape="square">
              记住密码
            </van-checkbox>
            <a class="forgot-password" @click="onForgotPassword">
              忘记密码？
            </a>
          </div>

          <div class="submit-btn">
            <van-button 
              round 
              block 
              type="primary" 
              native-type="submit" 
              :loading="loading"
              size="large"
            >
              登录
            </van-button>
          </div>
        </van-form>
      </div>

      <!-- 注册链接 -->
      <div class="register-section">
        <span class="register-text">还没有账号？</span>
        <router-link to="/register" class="register-link">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  studentId: '',
  password: ''
})

const loading = ref(false)
const rememberPassword = ref(false)

// 清除学号
const clearStudentId = () => {
  form.value.studentId = ''
  console.log('清除学号成功')
}

// 清除密码
const clearPassword = () => {
  form.value.password = ''
  console.log('清除密码成功')
  // 如果清除了密码，自动取消记住密码
  if (rememberPassword.value) {
    rememberPassword.value = false
    localStorage.removeItem('rememberedLogin')
  }
}

// 简单的字段验证
const validateField = (fieldName) => {
  console.log(`${fieldName} 输入内容:`, form.value[fieldName])
}

// 从本地存储加载记住的密码
const loadRememberedPassword = () => {
  try {
    const remembered = localStorage.getItem('rememberedLogin')
    if (remembered) {
      const loginData = JSON.parse(remembered)
      form.value.studentId = loginData.studentId || ''
      form.value.password = loginData.password || ''
      rememberPassword.value = true
      console.log('✅ 已加载记住的登录信息')
    }
  } catch (error) {
    console.error('加载记住的密码失败:', error)
    localStorage.removeItem('rememberedLogin')
  }
}

// 保存记住的密码
const saveRememberedPassword = () => {
  if (rememberPassword.value && form.value.studentId && form.value.password) {
    const loginData = {
      studentId: form.value.studentId,
      password: form.value.password,
      timestamp: Date.now()
    }
    localStorage.setItem('rememberedLogin', JSON.stringify(loginData))
    console.log('💾 已保存记住的登录信息')
  } else {
    localStorage.removeItem('rememberedLogin')
    console.log('🗑️ 已清除记住的登录信息')
  }
}

const onSubmit = async () => {
  console.log('🔐 开始登录流程...')
  console.log('📝 表单数据:', form.value)
  console.log('💾 记住密码:', rememberPassword.value)
  
  // 详细调试表单数据
  console.log('🔍 详细调试:')
  console.log('- form.value 类型:', typeof form.value)
  console.log('- form.value.studentId:', form.value.studentId)
  console.log('- form.value.studentId 类型:', typeof form.value.studentId)
  console.log('- form.value.studentId 长度:', form.value.studentId ? form.value.studentId.length : 'N/A')
  console.log('- form.value.password:', form.value.password)
  console.log('- form.value.password 类型:', typeof form.value.password)
  console.log('- form.value.password 长度:', form.value.password ? form.value.password.length : 'N/A')
  
  // 简单验证
  if (!form.value.studentId || form.value.studentId.trim() === '') {
    console.log('❌ 学号为空，显示提示')
    showToast('请填写学号')
    return
  }
  if (!form.value.password || form.value.password.trim() === '') {
    console.log('❌ 密码为空，显示提示')
    showToast('请填写密码')
    return
  }
  
  console.log('✅ 前端验证通过，开始调用登录API')
  loading.value = true
  
  try {
    console.log('🔍 调用 authStore.loginUser 参数:')
    console.log('- 第一个参数 (studentId):', form.value.studentId)
    console.log('- 第二个参数 (password):', form.value.password)
    
    const result = await authStore.loginUser(form.value.studentId, form.value.password)
    console.log('✅ 登录API返回:', result)
    
    // 根据用户选择保存或清除记住的密码
    saveRememberedPassword()
    
    showToast('登录成功')
    router.replace('/home')
    
  } catch (error) {
    console.error('❌ 登录错误:', error)
    console.error('❌ 错误类型:', typeof error)
    console.error('❌ 错误消息:', error.message)
    console.error('❌ 错误详情:', error)
    showToast(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

const onForgotPassword = () => {
  showConfirmDialog({
    title: '忘记密码',
    message: '请联系系统管理员或辅导员重置密码。\n\n学生事务中心电话：020-12345678',
    confirmButtonText: '知道了',
    showCancelButton: false
  })
}

// 页面加载时检查是否有记住的密码
onMounted(() => {
  loadRememberedPassword()
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
}

.logo-placeholder {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.login-form {
  margin-bottom: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.form {
  padding: 0;
}

/* 自定义输入框样式 */
.custom-field {
  margin: 16px;
  padding-top: 8px;
}

.field-label {
  font-size: 14px;
  color: #323233;
  margin-bottom: 8px;
  font-weight: 500;
}

/* 输入框包装器 */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.custom-input {
  width: 100%;
  height: 48px;
  padding: 12px 40px 12px 12px;
  border: 1px solid #ebedf0;
  border-radius: 6px;
  font-size: 16px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.custom-input:focus {
  border-color: #1989fa;
}

.custom-input::placeholder {
  color: #c8c9cc;
}

/* 清除按钮样式 - 修复定位问题 */
.clear-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #c8c9cc;
  cursor: pointer;
  z-index: 10;
  background: white;
  border-radius: 50%;
  font-weight: bold;
  user-select: none;
  transition: all 0.2s;
}

.clear-icon:hover {
  color: #969799;
  background: #f5f5f5;
  transform: translateY(-50%) scale(1.1);
}

/* 登录选项样式 */
.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 0;
  margin-top: 8px;
}

:deep(.van-checkbox) {
  font-size: 14px;
}

:deep(.van-checkbox__icon) {
  font-size: 16px;
}

:deep(.van-checkbox__label) {
  color: #666;
  font-size: 14px;
}

.forgot-password {
  color: #667eea;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
}

.forgot-password:hover {
  text-decoration: underline;
}

.submit-btn {
  padding: 20px 16px 0;
}

.register-section {
  text-align: center;
  color: white;
}

.register-text {
  opacity: 0.9;
}

.register-link {
  color: #ffd700;
  margin-left: 8px;
  text-decoration: none;
  font-weight: 500;
}

.register-link:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .forgot-password {
    align-self: flex-end;
  }
}
</style>