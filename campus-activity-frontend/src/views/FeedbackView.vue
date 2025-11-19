<template>
  <div class="feedback-view">
    <van-nav-bar
      title="意见反馈"
      left-arrow
      @click-left="handleBack"
      fixed 
      placeholder 
    />

    <div class="feedback-container">
      <!-- 页面说明 -->
      <div class="feedback-intro">
        <p class="intro-text">欢迎提交您的意见和建议，我们将尽快处理并回复您。</p>
      </div>

      <van-form @submit="submitFeedback" class="feedback-form">
        <!-- 反馈类型 -->
        <van-cell-group class="form-section">
          <div class="section-title">反馈类型 <span class="required">*</span></div>
          <van-field
            v-model="form.type"
            label="问题类型"
            placeholder="请选择问题类型"
            is-link
            readonly
            @click="showTypePicker = true"
            :rules="[{ required: true, message: '请选择问题类型' }]"
            :error-message="formErrors.type"
          >
            <template #right-icon>
              <van-icon name="arrow" size="16" color="#999" />
            </template>
          </van-field>
        </van-cell-group>

        <!-- 反馈内容 -->
        <van-cell-group class="form-section">
          <div class="section-title">反馈内容 <span class="required">*</span></div>
          <van-field
            v-model="form.content"
            rows="5"
            autosize
            label="详细描述"
            type="textarea"
            placeholder="请详细描述您遇到的问题或建议，以便我们更好地解决..."
            :rules="[{ required: true, message: '请输入反馈内容' }]"
            maxlength="500"
            show-word-limit
            :error-message="formErrors.content"
          />
        </van-cell-group>

        <!-- 联系方式 -->
        <van-cell-group class="form-section">
          <div class="section-title">联系方式（选填）</div>
          <van-field
            v-model="form.contact"
            label="联系方式"
            placeholder="请输入邮箱或手机号以便我们回复您"
            :error-message="formErrors.contact"
          />
        </van-cell-group>

        <!-- 截图上传 -->
        <van-cell-group class="form-section">
          <div class="section-title">相关截图（选填）</div>
          <div class="upload-section">
            <van-uploader
              v-model="fileList"
              multiple
              :max-count="3"
              :after-read="afterRead"
              @delete="deleteFile"
              :upload-text="'添加图片'"
            >
              <template #preview-cover="{ file }">
                <div class="preview-cover">
                  <van-icon name="close" size="18" color="white" />
                </div>
              </template>
            </van-uploader>
            <p class="upload-tip">最多上传3张图片，每张不超过5MB</p>
          </div>
        </van-cell-group>

        <!-- 提交按钮 -->
        <div class="submit-section">
          <van-button 
            block 
            type="primary" 
            native-type="submit"
            :loading="submitting"
            size="large"
            class="submit-btn"
          >
            提交反馈
          </van-button>
        </div>
      </van-form>
    </div>

    <!-- 类型选择器 -->
    <van-popup v-model:show="showTypePicker" position="bottom">
      <div class="picker-header">
        <button class="picker-cancel" @click="showTypePicker = false">取消</button>
        <h3 class="picker-title">选择问题类型</h3>
        <button class="picker-confirm" @click="confirmTypeSelection">确定</button>
      </div>
      <van-picker
        v-model="selectedTypeIndex"
        :columns="feedbackTypes"
        @confirm="onTypeConfirm"
        @cancel="showTypePicker = false"
      />
    </van-popup>

    <!-- 成功提示弹窗 -->
    <van-dialog
      v-model:show="showSuccessDialog"
      title="提交成功"
      show-cancel-button="false"
      confirm-button-text="确定"
      @confirm="handleSuccessConfirm"
    >
      <div class="success-content">
        <div class="success-icon">✓</div>
        <p class="success-message">感谢您的反馈，我们将尽快处理并回复您。</p>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast } from 'vant'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

// 状态管理
const showTypePicker = ref(false)
const submitting = ref(false)
const showSuccessDialog = ref(false)
const fileList = ref([])
const selectedTypeIndex = ref(0)

// 表单数据
const form = reactive({
  type: '',
  content: '',
  contact: '',
  attachments: []
})

// 表单错误
const formErrors = reactive({
  type: '',
  content: '',
  contact: ''
})

// 反馈类型选项
const feedbackTypes = [
  '功能建议',
  'BUG反馈',
  '体验问题',
  '内容举报',
  '其他问题'
]

// 联系方式验证正则
const contactRegex = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^1[3-9]\d{9}$/
}

// 表单验证
const validateForm = () => {
  let isValid = true
  
  // 重置错误信息
  Object.keys(formErrors).forEach(key => {
    formErrors[key] = ''
  })
  
  // 验证反馈类型
  if (!form.type) {
    formErrors.type = '请选择问题类型'
    isValid = false
  }
  
  // 验证反馈内容
  if (!form.content) {
    formErrors.content = '请输入反馈内容'
    isValid = false
  } else if (form.content.trim().length < 10) {
    formErrors.content = '请输入更详细的反馈内容（至少10个字符）'
    isValid = false
  }
  
  // 验证联系方式（如果填写了）
  if (form.contact) {
    const contact = form.contact.trim()
    if (!contactRegex.email.test(contact) && !contactRegex.phone.test(contact)) {
      formErrors.contact = '请输入有效的邮箱或手机号'
      isValid = false
    }
  }
  
  return isValid
}

// 类型选择
const onTypeConfirm = (value) => {
  console.log('🔄 选择反馈类型:', value)
  form.type = value
  showTypePicker.value = false
}

// 确认类型选择
const confirmTypeSelection = () => {
  if (selectedTypeIndex.value >= 0 && selectedTypeIndex.value < feedbackTypes.length) {
    form.type = feedbackTypes[selectedTypeIndex.value]
  }
  showTypePicker.value = false
}

// 文件上传处理
const afterRead = (file) => {
  console.log('📤 文件上传:', file)
  
  // 检查文件大小
  if (file.file.size > 5 * 1024 * 1024) {
    showToast('文件大小不能超过5MB')
    return
  }
  
  // 检查文件类型
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
  if (!validTypes.includes(file.file.type)) {
    showToast('只支持JPG、PNG、GIF格式的图片')
    return
  }
  
  // 在真实环境中，这里应该上传文件到服务器
  file.status = 'uploading'
  file.message = '上传中...'
  
  // 模拟上传过程
  setTimeout(() => {
    file.status = 'done'
    form.attachments.push(file)
    console.log('✅ 文件上传成功')
  }, 1000)
}

// 文件删除处理
const deleteFile = (file, detail) => {
  console.log('🗑️ 删除文件:', file)
  form.attachments = form.attachments.filter(f => f.uid !== file.uid)
}

// 提交反馈
const submitFeedback = async () => {
  // 验证表单
  if (!validateForm()) {
    showToast('请检查并完善表单信息')
    return
  }
  
  submitting.value = true
  try {
    console.log('📝 开始提交反馈:', form)
    
    // 模拟API调用
    showLoadingToast({
      message: '提交中...',
      duration: 0,
      overlay: true
    })
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    console.log('✅ 反馈提交成功')
    hideLoadingToast()
    
    // 显示成功弹窗
    showSuccessDialog.value = true
  } catch (error) {
    console.error('❌ 提交反馈失败:', error)
    hideLoadingToast()
    showToast('提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

// 处理成功确认
const handleSuccessConfirm = () => {
  // 清空表单
  Object.assign(form, {
    type: '',
    content: '',
    contact: '',
    attachments: []
  })
  fileList.value = []
  
  // 返回上一页
  router.back()
}

// 返回上一页
const handleBack = () => {
  console.log('↩️ 返回上一页')
  router.back()
}

// 组件挂载时
console.log('🔄 加载反馈页面')
</script>

<style scoped>
.feedback-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding-top: 46px; /* 为固定导航栏留出空间 */
}

.feedback-container {
  padding-bottom: 40px;
}

/* 页面说明 */
.feedback-intro {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 16px;
  margin-bottom: 12px;
}

.intro-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.feedback-form {
  padding: 0;
}

/* 表单区块样式 */
.form-section {
  background: white;
  margin-bottom: 12px;
  border-radius: 0;
  overflow: hidden;
}

.section-title {
  padding: 12px 16px 8px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.required {
  color: #ee0a24;
}

/* 表单项样式 */
:deep(.van-field) {
  padding: 8px 16px;
  border-bottom: 1px solid #f5f5f5;
}

:deep(.van-field:last-child) {
  border-bottom: none;
}

:deep(.van-field__label) {
  width: 80px;
  font-size: 15px;
  color: #333;
}

:deep(.van-field__control) {
  font-size: 15px;
}

:deep(.van-field__textarea) {
  min-height: 120px;
  font-size: 15px;
  line-height: 1.5;
}

/* 上传区域 */
.upload-section {
  padding: 16px;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin: 12px 0 0 0;
  text-align: center;
}

:deep(.van-uploader__upload) {
  width: 80px;
  height: 80px;
  border: 1px dashed #d9d9d9;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: #fafafa;
}

:deep(.van-uploader__preview) {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
}

.preview-cover {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s;
}

:deep(.van-uploader__preview):hover .preview-cover {
  opacity: 1;
}

/* 提交按钮 */
.submit-section {
  padding: 24px 16px;
}

.submit-btn {
  border-radius: 8px;
  font-size: 16px;
  height: 48px;
}

/* 选择器样式 */
.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
}

.picker-cancel,
.picker-confirm {
  background: none;
  border: none;
  font-size: 15px;
  padding: 6px 12px;
  cursor: pointer;
}

.picker-cancel {
  color: #999;
}

.picker-confirm {
  color: #1989fa;
  font-weight: 500;
}

.picker-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

/* 成功弹窗样式 */
.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.success-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #52c41a;
  color: white;
  font-size: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.success-message {
  margin: 0;
  font-size: 15px;
  color: #666;
  text-align: center;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .feedback-intro {
    padding: 16px 12px;
  }
  
  .form-section {
    margin-bottom: 10px;
  }
  
  .submit-section {
    padding: 20px 12px;
  }
  
  :deep(.van-field__label) {
    width: 70px;
    font-size: 14px;
  }
  
  :deep(.van-field__control) {
    font-size: 14px;
  }
}

@media (min-width: 768px) {
  .feedback-container {
    max-width: 600px;
    margin: 0 auto;
  }
  
  .form-section {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border-radius: 8px;
  }
}
</style>