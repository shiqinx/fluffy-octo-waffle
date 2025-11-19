// @/stores/userStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)  // 初始状态为null，登录后再设置用户信息
  const currentCreditScore = ref(0)
  const userStats = ref({
    createdActivities: 0,
    joinedActivities: 0,
    creditScore: 100,
    completionRate: 0
  })
  const loading = ref(false)
  const error = ref(null)

  // 计算属性：获取用户ID
  const userId = computed(() => userInfo.value?.id || null)
  
  // 计算属性：获取用户名
  const userName = computed(() => userInfo.value?.realName || userInfo.value?.name || '用户')

  // 设置用户信息
  const setUserInfo = (info) => {
    userInfo.value = info
    if (info && info.creditScore) {
      currentCreditScore.value = info.creditScore
      userStats.value.creditScore = info.creditScore
    }
  }

  // 更新用户信息
  const updateUserInfo = (updates) => {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...updates }
      // 如果更新包含信誉分，同步更新信誉分
      if (updates.creditScore !== undefined) {
        currentCreditScore.value = updates.creditScore
        userStats.value.creditScore = updates.creditScore
      }
    }
  }

  // 更新用户资料（用于编辑页面）
  const updateUserProfile = async (profileData) => {
    try {
      loading.value = true
      error.value = null
      
      // 模拟API调用
      // const response = await axios.put('/api/user/profile', profileData)
      // updateUserInfo(response.data)
      
      // 模拟成功响应
      if (userInfo.value) {
        updateUserInfo(profileData)
      } else {
        // 如果没有用户信息，直接设置
        userInfo.value = { ...profileData }
      }
      
      // 保存到本地存储
      if (localStorage) {
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
      }
      
      console.log('用户资料更新成功')
      return true
    } catch (err) {
      error.value = err.message || '更新用户资料失败'
      loading.value = false
      throw new Error(error.value)
    } finally {
      loading.value = false
    }
  }

  // 更新信誉分
  const updateCreditScore = (scoreChange, reason, activityId) => {
    currentCreditScore.value += scoreChange
    userStats.value.creditScore += scoreChange
    if (userInfo.value) {
      userInfo.value.creditScore = currentCreditScore.value
    }
    console.log(`信誉分更新: ${scoreChange}, 原因: ${reason}, 活动ID: ${activityId}`)
  }

  // 修改头像
  const changeAvatar = async (avatarFile) => {
    try {
      loading.value = true
      error.value = null
      
      // 这里应该实现真实的头像上传逻辑
      // 模拟API调用
      // const formData = new FormData()
      // formData.append('avatar', avatarFile)
      // const response = await axios.post('/api/user/avatar', formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data'
      //   }
      // })
      
      // 模拟成功响应
      const reader = new FileReader()
      reader.readAsDataURL(avatarFile)
      return new Promise((resolve) => {
        reader.onload = () => {
          const avatarUrl = reader.result
          updateUserInfo({ avatar: avatarUrl })
          loading.value = false
          resolve(avatarUrl)
        }
      })
    } catch (err) {
      error.value = err.message || '头像更新失败'
      loading.value = false
      throw new Error(error.value)
    }
  }

  // 获取用户统计数据
  const fetchUserStats = async () => {
    try {
      loading.value = true
      error.value = null
      
      // 模拟API调用
      // const response = await axios.get('/api/user/stats')
      // userStats.value = response.data
      
      // 模拟数据
      userStats.value = {
        createdActivities: 5,
        joinedActivities: 12,
        creditScore: currentCreditScore.value,
        completionRate: 85
      }
      
      return userStats.value
    } catch (err) {
      error.value = err.message || '获取用户统计数据失败'
      loading.value = false
      throw new Error(error.value)
    } finally {
      loading.value = false
    }
  }

  // 获取用户详情
  const fetchUserDetail = async () => {
    try {
      loading.value = true
      error.value = null
      
      // 模拟API调用
      // const response = await axios.get('/api/user/detail')
      // setUserInfo(response.data)
      
      // 模拟数据
      const mockUserInfo = {
        id: '1',
        realName: '张三',
        studentId: '2022001001',
        department: '计算机科学与技术学院',
        avatar: '',
        email: 'zhangsan@example.com',
        phone: '13800138000',
        major: '计算机科学与技术',
        grade: '2022级',
        creditScore: 95,
        createdAt: '2023-09-01'
      }
      
      setUserInfo(mockUserInfo)
      return mockUserInfo
    } catch (err) {
      error.value = err.message || '获取用户详情失败'
      loading.value = false
      throw new Error(error.value)
    } finally {
      loading.value = false
    }
  }

  // 清除用户信息（登出）
  const clearUserInfo = () => {
    userInfo.value = null
    currentCreditScore.value = 0
    userStats.value = {
      createdActivities: 0,
      joinedActivities: 0,
      creditScore: 100,
      completionRate: 0
    }
  }

  // 退出登录
  const logout = () => {
    clearUserInfo()
    // 清除本地存储中的令牌和用户信息
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    console.log('用户已退出登录')
  }

  return {
    userInfo,
    currentCreditScore,
    userStats,
    userId,
    userName,
    loading,
    error,
    setUserInfo,
    updateUserInfo,
    updateUserProfile,
    updateCreditScore,
    changeAvatar,
    fetchUserStats,
    fetchUserDetail,
    clearUserInfo,
    logout
  }
})