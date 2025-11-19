<template>
  <div class="tag-editor">
    <div class="tag-editor-header">
      <h3 class="tag-title">{{ title || '标签' }}</h3>
      <button
        v-if="editable"
        class="add-tag-btn"
        @click="showAddDialog = true"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19M12 5L5 12M12 5L19 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>添加标签</span>
      </button>
    </div>
    
    <div class="tag-list">
      <div v-if="tags.length === 0" class="no-tags">
        {{ emptyText || '暂无标签' }}
      </div>
      <div
        v-for="(tag, index) in tags"
        :key="index"
        class="tag-item"
      >
        <span class="tag-text">{{ tag }}</span>
        <button
          v-if="editable"
          class="remove-tag-btn"
          @click="removeTag(index)"
          type="button"
          aria-label="删除标签"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
    
    <!- 添加标签对话框 ->
    <div v-if="showAddDialog" class="tag-dialog-overlay" @click="closeDialog">
      <div class="tag-dialog" @click.stop>
        <div class="dialog-header">
          <h4>添加新标签</h4>
          <button class="close-btn" @click="closeDialog">×</button>
        </div>
        
        <div class="dialog-content">
          <input
            v-model="newTagText"
            type="text"
            class="tag-input"
            placeholder="请输入标签内容"
            maxlength="10"
            @keyup.enter="addTag"
            ref="tagInput"
          />
          <div class="tag-suggestions">
            <button
              v-for="suggestion in tagSuggestions"
              :key="suggestion"
              class="suggestion-btn"
              :disabled="tags.includes(suggestion)"
              @click="selectSuggestion(suggestion)"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="cancel-btn" @click="closeDialog">取消</button>
          <button class="confirm-btn" @click="addTag">确认添加</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { showToast } from 'vant'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  editable: {
    type: Boolean,
    default: true
  },
  title: {
    type: String,
    default: '标签'
  },
  emptyText: {
    type: String,
    default: '暂无标签'
  },
  maxTags: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'add', 'remove'])

const tags = ref([...props.modelValue])
const showAddDialog = ref(false)
const newTagText = ref('')
const tagInput = ref(null)

// 标签建议列表
const tagSuggestions = [
  '积极', '靠谱', '热情', '细心', '创意', 
  '执行力强', '团队协作', '善于沟通', '技术达人', '组织能力'
]

// 监听 prop 变化
watch(() => props.modelValue, (newValue) => {
  if (newValue && Array.isArray(newValue)) {
    tags.value = [...newValue]
  }
})

// 更新标签并通知父组件
const updateTags = (newTags) => {
  tags.value = newTags
  emit('update:modelValue', newTags)
  emit('change', newTags)
}

// 打开对话框后聚焦输入框
watch(showAddDialog, async (isVisible) => {
  if (isVisible) {
    await nextTick()
    tagInput.value?.focus()
  } else {
    newTagText.value = ''
  }
})

// 关闭对话框
const closeDialog = () => {
  showAddDialog.value = false
}

// 选择建议标签
const selectSuggestion = (suggestion) => {
  newTagText.value = suggestion
  tagInput.value?.focus()
}

// 添加标签
const addTag = () => {
  const trimmedTag = newTagText.value.trim()
  
  // 验证标签
  if (!trimmedTag) {
    showToast('标签内容不能为空')
    return
  }
  
  if (trimmedTag.length > 10) {
    showToast('标签长度不能超过10个字符')
    return
  }
  
  if (tags.value.includes(trimmedTag)) {
    showToast('该标签已存在')
    return
  }
  
  if (tags.value.length >= props.maxTags) {
    showToast(`最多只能添加${props.maxTags}个标签`)
    return
  }
  
  // 添加标签
  const newTags = [...tags.value, trimmedTag]
  updateTags(newTags)
  emit('add', trimmedTag)
  
  showToast('标签添加成功')
  closeDialog()
}

// 删除标签
const removeTag = (index) => {
  const tagToRemove = tags.value[index]
  const newTags = tags.value.filter((_, i) => i !== index)
  updateTags(newTags)
  emit('remove', tagToRemove, index)
  showToast('标签删除成功')
}
</script>

<style scoped>
.tag-editor {
  width: 100%;
}

.tag-editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.tag-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  color: #323233;
}

.add-tag-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background-color: #f2f3f5;
  border: none;
  border-radius: 16px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-tag-btn:hover {
  background-color: #e6e8eb;
  color: #303133;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.no-tags {
  color: #909399;
  font-size: 14px;
  padding: 20px 0;
  width: 100%;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: #ecf5ff;
  color: #409eff;
  border-radius: 16px;
  font-size: 14px;
}

.remove-tag-btn {
  background: none;
  border: none;
  padding: 2px;
  cursor: pointer;
  color: #909399;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.remove-tag-btn:hover {
  background-color: rgba(233, 30, 99, 0.1);
  color: #f56c6c;
}

/* 对话框样式 */
.tag-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.tag-dialog {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  padding: 20px;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.dialog-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #323233;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #909399;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: #f2f3f5;
  color: #606266;
}

.dialog-content {
  margin-bottom: 20px;
}

.tag-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.tag-input:focus {
  border-color: #409eff;
}

.tag-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.suggestion-btn {
  padding: 6px 12px;
  background-color: #f2f3f5;
  border: 1px solid #e4e7ed;
  border-radius: 16px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggestion-btn:hover:not(:disabled) {
  background-color: #ecf5ff;
  border-color: #d9ecff;
  color: #409eff;
}

.suggestion-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn,
.confirm-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.cancel-btn {
  background-color: #f2f3f5;
  color: #606266;
}

.cancel-btn:hover {
  background-color: #e6e8eb;
}

.confirm-btn {
  background-color: #409eff;
  color: white;
}

.confirm-btn:hover {
  background-color: #66b1ff;
}
</style>