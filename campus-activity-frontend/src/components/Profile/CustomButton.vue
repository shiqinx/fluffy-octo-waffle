<script setup>
import { ref } from 'vue'
import { Button } from 'vant'

const props = defineProps({
  type: {
    type: String,
    default: 'default'
  },
  size: {
    type: String,
    default: 'normal'
  },
  block: {
    type: Boolean,
    default: false
  },
  round: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['click'])

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <Button
    :type="type"
    :size="size"
    :block="block"
    :round="round"
    :loading="loading"
    :disabled="disabled"
    :icon="icon"
    :color="color"
    @click="handleClick"
    class="custom-button">
  
    <slot></slot>
  </Button>
</template>

<style scoped>
.custom-button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  position: relative;
  overflow: hidden;
}

/* 点击效果 */
.custom-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.custom-button:active::after {
  width: 300px;
  height: 300px;
}

/* 悬浮效果 */
.custom-button:not(:disabled):not(.van-button--loading):hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

/* 主要按钮样式增强 */
.custom-button.van-button--primary {
  background: linear-gradient(135deg, #1989fa, #096dd9);
  border: none;
}

.custom-button.van-button--primary:hover {
  background: linear-gradient(135deg, #4096ff, #1989fa);
}

/* 次要按钮样式增强 */
.custom-button.van-button--default {
  background: linear-gradient(135deg, #f5f5f5, #e8e8e8);
  color: #333;
  border: none;
}

.custom-button.van-button--default:hover {
  background: linear-gradient(135deg, #e8e8e8, #d9d9d9);
}

/* 警告按钮样式增强 */
.custom-button.van-button--warning {
  background: linear-gradient(135deg, #f7ba1e, #fa8c16);
  border: none;
}

.custom-button.van-button--warning:hover {
  background: linear-gradient(135deg, #ffc53d, #f7ba1e);
}

/* 禁用状态优化 */
.custom-button:disabled,
.custom-button.van-button--disabled {
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}

/* 圆形按钮样式 */
.custom-button.van-button--round {
  border-radius: 20px;
}

/* 小尺寸按钮调整 */
.custom-button.van-button--small {
  font-size: 12px;
  padding: 6px 12px;
}

/* 大尺寸按钮调整 */
.custom-button.van-button--large {
  font-size: 16px;
  padding: 12px 24px;
}

/* 图标按钮增强 */
.custom-button .van-icon {
  transition: transform 0.3s ease;
}

.custom-button:hover .van-icon {
  transform: scale(1.1);
}
</style>