<script setup>
import { ref } from 'vue'
import { showToast } from 'vant'

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  size: {
    type: Number,
    default: 100
  },
  editable: {
    type: Boolean,
    default: true
  },
  placeholder: {
    type: String,
    default: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiNlMWUxZTEiLz4KPHBhdGggZD0iTTQwIDQ0QzQ0LjQxODMgNDQgNDggNDAuNDE4MyA0OCAzNkM0OCAzMS41ODE3IDQ0LjQxODMgMjggNDAgMjhDMzUuNTgxNyAyOCAzMiAzMS41ODE3IDMyIDM2QzMyIDQwLjQxODMgMzUuNTgxNyA0NCA0MCA0NFoiIGZpbGw9IiM5OTk5OTkiLz4KPHBhdGggZD0iTTU2IDUyQzU2IDU4LjYyNzQgNTAuNjI3NCA2NCA0NCA2NEgzNkMyOS4zNzI2IDY0IDI0IDU4LjYyNzQgMjQgNTJWMjRINTZWNTRaIiBmaWxsPSIjOTk5OTk5Ii8+Cjwvc3ZnPgo='
  }
})

const emit = defineEmits(['change'])
const inputRef = ref(null)

const triggerUpload = () => {
  if (props.editable) {
    inputRef.value.click()
  }
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  // 验证文件类型和大小
  if (!file.type.match('image.*')) {
    showToast('请选择图片文件')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast('图片大小不能超过5MB')
    return
  }

  // 读取文件并预览
  const reader = new FileReader()
  reader.onload = (e) => {
    emit('change', {
      file,
      preview: e.target.result
    })
  }
  reader.readAsDataURL(file)

  // 重置input，以便能再次选择同一个文件
  e.target.value = ''
}
</script>

<template>
  <div 
    class="custom-avatar"
    :class="{ 'editable': editable }"
    :style="{ 
      width: size + 'px', 
      height: size + 'px' 
    }"
    @click="triggerUpload">
  
    <img 
      :src="src || placeholder" 
      alt="用户头像" 
      class="avatar-image"
      :style="{ 
        width: size + 'px', 
        height: size + 'px' 
      }"
    />
    
    <div v-if="editable" class="avatar-overlay"
      :style="{ 
      width: size + 'px', 
      height: size + 'px',
      borderRadius: size / 2 + 'px'
    }">
  
      <van-icon name="photograph" size="24" color="white" />
      <div class="avatar-text">更换头像</div>
    </div>
    
    <input
      ref="inputRef"
      type="file"
      accept="image/*"
      class="avatar-input"
      style="display: none"
      @change="handleFileChange"
    />
  </div>
</template>

<style scoped>
.custom-avatar {
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.custom-avatar:hover {
  transform: scale(1.05);
}

.custom-avatar.editable:hover .avatar-image {
  filter: brightness(0.8);
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid #f0f0f0;
  object-fit: cover;
  transition: all 0.3s ease;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  color: white;
}

.custom-avatar.editable:hover .avatar-overlay {
  opacity: 1;
}

.avatar-text {
  font-size: 12px;
  margin-top: 4px;
}

/* 添加动画效果 */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.custom-avatar.editing .avatar-image {
  animation: pulse 1.5s infinite;
}
</style>