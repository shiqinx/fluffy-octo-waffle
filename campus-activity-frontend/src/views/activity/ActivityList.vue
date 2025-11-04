<template>
  <div class="activity-list">
    <!-- 搜索框 -->
    <div class="search-section">
      <van-search
        v-model="searchKeyword"
        placeholder="搜索活动..."
        shape="round"
        @search="onSearch"
      />
    </div>

    <!-- 活动列表 -->
    <div class="activities-container">
      <div class="section-title">附近活动</div>
      
      <div class="activities-grid">
        <div 
          v-for="activity in activities" 
          :key="activity.id"
          class="activity-card"
          @click="viewActivity(activity.id)"
        >
          <div class="activity-header">
            <h3>{{ activity.title }}</h3>
            <span class="distance">{{ activity.distance }}m</span>
          </div>
          <p class="activity-desc">{{ activity.description }}</p>
          <div class="activity-footer">
            <span class="location">
              <van-icon name="location-o" />
              {{ activity.location }}
            </span>
            <span class="time">{{ activity.time }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'vant'

const router = useRouter()
const searchKeyword = ref('')

// 模拟活动数据
const activities = ref([
  {
    id: 1,
    title: '篮球友谊赛',
    description: '校园篮球比赛，欢迎所有篮球爱好者参加',
    location: '体育馆篮球场',
    time: '今天 15:00',
    distance: 250,
    participants: 8,
    maxParticipants: 20
  },
  {
    id: 2,
    title: '读书分享会',
    description: '每周读书分享活动，交流阅读心得',
    location: '图书馆三楼',
    time: '明天 19:00',
    distance: 180,
    participants: 6,
    maxParticipants: 15
  },
  {
    id: 3,
    title: '编程学习小组',
    description: '前端开发技术交流，Vue.js学习',
    location: '计算机楼302',
    time: '后天 14:00',
    distance: 320,
    participants: 12,
    maxParticipants: 25
  }
])

const onSearch = (value) => {
  if (value.trim()) {
    Toast(`搜索: ${value}`)
  }
}

const viewActivity = (activityId) => {
  router.push(`/activity/${activityId}`)
}
</script>

<style scoped>
.activity-list {
  min-height: 100vh;
  background: #f7f8fa;
}

.search-section {
  background: white;
  padding: 10px;
}

.activities-container {
  padding: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.activities-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
}

.activity-card:active {
  background: #f8f9fa;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.activity-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.distance {
  background: #07c160;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  white-space: nowrap;
}

.activity-desc {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.activity-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.location {
  display: flex;
  align-items: center;
  gap: 4px;
}

.time {
  background: #e3f2fd;
  color: #1976d2;
  padding: 2px 8px;
  border-radius: 10px;
}
</style>