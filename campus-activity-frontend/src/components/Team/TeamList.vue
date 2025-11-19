<!-- @/components/Team/TeamList.vue -->
<template>
  <div class="team-list">
    <van-pull-refresh v-model:loading="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="listLoading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <TeamCard
          v-for="team in teams"
          :key="team.id"
          :team="team"
          @click="$emit('team-click', team)"
        />
        
        <div v-if="teams.length === 0 && !loading" class="empty-state">
          <van-empty description="暂无团队" />
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TeamCard from './TeamCard.vue'

const props = defineProps({
  teams: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['team-click', 'refresh'])

const refreshing = ref(false)
const listLoading = ref(false)
const finished = ref(false)

const onRefresh = () => {
  refreshing.value = false
  emit('refresh')
}

const onLoad = () => {
  // 加载更多逻辑
  finished.value = true
}
</script>

<style scoped>
.team-list {
  min-height: 200px;
}

.empty-state {
  padding: 40px 0;
}
</style>