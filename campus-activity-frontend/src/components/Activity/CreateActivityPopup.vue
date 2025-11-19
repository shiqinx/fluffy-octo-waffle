<!-- @/components/Activity/CreateActivityPopup.vue -->
<template>
  <van-popup
    v-model:show="show"
    position="bottom"
    closeable
    round
    :style="{ height: '90%' }"
  >
    <div class="create-activity-popup">
      <h2 class="popup-title">创建活动</h2>
      
      <van-form @submit="onSubmit">
        <van-cell-group>
          <van-field
            v-model="form.title"
            label="活动标题"
            placeholder="请输入活动标题"
            :rules="[{ required: true, message: '请输入活动标题' }]"
          />
          
          <van-field
            v-model="form.description"
            label="活动描述"
            type="textarea"
            placeholder="请输入活动描述"
            rows="3"
            autosize
            :rules="[{ required: true, message: '请输入活动描述' }]"
          />
          
          <van-field
            v-model="form.type"
            label="活动类型"
            readonly
            is-link
            @click="showTypePicker = true"
            :rules="[{ required: true, message: '请选择活动类型' }]"
          />
          
          <van-field
            v-model="form.locationName"
            label="活动地点"
            readonly
            is-link
            @click="showLocationPicker = true"
            :rules="[{ required: true, message: '请选择活动地点' }]"
          />
          
          <van-field
            v-model="form.startTime"
            label="开始时间"
            readonly
            is-link
            @click="showStartTimePicker = true"
            :rules="[{ required: true, message: '请选择开始时间' }]"
          />
          
          <van-field
            v-model="form.endTime"
            label="结束时间"
            readonly
            is-link
            @click="showEndTimePicker = true"
            :rules="[{ required: true, message: '请选择结束时间' }]"
          />
          
          <van-field
            v-model="form.maxParticipants"
            label="最大人数"
            type="digit"
            placeholder="请输入最大参与人数"
            :rules="[{ required: true, message: '请输入最大参与人数' }]"
          />
        </van-cell-group>
        
        <div class="form-actions">
          <van-button round block type="primary" native-type="submit" :loading="loading">
            创建活动
          </van-button>
        </div>
      </van-form>
    </div>

    <!-- 选择器 -->
    <van-popup v-model:show="showTypePicker" position="bottom">
      <van-picker
        :columns="activityTypes"
        @confirm="onTypeConfirm"
        @cancel="showTypePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showLocationPicker" position="bottom" :style="{ height: '80%' }">
      <LocationPicker @select="onLocationSelect" />
    </van-popup>

    <van-popup v-model:show="showStartTimePicker" position="bottom">
      <van-datetime-picker
        v-model="startTimeDate"
        type="datetime"
        title="选择开始时间"
        :min-date="minDate"
        @confirm="onStartTimeConfirm"
        @cancel="showStartTimePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showEndTimePicker" position="bottom">
      <van-datetime-picker
        v-model="endTimeDate"
        type="datetime"
        title="选择结束时间"
        :min-date="startTimeDate"
        @confirm="onEndTimeConfirm"
        @cancel="showEndTimePicker = false"
      />
    </van-popup>
  </van-popup>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useActivityStore } from '@/stores/activity'
import { showToast } from 'vant'
import LocationPicker from '@/components/Map/LocationPicker.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'created'])

const activityStore = useActivityStore()

// 表单数据
const form = ref({
  title: '',
  description: '',
  type: '',
  locationName: '',
  latitude: null,
  longitude: null,
  startTime: '',
  endTime: '',
  maxParticipants: ''
})

const loading = ref(false)

// 选择器状态
const showTypePicker = ref(false)
const showLocationPicker = ref(false)
const showStartTimePicker = ref(false)
const showEndTimePicker = ref(false)

// 时间选择
const startTimeDate = ref(new Date())
const endTimeDate = ref(new Date(Date.now() + 2 * 60 * 60 * 1000)) // 默认2小时后
const minDate = ref(new Date())

// 活动类型选项
const activityTypes = [
  { text: '体育运动', value: 'sports' },
  { text: '学习交流', value: 'study' },
  { text: '娱乐活动', value: 'entertainment' },
  { text: '其他', value: 'other' }
]

// 方法
const onSubmit = async () => {
  loading.value = true
  try {
    await activityStore.createActivity(form.value)
    showToast('创建成功')
    resetForm()
    emit('created')
    emit('update:show', false)
  } catch (error) {
    showToast(error.message || '创建失败')
  } finally {
    loading.value = false
  }
}

const onTypeConfirm = (value) => {
  form.value.type = value.selectedValues[0]
  showTypePicker.value = false
}

const onLocationSelect = (location) => {
  form.value.locationName = location.name
  form.value.latitude = location.coords[1]
  form.value.longitude = location.coords[0]
  showLocationPicker.value = false
}

const onStartTimeConfirm = (value) => {
  form.value.startTime = value.toISOString()
  startTimeDate.value = value
  showStartTimePicker.value = false
}

const onEndTimeConfirm = (value) => {
  form.value.endTime = value.toISOString()
  endTimeDate.value = value
  showEndTimePicker.value = false
}

const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    type: '',
    locationName: '',
    latitude: null,
    longitude: null,
    startTime: '',
    endTime: '',
    maxParticipants: ''
  }
  startTimeDate.value = new Date()
  endTimeDate.value = new Date(Date.now() + 2 * 60 * 60 * 1000)
}
</script>

<style scoped>
.create-activity-popup {
  padding: 20px;
}

.popup-title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
}

.form-actions {
  margin-top: 30px;
  padding: 0 16px;
}
</style>