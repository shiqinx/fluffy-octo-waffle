<script setup>
import { ref, computed } from 'vue'
import { Popup, Picker } from 'vant'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  placeholder: {
    type: String,
    default: '请选择'
  },
  options: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: '选择'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: 'arrow-down'
  }
})

const emit = defineEmits(['update:modelValue'])
const show = ref(false)

// 获取当前选中的文本
const selectedText = computed(() => {
  if (!props.modelValue) return ''
  const option = props.options.find(opt => opt.value === props.modelValue)
  return option ? option.text : ''
})

// 处理确认选择
const handleConfirm = (value) => {
  const selectedValue = value[0]
  emit('update:modelValue', selectedValue)
  show.value = false
}

// 处理取消选择
const handleCancel = () => {
  show.value = false
}

// 触发选择器
const triggerSelect = () => {
  if (!props.disabled) {
    show.value = true
  }
}

// 准备Picker需要的数据格式
const pickerColumns = computed(() => {
  return props.options.map(opt => ({
    text: opt.text,
    value: opt.value
  }))
})

// 当前选中的索引
const defaultIndex = computed(() => {
  if (!props.modelValue) return 0
  const index = props.options.findIndex(opt => opt.value === props.modelValue)
  return index > -1 ? index : 0
})
</script>

<template>
  <div class="custom-select"
    :class="{ 'disabled': disabled }"
    @click="triggerSelect">
  
    <div class="select-content",
      :class="{ 'has-value': modelValue !== '' && modelValue !== null && modelValue !== undefined }">
  
      <span v-if="selectedText"
        class="select-text"
        :class="{ 'placeholder': !selectedText }"
      >{{ selectedText }}</span>
      <span v-else class="select-text placeholder">{{ placeholder }}</span>
      <van-icon :name="icon" class="select-icon" />
    </div>
    
    <Popup
      v-model:show="show"
    position="bottom"
    round>
  
      <Picker
        title="{{ title }}"
        :columns="pickerColumns"
        :default-index="defaultIndex"
        @confirm="handleConfirm"
        @cancel="handleCancel"
        show-toolbar
      />
    </Popup>
  </div>
</template>

<style scoped>
.custom-select {
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.custom-select:not(.disabled):hover {
  transform: translateY(-1px);
}

.select-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8f8f8;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.custom-select:not(.disabled):hover .select-content {
  background: #f0f0f0;
  border-color: #e0e0e0;
}

.select-content.has-value {
  background: #fff;
  border-color: #e8e8e8;
}

.select-text {
  font-size: 14px;
  color: #333;
  transition: color 0.3s ease;
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select-text.placeholder {
  color: #999;
}

.select-icon {
  color: #999;
  font-size: 16px;
  transition: all 0.3s ease;
  margin-left: 8px;
  flex-shrink: 0;
}

.custom-select:not(.disabled):hover .select-icon {
  color: #1989fa;
  transform: rotate(180deg);
}

/* 禁用状态 */
.custom-select.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* 添加动画效果 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.van-popup--visible) {
  animation: slideIn 0.3s ease-out;
}

/* 优化Picker样式 */
:deep(.van-picker) {
  background: #fff;
}

:deep(.van-picker__toolbar) {
  border-bottom: 1px solid #f0f0f0;
}

:deep(.van-picker__cancel),
:deep(.van-picker__confirm) {
  font-size: 16px;
  font-weight: 500;
}

:deep(.van-picker__cancel) {
  color: #999;
}

:deep(.van-picker__confirm) {
  color: #1989fa;
}

:deep(.van-picker__title) {
  font-size: 16px;
  color: #333;
}

:deep(.van-picker__columns) {
  font-size: 16px;
}

:deep(.van-picker-column__item) {
  color: #333;
}

:deep(.van-picker-column__item--selected) {
  color: #1989fa;
  font-weight: 500;
}
</style>