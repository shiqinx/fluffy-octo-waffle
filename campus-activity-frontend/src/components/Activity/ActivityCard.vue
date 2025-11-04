<template>
  <div class="activity-card" @click="$emit('click')">
    <div class="card-content">
      <h4>{{ activity.title || '活动标题' }}</h4>
      <p class="description">{{ activity.description || '活动描述' }}</p>
      <p class="location" v-if="activity.location">
        <van-icon name="location-o" />{{ activity.location }}
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  activity: {
    type: Object,
    default: () => ({})
  }
})

defineEmits(['click'])
</script>

<style scoped>
.activity-card {
  background: white;
  border-radius: 8px;
  padding: 12px;
  min-width: 200px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid #ebedf0;
}

.card-content h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #323233;
}

.description {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #969799;
  line-height: 1.4;
}

.location {
  margin: 0;
  font-size: 11px;
  color: #c8c9cc;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>