// @/stores/activity.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useUserStore } from './userStore'

// 从localStorage加载活动数据
const loadActivitiesFromStorage = () => {
  console.log('🔄 loadActivitiesFromStorage 被调用')
  
  try {
    const storedActivities = localStorage.getItem('campus_activities')
    if (storedActivities) {
      const activities = JSON.parse(storedActivities)
      
      // 数据验证：检查是否是有效的活动数组
      if (Array.isArray(activities) && activities.length > 0) {
        // 检查数据是否完整（包含必要的字段）
        const validActivities = activities.filter(activity => 
          activity && 
          typeof activity === 'object' &&
          activity.id && 
          activity.title && 
          activity.startTime &&
          activity.endTime
        );
        
        // 如果有有效活动，就返回它们（不再强制要求5个以上）
        if (validActivities.length > 0) {
          console.log('✅ 从 localStorage 加载了', validActivities.length, '个有效活动')
          return validActivities
        } else {
          console.warn('⚠️ localStorage 中的活动数据不完整，有效活动数量:', validActivities.length)
        }
      } else {
        console.warn('⚠️ localStorage 中的活动数据格式异常，数组长度:', activities?.length || 0)
      }
    }
  } catch (error) {
    console.warn('⚠️ 从 localStorage 读取活动数据失败:', error)
  }
  
  // 如果 localStorage 中没有数据或数据异常，返回默认活动数据
  console.log('📦 使用默认活动数据')
  
  // 使用固定的组织者ID，而不是动态设置为当前用户
  const defaultOrganizerId = 1
  
  // 返回多样化的默认活动数据
  const defaultActivities = [
    {
      id: 1,
      title: '中医养生讲座',
      type: 'study',
      category: 'study',
      locationName: '学术报告厅',
      location: {
        name: '学术报告厅',
        address: '学校学术报告厅'
      },
      description: '邀请中医专家讲解中医养生知识，分享传统保健方法。',
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      registrationDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000).toISOString(),
      enrollStartTime: new Date().toISOString(),
      enrollEndTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000).toISOString(),
      currentParticipants: 15,
      maxParticipants: 30,
      organizer: {
        id: defaultOrganizerId + 1,
        name: '中医学院',
        avatar: 'https://via.placeholder.com/150',
        role: '组织者',
        creditScore: 98
      },
      distance: 0.8,
      isEnrolled: false,
      isApproved: false,
      status: 'open',
      participants: [],
      enrollments: []
    },
    {
      id: 2,
      title: '摄影作品展览',
      type: 'culture',
      category: 'culture',
      locationName: '艺术展厅',
      location: {
        name: '艺术展厅',
        address: '学校艺术展厅'
      },
      description: '展示学生摄影作品，分享摄影技巧，交流创作心得。',
      startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
      registrationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000).toISOString(),
      enrollStartTime: new Date().toISOString(),
      enrollEndTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000).toISOString(),
      currentParticipants: 12,
      maxParticipants: 25,
      organizer: {
        id: defaultOrganizerId + 2,
        name: '摄影协会',
        avatar: 'https://via.placeholder.com/150',
        role: '组织者',
        creditScore: 92
      },
      distance: 0.3,
      isEnrolled: false,
      isApproved: false,
      status: 'open',
      participants: [],
      enrollments: []
    },
    {
      id: 3,
      title: '编程马拉松大赛',
      type: 'tech',
      category: 'tech',
      locationName: '创新实验室',
      location: {
        name: '创新实验室',
        address: '学校创新实验室'
      },
      description: '24小时编程挑战赛，主题为智慧校园，展示编程技能。',
      startTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      registrationDeadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
      enrollStartTime: new Date().toISOString(),
      enrollEndTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
      currentParticipants: 8,
      maxParticipants: 20,
      organizer: {
        id: defaultOrganizerId + 3,
        name: '计算机学院',
        avatar: 'https://via.placeholder.com/150',
        role: '组织者',
        creditScore: 96
      },
      distance: 1.2,
      isEnrolled: false,
      isApproved: false,
      status: 'open',
      participants: [],
      enrollments: []
    },
    {
      id: 4,
      title: '校园音乐节',
      type: 'culture',
      category: 'culture',
      locationName: '露天剧场',
      location: {
        name: '露天剧场',
        address: '学校露天剧场'
      },
      description: '年度校园音乐盛典，邀请校内知名乐队和校外专业音乐人同台演出。涵盖摇滚、民谣、流行等多种音乐风格。',
      startTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
      registrationDeadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
      enrollStartTime: new Date().toISOString(),
      enrollEndTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
      currentParticipants: 156,
      maxParticipants: 1000,
      organizer: {
        id: defaultOrganizerId + 4,
        name: '学生会文艺部',
        avatar: 'https://via.placeholder.com/150',
        role: '组织者',
        creditScore: 94
      },
      distance: 0.6,
      isEnrolled: false,
      isApproved: false,
      status: 'open',
      participants: [],
      enrollments: []
    },
    {
      id: 5,
      title: '篮球友谊赛',
      type: 'sports',
      category: 'sports',
      locationName: '篮球场1',
      location: {
        name: '篮球场1',
        address: '学校篮球场1'
      },
      description: '周末篮球比赛，欢迎所有篮球爱好者参加。活动将在学校篮球场举行，请自带运动装备。',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
      registrationDeadline: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      enrollStartTime: new Date().toISOString(),
      enrollEndTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      currentParticipants: 4,
      maxParticipants: 8,
      organizer: {
        id: defaultOrganizerId,
        name: '篮球社',
        avatar: 'https://via.placeholder.com/150',
        role: '组织者',
        creditScore: 95
      },
      distance: 0.5,
      isEnrolled: false,
      isApproved: false,
      status: 'open',
      participants: [],
      enrollments: []
    }
  ]
  
  console.log('📋 默认活动数据生成完成，包含', defaultActivities.length, '个活动:')
  defaultActivities.forEach(activity => {
    console.log(`  - ${activity.title} (${activity.type})`)
  })
  
  return defaultActivities
}

// 使用 defineStore 创建 store
const useActivityStore = defineStore('activity', () => {
  const activities = ref(loadActivitiesFromStorage())
  
  const loading = ref(false)

  // 保存活动数据到localStorage
  const saveActivitiesToStorage = () => {
    try {
      // 转换Date对象为字符串以便JSON序列化
      const activitiesToSave = activities.value.map(activity => ({
        ...activity,
        startTime: activity.startTime instanceof Date ? activity.startTime.toISOString() : activity.startTime,
        endTime: activity.endTime instanceof Date ? activity.endTime.toISOString() : activity.endTime,
        registrationDeadline: activity.registrationDeadline instanceof Date ? activity.registrationDeadline.toISOString() : activity.registrationDeadline,
        enrollStartTime: activity.enrollStartTime instanceof Date ? activity.enrollStartTime.toISOString() : activity.enrollStartTime,
        enrollEndTime: activity.enrollEndTime instanceof Date ? activity.enrollEndTime.toISOString() : activity.enrollEndTime
      }))
      localStorage.setItem('campus_activities', JSON.stringify(activitiesToSave))
      console.log('✅ 活动数据已保存到localStorage')
    } catch (error) {
      console.error('❌ 保存活动数据失败:', error)
    }
  }

  const loadActivities = async (forceReset = false) => {
    loading.value = true
    try {
      console.log('🔄 加载活动数据...', forceReset ? '(强制重置)' : '')
      
      // 只有在明确指定时才强制重置数据
      if (forceReset) {
        // 强制清理localStorage并使用默认数据
        console.log('🗑️ 强制清理localStorage中的活动数据')
        localStorage.removeItem('campus_activities')
        activities.value = loadActivitiesFromStorage()
        console.log('✅ 活动数据已重置为默认数据')
      } else {
        // 从localStorage重新加载
        activities.value = loadActivitiesFromStorage()
        console.log('✅ 活动数据加载完成')
      }

      // 验证数据完整性
      const titles = activities.value.map(a => a.title)
      const uniqueTitles = [...new Set(titles)]
      
      if (uniqueTitles.length === 1 && uniqueTitles[0] === '中医养生讲座') {
        console.warn('⚠️ 检测到数据污染，强制重新加载')
        localStorage.removeItem('campus_activities')
        activities.value = loadActivitiesFromStorage()
      }

    } catch (error) {
      console.error('❌ 加载活动列表失败:', error)
      // 出错时也使用默认数据
      activities.value = loadActivitiesFromStorage()
    } finally {
      loading.value = false
    }
  }
  
  // 清理localStorage中的活动数据
  const clearActivitiesStorage = () => {
    try {
      localStorage.removeItem('campus_activities')
      activities.value = []
      console.log('✅ localStorage中的活动数据已清理')
      return true
    } catch (error) {
      console.error('❌ 清理活动数据失败:', error)
      return false
    }
  }

  const createNewActivity = async (activityData) => {
    try {
      const userStore = useUserStore()
      const currentUser = userStore.userInfo
      
      console.log('当前用户信息:', currentUser)
      console.log('接收到的活动数据:', activityData)
      
      // 导入API
      const { createActivity } = await import('@/api/activity')
      
      // 准备API所需的数据格式
      const apiActivityData = {
        title: activityData.title,
        description: activityData.description,
        category: activityData.category || activityData.type || 'other',
        startTime: activityData.startTime,
        endTime: activityData.endTime,
        location: {
          name: activityData.location?.name || activityData.location || '',
          address: activityData.location?.address || ''
        },
        latitude: activityData.coords?.[1] || null,
        longitude: activityData.coords?.[0] || null,
        maxParticipants: activityData.maxParticipants || 20,
        tags: activityData.tags || [],
        joinType: activityData.requiresApproval ? 'application' : 'free',
        teamId: activityData.teamId || null
      }
      
      console.log('准备发送到API的活动数据:', apiActivityData)
      
      // 调用API创建活动
      const response = await createActivity(apiActivityData)
      
      if (!response.success) {
        throw new Error(response.message || '创建活动失败')
      }
      
      console.log('API返回的活动数据:', response.data)
      
      // 不直接添加到本地数组，而是重新从localStorage加载最新数据
      // 这样确保数据一致性
      await loadActivities()
      
      // 找到新创建的活动
      const newActivity = activities.value.find(a => a.id === response.data.id)
      
      if (!newActivity) {
        console.warn('⚠️ 新创建的活动未在列表中找到，尝试手动添加')
        // 如果没找到，手动添加API返回的数据
        const manualActivity = {
          ...response.data,
          // 添加本地所需的额外字段
          locationName: response.data.location?.name || response.data.location || '',
          isEnrolled: false,
          isApproved: false,
          isCreator: true,
          distance: 0,
          participants: []
        }
        activities.value.unshift(manualActivity)
        saveActivitiesToStorage()
        return manualActivity
      }
      
      return newActivity
    } catch (error) {
      console.error('创建活动失败:', error)
      throw error
    }
  }

  const enrollInActivity = async (activityId) => {
    try {
      const activity = activities.value.find(a => a.id === activityId)
      if (activity) {
        activity.isEnrolled = true
        activity.currentParticipants += 1
        // 保存到localStorage
        saveActivitiesToStorage()
      }
    } catch (error) {
      console.error('报名活动失败:', error)
      throw error
    }
  }

  // 更新活动
  const updateActivity = async (activityId, updateData) => {
    try {
      const activityIndex = activities.value.findIndex(a => a.id === activityId)
      if (activityIndex === -1) {
        throw new Error('活动不存在')
      }

      // 更新活动数据
      const updatedActivity = {
        ...activities.value[activityIndex],
        ...updateData,
        // 确保更新时间戳
        updatedAt: new Date()
      }

      // 更新活动列表中的活动
      activities.value[activityIndex] = updatedActivity

      // 保存到localStorage
      saveActivitiesToStorage()

      console.log('✅ 活动更新成功:', updatedActivity)
      return updatedActivity
    } catch (error) {
      console.error('更新活动失败:', error)
      throw error
    }
  }

  // 根据ID获取活动
  const getActivityById = (activityId) => {
    const activity = activities.value.find(a => a.id === activityId)
    if (!activity) {
      return null
    }

    // 确保日期对象是Date类型
    return {
      ...activity,
      startTime: activity.startTime instanceof Date ? activity.startTime : new Date(activity.startTime),
      endTime: activity.endTime instanceof Date ? activity.endTime : new Date(activity.endTime),
      registrationDeadline: activity.registrationDeadline ? 
        (activity.registrationDeadline instanceof Date ? activity.registrationDeadline : new Date(activity.registrationDeadline)) : 
        null
    }
  }

  return {
    activities,
    loading,
    loadActivities,
    createNewActivity,
    enrollInActivity,
    updateActivity,
    getActivityById,
    clearActivitiesStorage,
    saveActivitiesToStorage
  }
})

// 确保正确导出
export { useActivityStore }
export default useActivityStore