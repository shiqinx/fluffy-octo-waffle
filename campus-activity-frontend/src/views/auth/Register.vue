<template>
  <div class="register-page">
    <van-nav-bar
      title="用户注册"
      left-text="返回"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <div class="register-content">
      <van-form @submit="onSubmit" class="register-form">
        <van-cell-group inset>
          <van-field
            v-model="form.realName"
            name="realName"
            label="真实姓名"
            placeholder="请输入真实姓名（仅中文）"
            :rules="[{ required: true, pattern: /^[\u4e00-\u9fa5]{2,10}$/, message: '请输入2-10位中文姓名' }]"
            clearable
          />
          <van-field
            v-model="form.studentId"
            name="studentId"
            label="学号"
            placeholder="请输入6-12位学号"
            :rules="[{ required: true, pattern: /^\d{6,12}$/, message: '请输入6-12位数字学号' }]"
            clearable
            maxlength="12"
          />
          <van-field
            v-model="form.password"
            type="password"
            name="password"
            label="密码"
            placeholder="请输入密码"
            :rules="[{ required: true, validator: validatePassword, message: '密码至少6位，包含字母和数字' }]"
            clearable
            @input="checkPasswordStrength"
          >
            <template #extra>
              <div class="password-strength">
                <span class="strength-text">{{ strengthText }}</span>
                <div class="strength-bar">
                  <div 
                    class="strength-progress" 
                    :class="strengthClass"
                    :style="{ width: strengthWidth }"
                  ></div>
                </div>
              </div>
            </template>
          </van-field>
          <van-field
            v-model="form.confirmPassword"
            type="password"
            name="confirmPassword"
            label="确认密码"
            placeholder="请再次输入密码"
            :rules="[{ validator: validateConfirmPassword, message: '两次密码输入不一致' }]"
            clearable
          />
        </van-cell-group>

        <div class="agreement-section">
          <van-checkbox v-model="agreed" shape="square" class="agreement-checkbox">
            我已阅读并同意
            <span class="agreement-link" @click="showAgreement = true">《用户协议》</span>
          </van-checkbox>
        </div>

        <div class="submit-section">
          <van-button 
            round 
            block 
            type="primary" 
            native-type="submit" 
            :loading="loading"
            :disabled="!agreed"
            size="large"
          >
            注册
          </van-button>
        </div>
      </van-form>

      <van-popup v-model:show="showAgreement" position="bottom" :style="{ height: '70%' }">
        <div class="agreement-popup">
          <div class="agreement-header">
            <h3>用户协议</h3>
          </div>
          <div class="agreement-content">
            <div class="agreement-text">
              <h4>欢迎使用基于位置的校园活动与组队平台</h4>
              <p>请您仔细阅读以下条款，如果您不同意本服务条款，您应不使用本平台。</p>
              
              <h5>一、服务说明</h5>
              <p>本平台为校园师生提供基于地理位置的活动发布、组队匹配、即时通讯等服务。</p>
              
              <h5>二、用户注册</h5>
              <p>1. 用户需使用真实学号进行注册（6-12位数字）</p>
              <p>2. 用户需提供真实姓名信息（2-10位中文）</p>
              <p>3. 用户需设置安全密码</p>
              <p>4. 用户需同意本协议条款</p>
              
              <h5>三、使用规则</h5>
              <p>1. 不得发布违法、违规内容</p>
              <p>2. 尊重他人隐私权</p>
              <p>3. 遵守校园管理规定</p>
              
              <h5>四、隐私保护</h5>
              <p>我们将保护您的个人信息安全，仅在必要范围内使用您的信息。</p>
            </div>
          </div>
          <div class="agreement-actions">
            <van-button type="primary" block @click="showAgreement = false" size="large">
              同意并关闭
            </van-button>
          </div>
        </div>
      </van-popup>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  realName: '',
  studentId: '',
  password: '',
  confirmPassword: ''
})

const agreed = ref(false)
const showAgreement = ref(false)
const loading = ref(false)

// 密码强度相关
const passwordStrength = ref(0) // 0: 无, 1: 弱, 2: 中, 3: 强

// 计算密码强度
const checkPasswordStrength = () => {
  const password = form.value.password
  if (!password) {
    passwordStrength.value = 0
    return
  }

  let strength = 0
  
  // 长度评分
  if (password.length >= 6) strength += 1
  if (password.length >= 8) strength += 1
  
  // 复杂度评分
  if (/[a-z]/.test(password)) strength += 1
  if (/[A-Z]/.test(password)) strength += 1
  if (/[0-9]/.test(password)) strength += 1
  if (/[^a-zA-Z0-9]/.test(password)) strength += 1
  
  // 最终强度等级
  if (strength <= 2) {
    passwordStrength.value = 1 // 弱
  } else if (strength <= 4) {
    passwordStrength.value = 2 // 中
  } else {
    passwordStrength.value = 3 // 强
  }
}

// 密码强度文本
const strengthText = computed(() => {
  const texts = ['', '弱', '中', '强']
  return passwordStrength.value > 0 ? `密码强度：${texts[passwordStrength.value]}` : ''
})

// 密码强度进度条宽度
const strengthWidth = computed(() => {
  const widths = ['0%', '33%', '66%', '100%']
  return widths[passwordStrength.value]
})

// 密码强度样式类
const strengthClass = computed(() => {
  const classes = ['', 'strength-weak', 'strength-medium', 'strength-strong']
  return classes[passwordStrength.value]
})

// 密码验证规则
const validatePassword = (val) => {
  if (!val) {
    return '请输入密码'
  }
  if (val.length < 6) {
    return '密码长度至少6位'
  }
  if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(val)) {
    return '密码需包含字母和数字'
  }
  return true
}

// 确认密码验证
const validateConfirmPassword = (val) => {
  return val === form.value.password
}

const onSubmit = async () => {
  if (!agreed.value) {
    showToast('请同意用户协议')
    return
  }

  // 手动验证学号格式
  if (!/^\d{6,12}$/.test(form.value.studentId)) {
    showToast('请输入6-12位数字学号')
    return
  }

  // 手动验证密码
  const passwordValid = validatePassword(form.value.password)
  if (passwordValid !== true) {
    showToast(passwordValid)
    return
  }

  loading.value = true
  try {
    await authStore.registerUser(form.value)
    showToast('注册成功')
    router.push('/login')
  } catch (error) {
    showToast(error.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.register-content {
  padding: 20px;
}

.register-form {
  margin-top: 20px;
}

.agreement-section {
  padding: 20px 16px;
}

.agreement-checkbox {
  width: 100%;
}

.agreement-link {
  color: #1989fa;
}

.submit-section {
  padding: 0 16px;
}

.agreement-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.agreement-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  text-align: center;
}

.agreement-header h3 {
  margin: 0;
  color: #333;
}

.agreement-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.agreement-text h4 {
  color: #333;
  margin-bottom: 12px;
}

.agreement-text h5 {
  color: #666;
  margin: 16px 0 8px 0;
}

.agreement-text p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 8px;
}

.agreement-actions {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}

/* 密码强度样式 */
.password-strength {
  margin-top: 8px;
}

.strength-text {
  font-size: 12px;
  color: #666;
  display: block;
  margin-bottom: 4px;
}

.strength-bar {
  width: 80px;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
}

.strength-progress {
  height: 100%;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.strength-weak {
  background: #ff4d4f;
}

.strength-medium {
  background: #faad14;
}

.strength-strong {
  background: #52c41a;
}
</style>