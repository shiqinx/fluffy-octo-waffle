<template>
  <div class="applicant-detail">
    <van-nav-bar
      :title="user.name"
      left-text="关闭"
      left-arrow
      @click-left="$emit('close')"
    />

    <div class="detail-content">
      <!-- 基本信息 -->
      <van-cell-group title="基本信息">
        <van-cell title="姓名" :value="user.name" />
        <van-cell title="学号" :value="user.studentId" />
        <van-cell title="院系" :value="user.department" />
        <van-cell title="信誉分" :value="user.creditScore" />
      </van-cell-group>

      <!-- 活动参与记录 -->
      <van-cell-group title="活动参与记录">
        <div class="activity-stats">
          <div class="stat-item">
            <div class="stat-number">{{ userStats.createdActivities }}</div>
            <div class="stat-label">发布活动</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ userStats.joinedActivities }}</div>
            <div class="stat-label">参与活动</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ userStats.completionRate }}%</div>
            <div class="stat-label">完成率</div>
          </div>
        </div>
      </van-cell-group>

      <!-- 技能标签 -->
      <van-cell-group title="技能标签" v-if="userSkills.length > 0">
        <div class="skills-section">
          <van-tag
            v-for="skill in userSkills"
            :key="skill"
            type="primary"
            size="medium"
          >
            {{ skill }}
          </van-tag>
        </div>
      </van-cell-group>

      <!-- 最近参与的活动 -->
      <van-cell-group title="最近参与的活动">
        <div v-if="recentActivities.length === 0" class="empty-activities">
          <van-empty description="暂无活动记录" image-size="80" />
        </div>
        
        <div v-else class="activity-list">
          <van-card
            v-for="activity in recentActivities"
            :key="activity.id"
            :title="activity.title"
            :desc="formatTime(activity.startTime)"
          >
            <template #tags>
              <van-tag :type="getStatusType(activity.status)" size="small">
                {{ getStatusText(activity.status) }}
              </van-tag>
            </template>
          </van-card>
        </div>
      </van-cell-group>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

// 状态管理
const userStats = ref({})
const userSkills = ref([])
const recentActivities = ref([])

onMounted(() => {
  loadUserDetail()
})

const loadUserDetail = () => {
  // 模拟加载用户详细信息
  userStats.value = {
    createdActivities: 5,
    joinedActivities: 12,
    completionRate: 92
  }

  userSkills.value = [
    '篮球', '编程', '英语', '摄影', '组织能力'
  ]

  recentActivities.value = [
    {
      id: 1,
      title: '周末篮球比赛',
      startTime: new Date(Date.now() - 86400000).toISOString(),
      status: 'completed'
    },
    {
      id: 2,
      title: '编程学习小组',
      startTime: new Date(Date.now() - 172800000).toISOString(),
      status: 'completed'
    },
    {
      id: 3,
      title: '摄影技巧分享',
      startTime: new Date(Date.now() - 259200000).toISOString(),
      status: 'completed'
    }
  ]
}

const formatTime = (timeStr) => {
  return new Date(timeStr).toLocaleDateString('zh-CN')
}

const getStatusType = (status) => {
  const typeMap = {
    completed: 'success',
    ongoing: 'primary',
    upcoming: 'warning',
    cancelled: 'danger'
  }
  return typeMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    completed: '已完成',
    ongoing: '进行中',
    upcoming: '即将开始',
    cancelled: '已取消'
  }
  return textMap[status] || '未知'
}
</script>

<style scoped>
.applicant-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.detail-content {
  flex: 1;
  overflow-y: auto;
}

.activity-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 16px;
  background: white;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 18px;
  font-weight: 600;
  color: #1989fa;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #969799;
}

.skills-section {
  padding: 16px;
  background: white;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.empty-activities {
  padding: 20px 0;
}

.activity-list {
  padding: 0 16px;
}

.activity-list .van-card {
  margin-bottom: 8px;
}
</style>