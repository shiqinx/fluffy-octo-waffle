<script setup>
import { ref, computed } from 'vue'
import { Field } from 'vant'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  maxlength: {
    type: Number,
    default: 50
  },
  type: {
    type: String,
    default: 'text'
  },
  pattern: {
    type: String,
    default: ''
  },
  rows: {
    type: Number,
    default: 1
  },
  showWordLimit: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const handleInput = (value) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <Field
    v-model="props.modelValue"
    :placeholder="placeholder"
    :maxlength="maxlength"
    :type="type"
    :pattern="pattern"
    :rows="rows"
    :show-word-limit="showWordLimit"
    :left-icon="icon"
    @input="handleInput"
    class="custom-input"
  />
</template>

<style scoped>
.custom-input {
  /* 基础样式 */
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
}

.custom-input:focus-within {
  /* 聚焦效果 */
  box-shadow: 0 0 0 2px rgba(25, 137, 250, 0.15);
  transform: translateY(-1px);
}

.custom-input .van-field__control {
  font-size: 15px;
  padding: 12px 0;
  transition: all 0.3s ease;
}

.custom-input .van-field__left-icon {
  color: #8c8c8c;
  transition: color 0.3s ease;
}

.custom-input:focus-within .van-field__left-icon {
  color: #1989fa;
  transform: scale(1.1);
}

/* 适配textarea样式 */
.custom-input:deep(.van-field--textarea .van-field__control) {
  min-height: 100px;
  padding-top: 10px;
  padding-bottom: 10px;
}

/* 字数统计样式 */
.custom-input:deep(.van-field__word-limit) {
  color: #999;
  font-size: 12px;
  margin-top: 4px;
}
</style>