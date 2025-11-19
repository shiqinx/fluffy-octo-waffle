<template>
  <div class="statistics">
    <van-nav-bar title="数据统计" left-text="返回" left-arrow @click-left="$router.back()" />

    <div class="stats-content">
      <!-- 时间筛选 -->
      <van-cell-group>
        <van-field
          v-model="timeRange"
          name="timeRange"
          label="统计时间"
          readonly
          is-link
          placeholder="选择时间范围"
          @click="showTimeRangePicker = true"
        />
      </van-cell-group>

      <!-- 核心指标 -->
      <div class="core-metrics">
        <van-grid :column-num="2" :gutter="10">
          <van-grid-item>
            <div class="metric-card">
              <div class="metric-value">{{ metrics.totalActivities }}</div>
              <div class="metric-label">活动总数</div>
              <div class="metric-trend" :class="getTrendClass(metrics.activityTrend)">
                {{ metrics.activityTrend > 0 ? '↑' : '↓' }} {{ Math.abs(metrics.activityTrend) }}%
              </div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="metric-card">
              <div class="metric-value">{{ metrics.totalParticipants }}</div>
              <div class="metric-label">参与人次</div>
              <div class="metric-trend" :class="getTrendClass(metrics.participantTrend)">
                {{ metrics.participantTrend > 0 ? '↑' : '↓' }} {{ Math.abs(metrics.participantTrend) }}%
              </div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="metric-card">
              <div class="metric-value">{{ metrics.completionRate }}%</div>
              <div class="metric-label">活动完成率</div>
              <div class="metric-trend" :class="getTrendClass(metrics.completionTrend)">
                {{ metrics.completionTrend > 0 ? '↑' : '↓' }} {{ Math.abs(metrics.completionTrend) }}%
              </div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="metric-card">
              <div class="metric-value">{{ metrics.avgRating }}/5</div>
              <div class="metric-label">平均评分</div>
              <div class="metric-trend" :class="getTrendClass(metrics.ratingTrend)">
                {{ metrics.ratingTrend > 0 ? '↑' : '↓' }} {{ Math.abs(metrics.ratingTrend) }}%
              </div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 活动类型分布 -->
      <van-cell-group title="活动类型分布">
        <div class="chart-container">
          <div ref="typeChartRef" class="chart"></div>
        </div>
      </van-cell-group>

      <!-- 时间趋势 -->
      <van-cell-group title="活动时间趋势">
        <div class="chart-container">
          <div ref="trendChartRef" class="chart"></div>
        </div>
      </van-cell-group>

      <!-- 热门活动 -->
      <van-cell-group title="热门活动">
        <div class="popular-activities">
          <van-card
            v-for="activity in popularActivities"
            :key="activity.id"
            :title="activity.title"
            :desc="`参与人数: ${activity.participants}`"
          >
            <template #tags>
              <van-tag type="primary">{{ getCategoryText(activity.type) }}</van-tag>
              <van-tag type="success">评分: {{ activity.rating }}</van-tag>
            </template>
          </van-card>
        </div>
      </van-cell-group>

      <!-- 用户活跃度 -->
      <van-cell-group title="用户活跃度">
        <div class="user-stats">
          <van-grid :column-num="3" :gutter="10">
            <van-grid-item>
              <div class="user-stat">
                <div class="stat-value">{{ userStats.activeUsers }}</div>
                <div class="stat-label">活跃用户</div>
              </div>
            </van-grid-item>
            <van-grid-item>
              <div class="user-stat">
                <div class="stat-value">{{ userStats.newUsers }}</div>
                <div class="stat-label">新用户</div>
              </div>
            </van-grid-item>
            <van-grid-item>
              <div class="user-stat">
                <div class="stat-value">{{ userStats.retentionRate }}%</div>
                <div class="stat-label">用户留存率</div>
              </div>
            </van-grid-item>
          </van-grid>
        </div>
      </van-cell-group>
    </div>

    <!-- 时间范围选择器 -->
    <van-popup v-model:show="showTimeRangePicker" position="bottom">
      <van-picker
        :columns="timeRangeOptions"
        @confirm="onTimeRangeConfirm"
        @cancel="showTimeRangePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

// 状态管理
const timeRange = ref('本周')
const showTimeRangePicker = ref(false)

// 图表引用
const typeChartRef = ref(null)
const trendChartRef = ref(null)

let typeChart = null
let trendChart = null

// 数据
const metrics = ref({
  totalActivities: 156,
  totalParticipants: 892,
  completionRate: 87,
  avgRating: 4.5,
  activityTrend: 12,
  participantTrend: 8,
  completionTrend: 3,
  ratingTrend: 2
})

const popularActivities = ref([
  {
    id: 1,
    title: '周末篮球友谊赛',
    type: 'sports',
    participants: 45,
    rating: 4.8
  },
  {
    id: 2,
    title: '编程学习小组',
    type: 'study',
    participants: 32,
    rating: 4.7
  },
  {
    id: 3,
    title: '摄影技巧分享会',
    type: 'lecture',
    participants: 28,
    rating: 4.6
  }
])

const userStats = ref({
  activeUsers: 234,
  newUsers: 45,
  retentionRate: 78
})

const timeRangeOptions = [
  { text: '今天', value: 'today' },
  { text: '本周', value: 'week' },
  { text: '本月', value: 'month' },
  { text: '本季度', value: 'quarter' },
  { text: '今年', value: 'year' }
]

onMounted(() => {
  initCharts()
  loadStatistics()
})

onUnmounted(() => {
  if (typeChart) {
    typeChart.dispose()
  }
  if (trendChart) {
    trendChart.dispose()
  }
})

const initCharts = () => {
  // 初始化活动类型分布图表
  if (typeChartRef.value) {
    typeChart = echarts.init(typeChartRef.value)
    
    const typeOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        data: ['运动', '学习', '讲座', '社团', '其他']
      },
      series: [
        {
          name: '活动类型',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: 45, name: '运动' },
            { value: 32, name: '学习' },
            { value: 28, name: '讲座' },
            { value: 25, name: '社团' },
            { value: 26, name: '其他' }
          ]
        }
      ]
    }
    
    typeChart.setOption(typeOption)
  }

  // 初始化时间趋势图表
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
    
    const trendOption = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['活动数量', '参与人数']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '活动数量',
          type: 'line',
          smooth: true,
          data: [12, 15, 18, 22, 25, 28, 32],
          itemStyle: {
            color: '#1989fa'
          }
        },
        {
          name: '参与人数',
          type: 'line',
          smooth: true,
          data: [65, 78, 92, 105, 120, 135, 150],
          itemStyle: {
            color: '#07c160'
          }
        }
      ]
    }
    
    trendChart.setOption(trendOption)
  }
}

const loadStatistics = () => {
  // 模拟加载统计数据
  setTimeout(() => {
    // 图表数据已经在初始化时设置
  }, 500)
}

const getTrendClass = (trend) => {
  return trend > 0 ? 'positive' : 'negative'
}

const getCategoryText = (category) => {
  const categoryMap = {
    sports: '运动',
    study: '学习',
    lecture: '讲座',
    club: '社团',
    other: '其他'
  }
  return categoryMap[category] || '其他'
}

const onTimeRangeConfirm = (value) => {
  timeRange.value = value.text
  showTimeRangePicker.value = false
  // 重新加载对应时间范围的统计数据
  loadStatistics()
}

// 响应窗口大小变化
window.addEventListener('resize', () => {
  if (typeChart) {
    typeChart.resize()
  }
  if (trendChart) {
    trendChart.resize()
  }
})
</script>

<style scoped>
.statistics {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.stats-content {
  padding-top: 46px;
  padding-bottom: 20px;
}

.core-metrics {
  margin: 16px;
}

.metric-card {
  text-align: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.metric-value {
  font-size: 24px;
  font-weight: 600;
  color: #1989fa;
  margin-bottom: 4px;
}

.metric-label {
  font-size: 12px;
  color: #969799;
  margin-bottom: 4px;
}

.metric-trend {
  font-size: 12px;
  font-weight: 600;
}

.metric-trend.positive {
  color: #07c160;
}

.metric-trend.negative {
  color: #ee0a24;
}

.chart-container {
  padding: 16px;
  background: white;
}

.chart {
  height: 300px;
  width: 100%;
}

.popular-activities {
  padding: 0 16px;
}

.popular-activities .van-card {
  margin-bottom: 8px;
}

.user-stats {
  padding: 16px;
  background: white;
}

.user-stat {
  text-align: center;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #1989fa;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #969799;
}
</style>