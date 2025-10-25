<template>
  <div class="register-page">
    <!-- 背景装饰 -->
    <div class="background-decor">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <!-- 主要内容 -->
    <div class="register-content">
      <!-- 头部品牌信息 -->
      <div class="brand-header">
        <div class="logo">
          <div class="logo-icon">🏫</div>
          <h1 class="brand-title">校园活动平台</h1>
        </div>
        <p class="brand-subtitle">创建您的校园活动账户</p>
      </div>

      <!-- 注册表单 -->
      <div class="register-form-container">
        <h2 class="form-title">用户注册</h2>
        
        <div class="form-wrapper">
          <!-- 用户名输入 -->
          <div class="input-group">
            <div class="input-icon">👤</div>
            <input
              v-model="registerForm.name"
              type="text"
              placeholder="请输入真实姓名（仅支持中文）"
              class="form-input"
              @input="validateNameInput"
              maxlength="4"
            >
            <div class="input-hint">仅支持2-4个中文字符</div>
          </div>

          <!-- 学号输入 -->
          <div class="input-group">
            <div class="input-icon">🎓</div>
            <input
              v-model="registerForm.studentId"
              type="text"
              placeholder="请输入学号"
              class="form-input"
              maxlength="12"
            >
          </div>

          <!-- 密码输入 -->
          <div class="input-group">
            <div class="input-icon">🔒</div>
            <input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码"
              class="form-input"
            >
          </div>

          <!-- 确认密码输入 -->
          <div class="input-group">
            <div class="input-icon">✅</div>
            <input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              class="form-input"
            >
          </div>

          <!-- 密码强度提示 -->
          <div class="password-strength" v-if="registerForm.password">
            <div class="strength-bar">
              <div 
                class="strength-fill" 
                :class="passwordStrength.class"
              ></div>
            </div>
            <div class="strength-text">{{ passwordStrength.text }}</div>
          </div>

          <!-- 注册协议 -->
          <div class="agreement">
            <label class="checkbox-label">
              <input
                v-model="registerForm.agreed"
                type="checkbox"
                class="checkbox-input"
              >
              <span class="checkbox-custom"></span>
              <span class="checkbox-text">
                我已阅读并同意
                <a href="#" class="agreement-link">《用户协议》</a>
                和
                <a href="#" class="agreement-link">《隐私政策》</a>
              </span>
            </label>
          </div>

          <!-- 注册按钮 -->
          <button
            @click="onSubmit"
            :disabled="loading || !registerForm.agreed"
            class="register-btn"
          >
            <span v-if="!loading">立即注册</span>
            <span v-else class="loading-text">注册中...</span>
          </button>
        </div>

        <!-- 登录链接 -->
        <div class="login-link">
          <span>已有账号？</span>
          <a @click="goToLogin" class="link">立即登录</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const registerForm = ref({
  name: '',
  studentId: '',
  password: '',
  confirmPassword: '',
  agreed: false
})
const loading = ref(false)

// 计算密码强度
const passwordStrength = computed(() => {
  const password = registerForm.value.password
  if (!password) {
    return { class: 'weak', text: '' }
  }

  let strength = 0
  if (password.length >= 8) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^a-zA-Z0-9]/.test(password)) strength++

  switch (strength) {
    case 0:
    case 1:
      return { class: 'weak', text: '密码强度：弱' }
    case 2:
    case 3:
      return { class: 'medium', text: '密码强度：中' }
    case 4:
    case 5:
      return { class: 'strong', text: '密码强度：强' }
    default:
      return { class: 'weak', text: '密码强度：弱' }
  }
})

// 验证中文字符输入
const validateNameInput = (event) => {
  const input = event.target
  const value = input.value
  
  // 移除非中文字符
  const chineseOnly = value.replace(/[^\u4e00-\u9fa5]/g, '')
  
  // 更新输入框的值
  if (value !== chineseOnly) {
    input.value = chineseOnly
    registerForm.value.name = chineseOnly
  }
}

// 验证表单
const validateForm = () => {
  if (!registerForm.value.name.trim()) {
    alert('请输入真实姓名')
    return false
  }
  
  // 验证用户名是否为纯中文
  if (!/^[\u4e00-\u9fa5]+$/.test(registerForm.value.name)) {
    alert('姓名只能包含中文字符')
    return false
  }
  
  // 验证姓名长度（2-4个中文字符）
  if (registerForm.value.name.length < 2 || registerForm.value.name.length > 4) {
    alert('姓名长度应为2-4个中文字符')
    return false
  }
  
  if (!registerForm.value.studentId.trim()) {
    alert('请输入学号')
    return false
  }
  
  // 学号格式验证（假设学号是数字）
  if (!/^\d+$/.test(registerForm.value.studentId)) {
    alert('学号格式不正确，请输入数字')
    return false
  }
  
  if (!registerForm.value.password.trim()) {
    alert('请输入密码')
    return false
  }
  
  if (registerForm.value.password.length < 6) {
    alert('密码长度至少6位')
    return false
  }
  
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    alert('两次输入的密码不一致')
    return false
  }
  
  if (!registerForm.value.agreed) {
    alert('请同意用户协议和隐私政策')
    return false
  }
  
  return true
}

const onSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    const result = await authStore.register(registerForm.value)
    
    if (result.success) {
      alert('注册成功！')
      router.push('/')
    } else {
      alert(result.message || '注册失败')
    }
  } catch (error) {
    console.error('注册错误:', error)
    alert('注册失败，请重试')
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.background-decor {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: -50px;
  left: -50px;
}

.circle-2 {
  width: 150px;
  height: 150px;
  bottom: 100px;
  right: -50px;
}

.circle-3 {
  width: 100px;
  height: 100px;
  top: 50%;
  right: 20%;
}

.register-content {
  width: 100%;
  max-width: 400px;
  z-index: 1;
}

.brand-header {
  text-align: center;
  margin-bottom: 30px;
  color: white;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
}

.logo-icon {
  font-size: 40px;
}

.brand-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

.brand-subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.register-form-container {
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.form-title {
  text-align: center;
  margin-bottom: 25px;
  font-size: 22px;
  font-weight: 600;
  color: #333;
}

.form-wrapper {
  margin-bottom: 25px;
}

.input-group {
  position: relative;
  margin-bottom: 16px;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  z-index: 1;
}

.form-input {
  width: 100%;
  height: 48px;
  padding: 0 20px 0 45px;
  border: 2px solid #f1f3f4;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: #fafbfc;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-hint {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  text-align: left;
  padding-left: 45px;
}

/* 密码强度指示器 */
.password-strength {
  margin: 10px 0 20px 0;
}

.strength-bar {
  width: 100%;
  height: 6px;
  background: #f1f3f4;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 5px;
}

.strength-fill {
  height: 100%;
  width: 0%;
  transition: all 0.3s ease;
  border-radius: 3px;
}

.strength-fill.weak {
  width: 33%;
  background: #ff4757;
}

.strength-fill.medium {
  width: 66%;
  background: #ffa502;
}

.strength-fill.strong {
  width: 100%;
  background: #2ed573;
}

.strength-text {
  font-size: 12px;
  color: #666;
  text-align: center;
}

/* 协议同意 */
.agreement {
  margin: 20px 0 25px 0;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  border: 2px solid #ddd;
  border-radius: 3px;
  margin-right: 8px;
  margin-top: 2px;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox-input:checked + .checkbox-custom {
  background: #667eea;
  border-color: #667eea;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  color: white;
  font-size: 10px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.agreement-link {
  color: #667eea;
  text-decoration: none;
}

.agreement-link:hover {
  text-decoration: underline;
}

/* 注册按钮 */
.register-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.register-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.loading-text {
  display: inline-block;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.login-link {
  text-align: center;
  color: #666;
  font-size: 14px;
}

.link {
  color: #667eea;
  margin-left: 8px;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
}

.link:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .register-page {
    padding: 15px;
  }
  
  .register-form-container {
    padding: 25px 20px;
  }
  
  .brand-title {
    font-size: 24px;
  }
  
  .form-title {
    font-size: 20px;
  }
  
  .form-input {
    height: 46px;
    font-size: 14px;
  }
  
  .register-btn {
    height: 46px;
    font-size: 15px;
  }
}
</style>