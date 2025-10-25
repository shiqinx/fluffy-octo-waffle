<template>
  <div class="team-list-page">
    <!-- 顶部导航 -->
    <van-nav-bar title="组队匹配" fixed placeholder>
      <template #right>
        <van-button 
          icon="plus" 
          type="primary" 
          size="small"
          @click="$router.push('/team/create')"
        >
          创建团队
        </van-button>
      </template>
    </van-nav-bar>

    <!-- 快速匹配 -->
    <div class="quick-match-section">
      <div class="section-title">快速匹配</div>
      <van-grid :column-num="2" :gutter="10">
        <van-grid-item @click="startRandomMatch">
          <template #icon>
            <div class="match-icon random">
              <van-icon name="question" />
            </div>
          </template>
          <template #text>
            <div class="match-text">随机组队</div>
            <div class="match-desc">系统智能匹配</div>
          </template>
        </van-grid-item>
        <van-grid-item @click="showInterestMatch">
          <template #icon>
            <div class="match-icon interest">
              <van-icon name="fire" />
            </div>
          </template>
          <template #text>
            <div class="match-text">兴趣匹配</div>
            <div class="match-desc">基于共同兴趣</div>
          </template>
        </van-grid-item>
      </van-grid>
    </div>

    <!-- 团队列表 -->
    <div class="teams-section">
      <div class="section-header">
        <div class="section-title">推荐团队</div>
        <van-dropdown-menu>
          <van-dropdown-item v-model="sortBy" :options="sortOptions" />
          <van-dropdown-item v-model="filterBy" :options="filterOptions" />
        </van-dropdown-menu>
      </div>

      <div class="teams-list">
        <TeamCard 
          v-for="team in teams"
          :key="team.id"
          :team="team"
          @click="viewTeamDetail(team.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useTeamStore } from '@/stores/team'
import TeamCard from '@/components/Team/TeamCard.vue'

const router = useRouter()
const teamStore = useTeamStore()

const sortBy = ref(0)
const filterBy = ref(0)
const sortOptions = [
  { text: '最新创建', value: 0 },
  { text: '最多成员', value: 1 },
  { text: '最近活跃', value: 2 }
]
const filterOptions = [
  { text: '全部团队', value: 0 },
  { text: '可加入', value: 1 },
  { text: '同学院', value: 2 }
]

const { teams } = storeToRefs(teamStore)

const startRandomMatch = async () => {
  try {
    const result = await teamStore.randomTeamMatch()
    if (result.success) {
      router.push(`/team/${result.data.teamId}`)
    }
  } catch (error) {
    console.error('随机组队失败:', error)
  }
}

const showInterestMatch = () => {
  router.push('/team/interest-match')
}

const viewTeamDetail = (teamId) => {
  router.push(`/team/${teamId}`)
}

onMounted(() => {
  teamStore.fetchTeams()
})
</script>