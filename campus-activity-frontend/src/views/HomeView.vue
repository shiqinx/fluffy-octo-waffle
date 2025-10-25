<template>
  <MainLayout>
    <div class="home-view">
      <div class="welcome-section">
        <h1>校园活动平台</h1>
        <p>发现精彩活动，结交志同道合的朋友</p>
      </div>
      
      <div class="quick-actions">
        <van-grid :column-num="3" :gutter="10">
          <van-grid-item 
            icon="map-marked" 
            text="地图" 
            @click="$router.push('/map')"
          />
          <van-grid-item 
            icon="friends-o" 
            text="活动" 
            @click="$router.push('/activities')"
          />
          <van-grid-item 
            icon="cluster-o" 
            text="组队" 
            @click="$router.push('/teams')"
          />
        </van-grid>
      </div>

      <div class="recent-activities">
        <div class="section-header">
          <h3>推荐活动</h3>
          <span class="more" @click="$router.push('/activities')">更多</span>
        </div>
        <div class="activities-list">
          <van-empty v-if="!activities.length" description="暂无活动" />
          <ActivityCard 
            v-for="activity in activities"
            :key="activity.id"
            :activity="activity"
            @click="viewActivityDetail(activity.id)"
          />
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useActivityStore } from '@/stores/activity'
import MainLayout from '@/components/Layout/MainLayout.vue'
import ActivityCard from '@/components/Activity/ActivityCard.vue'

const router = useRouter()
const activityStore = useActivityStore()
const { activities } = storeToRefs(activityStore)

onMounted(async () => {
  await activityStore.fetchActivities()
})

const viewActivityDetail = (activityId) => {
  router.push(`/activity/${activityId}`)
}
</script>

<style scoped>
.home-view {
  padding: 16px;
}

.welcome-section {
  text-align: center;
  margin-bottom: 24px;
}

.welcome-section h1 {
  font-size: 24px;
  color: #323233;
  margin-bottom: 8px;
}

.welcome-section p {
  color: #969799;
  font-size: 14px;
}

.quick-actions {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 18px;
  color: #323233;
  margin: 0;
}

.more {
  font-size: 14px;
  color: #1989fa;
  cursor: pointer;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>