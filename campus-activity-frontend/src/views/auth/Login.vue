<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="background-decor">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <!-- 主要内容 -->
    <div class="login-content">
      <!-- 头部品牌信息 -->
      <div class="brand-header">
        <div class="logo">
          <div class="logo-icon">🏫</div>
          <h1 class="brand-title">校园活动平台</h1>
        </div>
        <p class="brand-subtitle">基于位置的校园活动与组队平台</p>
      </div>

      <!-- 登录表单 -->
      <div class="login-form-container">
        <h2 class="form-title">用户登录</h2>
        
        <div class="form-wrapper">
          <!-- 学号输入 -->
          <div class="input-group">
            <div class="input-icon">🎓</div>
            <input
              v-model="loginForm.studentId"
              type="text"
              placeholder="请输入学号"
              class="form-input"
            >
          </div>

          <!-- 密码输入 -->
          <div class="input-group">
            <div class="input-icon">🔒</div>
            <input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              class="form-input"
            >
          </div>

          <!-- 记住我 -->
          <div class="remember-me">
            <label class="checkbox-label">
              <input
                v-model="loginForm.rememberMe"
                type="checkbox"
                class="checkbox-input"
              >
              <span class="checkbox-custom"></span>
              <span class="checkbox-text">记住我的账户和密码</span>
            </label>
          </div>

          <!-- 登录按钮 -->
          <button
            @click="onSubmit"
            :disabled="loading"
            class="login-btn"
          >
            <span v-if="!loading">登录</span>
            <span v-else class="loading-text">登录中...</span>
          </button>
        </div>

        <!-- 注册链接 -->
        <div class="register-link">
          <span>还没有账号？</span>
          <a @click="goToRegister" class="link">立即注册</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loginForm = ref({
  studentId: '',
  password: '',
  rememberMe: false
})
const loading = ref(false)

// 加载记住的账户信息
const loadRememberedAccount = () => {
  const remembered = localStorage.getItem('rememberedAccount')
  if (remembered) {
    try {
      const account = JSON.parse(remembered)
      loginForm.value = { ...loginForm.value, ...account }
    } catch (error) {
      console.error('加载记住的账户失败:', error)
    }
  }
}

// 保存账户信息
const saveRememberedAccount = () => {
  if (loginForm.value.rememberMe) {
    const account = {
      studentId: loginForm.value.studentId,
      password: loginForm.value.password,
      rememberMe: true
    }
    localStorage.setItem('rememberedAccount', JSON.stringify(account))
  } else {
    localStorage.removeItem('rememberedAccount')
  }
}

const onSubmit = async () => {
  if (!loginForm.value.studentId.trim()) {
    alert('请输入学号')
    return
  }
  
  if (!loginForm.value.password.trim()) {
    alert('请输入密码')
    return
  }

  loading.value = true

  try {
    const result = await authStore.login(loginForm.value)
    
    if (result.success) {
      saveRememberedAccount()
      alert('登录成功！')
      router.push('/')
    } else {
      alert(result.message || '登录失败')
    }
  } catch (error) {
    console.error('登录错误:', error)
    alert('登录失败，请重试')
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  router.push('/register')
}

onMounted(() => {
  authStore.initUser()
  loadRememberedAccount()
  
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-page {
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

.login-content {
  width: 100%;
  max-width: 400px;
  z-index: 1;
}

.brand-header {
  text-align: center;
  margin-bottom: 40px;
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

.login-form-container {
  background: white;
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.form-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.form-wrapper {
  margin-bottom: 30px;
}

.input-group {
  position: relative;
  margin-bottom: 20px;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  z-index: 1;
}

.form-input {
  width: 100%;
  height: 50px;
  padding: 0 20px 0 50px;
  border: 2px solid #f1f3f4;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #fafbfc;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.remember-me {
  margin: 20px 0 30px 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #666;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #ddd;
  border-radius: 4px;
  margin-right: 8px;
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
  font-size: 12px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.checkbox-text {
  user-select: none;
}

.login-btn {
  width: 100%;
  height: 50px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.login-btn:disabled {
  opacity: 0.7;
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

.register-link {
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
  .login-page {
    padding: 15px;
  }
  
  .login-form-container {
    padding: 30px 20px;
  }
  
  .brand-title {
    font-size: 24px;
  }
  
  .form-title {
    font-size: 20px;
  }
}
</style>