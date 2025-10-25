import { defineStore } from 'pinia'
import { ref } from 'vue'
import { activityAPI } from '@/api/activity'

export const useActivityStore = defineStore('activity', () => {
  const activities = ref([])
  const currentActivity = ref(null)
  const nearbyActivities = ref([])
  const myActivities = ref([])

  // 查询活动信息 - 对应活动搜索
  const searchActivities = async (filters = {}) => {
    const response = await activityAPI.search(filters)
    activities.value = response.data
    return activities.value
  }

  // 创建活动申请 - 对应活动创建流程
  const createActivity = async (activityData) => {
    const response = await activityAPI.create(activityData)
    
    // 记录创建日志
    console.log('活动创建申请提交:', activityData)
    return response
  }

  // 加入活动申请 - 对应加入活动流程
  const joinActivity = async (activityId) => {
    const response = await activityAPI.join(activityId)
    return response
  }

  // 获取附近活动 - 对应基于位置的活动
  const getNearbyActivities = async (location) => {
    const response = await activityAPI.getNearby(location)
    nearbyActivities.value = response.data
    return nearbyActivities.value
  }

  // 活动签到 - 对应参与者签到
  const checkInActivity = async (activityId) => {
    const response = await activityAPI.checkIn(activityId)
    return response
  }

  return {
    activities,
    currentActivity,
    nearbyActivities,
    myActivities,
    searchActivities,
    createActivity,
    joinActivity,
    getNearbyActivities,
    checkInActivity
  }
})