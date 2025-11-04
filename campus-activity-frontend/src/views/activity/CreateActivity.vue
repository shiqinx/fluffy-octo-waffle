<template>
  <div class="create-activity">
    <van-nav-bar 
      title="创建活动" 
      left-arrow 
      @click-left="$router.back()"
    />
    
    <van-form @submit="onSubmit">
      <!-- 活动基本信息 -->
      <van-cell-group title="活动信息">
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
        />
      </van-cell-group>

      <!-- 位置信息 -->
      <van-cell-group title="位置信息">
        <van-field
          v-model="form.location.address"
          label="活动地点"
          readonly
          @click="showMapPicker = true"
        />
        <van-field
          v-model="form.location.detail"
          label="详细地址"
          placeholder="请输入详细地址"
        />
      </van-cell-group>

      <!-- 时间信息 -->
      <van-cell-group title="时间信息">
        <van-field
          v-model="form.time.startTime"
          label="开始时间"
          readonly
          @click="showStartTimePicker = true"
        />
        <van-field
          v-model="form.time.endTime"
          label="结束时间"
          readonly
          @click="showEndTimePicker = true"
        />
      </van-cell-group>

      <!-- 提交按钮 -->
      <div style="margin: 16px;">
        <van-button round block type="primary" native-type="submit">
          提交申请
        </van-button>
      </div>
    </van-form>

    <!-- 地图选择器 -->
    <van-popup v-model:show="showMapPicker" position="bottom">
      <MapPicker @confirm="onLocationConfirm" />
    </van-popup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useActivityStore } from '@/stores/activity'

const router = useRouter()
const activityStore = useActivityStore()

const form = ref({
  title: '',
  description: '',
  location: {
    address: '',
    detail: '',
    lng: 0,
    lat: 0
  },
  time: {
    startTime: '',
    endTime: ''
  }
})

const showMapPicker = ref(false)

const onSubmit = async () => {
  try {
    await activityStore.createActivity(form.value)
    router.push('/activities')
  } catch (error) {
    console.error('创建活动失败:', error)
  }
}

const onLocationConfirm = (location) => {
  form.value.location = location
  showMapPicker.value = false
}
</script>