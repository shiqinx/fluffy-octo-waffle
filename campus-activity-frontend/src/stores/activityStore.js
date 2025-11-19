// @/stores/activityStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useActivityStore as useLocalActivityStore } from './activity'
import { useUserStore } from './userStore'

export const useActivityStore = defineStore('activityStore', () => {
    const userStore = useUserStore()
  const localActivityStore = useLocalActivityStore()
  const activities = ref([])
  const currentActivity = ref(null)
  const loading = ref(false)

  const loadActivities = async (filters = {}) => {
    loading.value = true
    try {
      // 强制重新从localStorage加载最新数据
      await localActivityStore.loadActivities()
      // 使用本地store的activities
      activities.value = localActivityStore.activities
      console.log('🔄 activityStore.loadActivities 重新加载活动数据，当前活动数量:', activities.value.length)
    } catch (error) {
      console.error('加载活动列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchActivityDetail = async (id) => {
    loading.value = true
    try {
      // 从本地store查找活动，支持字符串和数字ID的比较
      const activity = localActivityStore.activities.find(a => 
        a.id === id || a.id == id || String(a.id) === String(id)
      )
      if (activity) {
        // 转换活动数据结构为ActivityDetail.vue期望的格式
        const formattedActivity = {
          id: activity.id,
          title: activity.title,
          category: activity.type || activity.category || 'other',
          description: activity.description || '',
          status: activity.status || 'recruiting',
          startTime: activity.startTime,
          endTime: activity.endTime,
          enrollStartTime: activity.registrationDeadline || activity.enrollStartTime,
          enrollEndTime: activity.registrationDeadline || activity.enrollEndTime,
          location: {
            name: activity.locationName || activity.location?.name || '',
            address: activity.location?.address || ''
          },
          coords: activity.coords || [],
          organizer: activity.organizer || {
            id: null,  // 不使用固定ID，避免错误识别组织者
            name: '未知组织者',
            avatar: '',
            role: '组织者',
            creditScore: 100
          },
          currentParticipants: activity.currentParticipants || 0,
          maxParticipants: activity.maxParticipants || 20,
          participants: activity.participants || [],
          enrollments: activity.enrollments || []
        }
        currentActivity.value = formattedActivity
        return formattedActivity
      }
      throw new Error('活动不存在')
    } catch (error) {
      console.error('加载活动详情失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 修改方法名为 createActivity
  const createActivity = async (activityData) => {
    try {
      // 使用本地store的createNewActivity方法
      const newActivity = await localActivityStore.createNewActivity(activityData)
      activities.value.unshift(newActivity)
      return newActivity
    } catch (error) {
      console.error('创建活动失败:', error)
      throw error
    }
  }

  const enrollInActivity = async (activityId, enrollmentData) => {
    try {
      // 使用本地store的enrollInActivity方法
      return await localActivityStore.enrollInActivity(activityId)
    } catch (error) {
      console.error('报名活动失败:', error)
      throw error
    }
  }

  return {
    activities,
    currentActivity,
    loading,
    loadActivities,
    fetchActivityDetail,
    createActivity, // 修改这里
    enrollInActivity
  }
})