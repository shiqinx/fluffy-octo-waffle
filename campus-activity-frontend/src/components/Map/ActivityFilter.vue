<template>
  <div class="activity-filter">
    <div class="filter-header">
      <h3>活动筛选</h3>
      <van-button type="primary" size="small" @click="resetFilters">重置</van-button>
    </div>

    <div class="filter-content">
      <!-- 分类筛选 -->
      <div class="filter-section">
        <h4>活动分类</h4>
        <div class="filter-tags">
          <van-tag
            v-for="category in categoryOptions"
            :key="category.value"
            :type="filters.category === category.value ? 'primary' : 'default'"
            size="large"
            @click="setCategory(category.value)"
          >
            {{ category.text }}
          </van-tag>
        </div>
      </div>

      <!-- 状态筛选 -->
      <div class="filter-section">
        <h4>活动状态</h4>
        <div class="filter-tags">
          <van-tag
            v-for="status in statusOptions"
            :key="status.value"
            :type="filters.status === status.value ? 'primary' : 'default'"
            size="large"
            @click="setStatus(status.value)"
          >
            {{ status.text }}
          </van-tag>
        </div>
      </div>

      <!-- 距离筛选 -->
      <div class="filter-section">
        <h4>距离范围</h4>
        <div class="filter-tags">
          <van-tag
            v-for="distance in distanceOptions"
            :key="distance.value"
            :type="filters.distance === distance.value ? 'primary' : 'default'"
            size="large"
            @click="setDistance(distance.value)"
          >
            {{ distance.text }}
          </van-tag>
        </div>
      </div>
    </div>

    <div class="filter-actions">
      <van-button type="default" block @click="$emit('cancel')">取消</van-button>
      <van-button type="primary" block @click="applyFilters">应用</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useActivityStore } from '@/stores/activity'

const activityStore = useActivityStore()

const emit = defineEmits(['filter-change', 'cancel'])

// 筛选选项
const categoryOptions = [
  { text: '全部', value: 'all' },
  { text: '讲座', value: 'lecture' },
  { text: '运动', value: 'sports' },
  { text: '桌游', value: 'game' },
  { text: '社团', value: 'club' },
  { text: '其他', value: 'other' }
]

const statusOptions = [
  { text: '全部', value: 'all' },
  { text: '招募中', value: 'recruiting' },
  { text: '即将开始', value: 'upcoming' },
  { text: '进行中', value: 'ongoing' },
  { text: '已结束', value: 'ended' }
]

const distanceOptions = [
  { text: '全校', value: 'all' },
  { text: '1km内', value: '1' },
  { text: '2km内', value: '2' },
  { text: '5km内', value: '5' }
]

// 筛选状态
const filters = ref({
  category: 'all',
  status: 'all',
  distance: 'all'
})

// 设置分类
const setCategory = (category) => {
  filters.value.category = category
}

// 设置状态
const setStatus = (status) => {
  filters.value.status = status
}

// 设置距离
const setDistance = (distance) => {
  filters.value.distance = distance
}

// 重置筛选
const resetFilters = () => {
  filters.value = {
    category: 'all',
    status: 'all',
    distance: 'all'
  }
}

// 应用筛选
const applyFilters = () => {
  activityStore.setFilters(filters.value)
  emit('filter-change', filters.value)
}
</script>

<style scoped>
.activity-filter {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebedf0;
}

.filter-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.filter-content {
  flex: 1;
  overflow-y: auto;
}

.filter-section {
  margin-bottom: 24px;
}

.filter-section h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 500;
  color: #323233;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tags .van-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.filter-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}
</style>