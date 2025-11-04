<template>
  <div class="activity-filter">
    <van-nav-bar
      title="活动筛选"
      left-text="取消"
      right-text="确定"
      @click-left="$emit('close')"
      @click-right="applyFilters"
    />
    
    <div class="filter-content">
      <!-- 活动类型 -->
      <div class="filter-section">
        <div class="section-title">活动类型</div>
        <div class="filter-tags">
          <van-tag
            v-for="type in activityTypes"
            :key="type.value"
            :type="filters.type === type.value ? 'primary' : 'default'"
            size="large"
            @click="toggleFilter('type', type.value)"
          >
            {{ type.label }}
          </van-tag>
        </div>
      </div>

      <!-- 时间筛选 -->
      <div class="filter-section">
        <div class="section-title">活动时间</div>
        <div class="time-options">
          <van-radio-group v-model="filters.timeRange">
            <van-radio name="all">全部时间</van-radio>
            <van-radio name="today">今天</van-radio>
            <van-radio name="weekend">本周末</van-radio>
            <van-radio name="week">本周</van-radio>
            <van-radio name="month">本月</van-radio>
          </van-radio-group>
        </div>
      </div>

      <!-- 距离范围 -->
      <div class="filter-section">
        <div class="section-title">距离范围</div>
        <van-slider
          v-model="filters.distance"
          :min="500"
          :max="5000"
          :step="500"
          bar-height="4px"
          active-color="#07c160"
        >
          <template #button>
            <div class="custom-button">{{ filters.distance }}米</div>
          </template>
        </van-slider>
        <div class="distance-labels">
          <span>500米</span>
          <span>5公里</span>
        </div>
      </div>

      <!-- 参与人数 -->
      <div class="filter-section">
        <div class="section-title">参与人数</div>
        <div class="participant-options">
          <van-radio-group v-model="filters.participants">
            <van-radio name="all">不限人数</van-radio>
            <van-radio name="small">1-10人</van-radio>
            <van-radio name="medium">10-30人</van-radio>
            <van-radio name="large">30人以上</van-radio>
          </van-radio-group>
        </div>
      </div>

      <!-- 活动状态 -->
      <div class="filter-section">
        <div class="section-title">活动状态</div>
        <div class="status-options">
          <van-checkbox-group v-model="filters.status">
            <van-checkbox name="upcoming" shape="square">即将开始</van-checkbox>
            <van-checkbox name="ongoing" shape="square">进行中</van-checkbox>
            <van-checkbox name="finished" shape="square">已结束</van-checkbox>
          </van-checkbox-group>
        </div>
      </div>

      <!-- 排序方式 -->
      <div class="filter-section">
        <div class="section-title">排序方式</div>
        <div class="sort-options">
          <van-radio-group v-model="filters.sortBy">
            <van-radio name="distance">距离最近</van-radio>
            <van-radio name="time">时间最新</van-radio>
            <van-radio name="popular">人气最高</van-radio>
          </van-radio-group>
        </div>
      </div>
    </div>

    <!-- 重置按钮 -->
    <div class="filter-actions">
      <van-button block type="default" @click="resetFilters">重置筛选</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['filter', 'close'])

// 活动类型选项
const activityTypes = [
  { label: '全部', value: 'all' },
  { label: '体育运动', value: 'sports' },
  { label: '学习交流', value: 'study' },
  { label: '文艺活动', value: 'art' },
  { label: '志愿服务', value: 'volunteer' },
  { label: '娱乐游戏', value: 'entertainment' },
  { label: '户外探险', value: 'outdoor' },
  { label: '科技创新', value: 'tech' }
]

// 筛选条件
const filters = ref({
  type: 'all',
  timeRange: 'all',
  distance: 2000,
  participants: 'all',
  status: ['upcoming', 'ongoing'],
  sortBy: 'distance'
})

const toggleFilter = (key, value) => {
  if (filters.value[key] === value) {
    filters.value[key] = key === 'type' ? 'all' : ''
  } else {
    filters.value[key] = value
  }
}

const applyFilters = () => {
  emit('filter', { ...filters.value })
  emit('close')
}

const resetFilters = () => {
  filters.value = {
    type: 'all',
    timeRange: 'all',
    distance: 2000,
    participants: 'all',
    status: ['upcoming', 'ongoing'],
    sortBy: 'distance'
  }
}
</script>

<style scoped>
.activity-filter {
  height: 100%;
  background: #f7f8fa;
  display: flex;
  flex-direction: column;
}

.filter-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.filter-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.time-options,
.participant-options,
.sort-options {
  :deep(.van-radio) {
    margin-bottom: 12px;
  }
}

.status-options {
  :deep(.van-checkbox) {
    margin-bottom: 12px;
  }
}

.distance-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #969799;
}

.custom-button {
  width: 60px;
  height: 24px;
  background: #07c160;
  border-radius: 12px;
  color: white;
  font-size: 12px;
  line-height: 24px;
  text-align: center;
}

.filter-actions {
  padding: 16px;
  background: white;
  border-top: 1px solid #f0f0f0;
}
</style>