import request from './request'
import { mockApi } from './mock'

// 所有API都直接使用模拟数据，不进行任何真实请求
export const login = (data) => {
  console.log('🔐 模拟登录请求:', data)
  return mockApi.login(data)
}

export const register = (userData) => {
  console.log('📝 模拟注册请求:', userData)
  return mockApi.register(userData)
}

export const logout = () => {
  console.log('🚪 模拟退出登录')
  return Promise.resolve({ code: 200, message: '退出成功' })
}

export const fetchActivities = (params = {}) => {
  console.log('📋 模拟获取活动列表:', params)
  return mockApi.getActivities(params)
}

export const fetchNearbyActivities = (location, radius = 5000) => {
  console.log('📍 模拟获取附近活动:', { location, radius })
  return mockApi.getNearbyActivities(location, radius)
}

export const fetchActivityDetail = (id) => {
  console.log('📄 模拟获取活动详情:', id)
  return mockApi.getActivityDetail(id)
}

export const createActivity = (activityData) => {
  console.log('➕ 模拟创建活动:', activityData)
  return mockApi.createActivity(activityData)
}

export const enrollActivity = (activityId) => {
  console.log('✅ 模拟报名活动:', activityId)
  return mockApi.enrollActivity(activityId)
}

export const approveEnrollment = (activityId, userId) => {
  console.log('👍 模拟审核通过:', { activityId, userId })
  return Promise.resolve({ 
    code: 200, 
    message: '审核通过成功',
    data: { activityId, userId }
  })
}

export const rejectEnrollment = (activityId, userId) => {
  console.log('👎 模拟审核拒绝:', { activityId, userId })
  return Promise.resolve({ 
    code: 200, 
    message: '审核拒绝成功',
    data: { activityId, userId }
  })
}

export const fetchTeams = (params = {}) => {
  console.log('👥 模拟获取团队列表:', params)
  return mockApi.getTeams(params)
}

export const createTeam = (teamData) => {
  console.log('🏗️ 模拟创建团队:', teamData)
  return mockApi.createTeam(teamData)
}

export const quickMatch = (preferences) => {
  console.log('🎯 模拟快速匹配:', preferences)
  return mockApi.quickMatch(preferences)
}

export const joinTeam = (teamId) => {
  console.log('🤝 模拟加入团队:', teamId)
  return Promise.resolve({ 
    code: 200, 
    message: '加入团队成功',
    data: { teamId }
  })
}

export const updateLocation = (location) => {
  console.log('🗺️ 模拟更新位置:', location)
  return Promise.resolve({ 
    code: 200, 
    message: '位置更新成功',
    data: location 
  })
}

export const checkIn = (activityId, location) => {
  console.log('📍 模拟位置签到:', { activityId, location })
  return Promise.resolve({ 
    code: 200, 
    message: '签到成功',
    data: { activityId, location }
  })
}

export const fetchMessages = (activityId) => {
  console.log('💬 模拟获取消息:', activityId)
  return mockApi.getMessages(activityId)
}

export const sendMessage = (activityId, content) => {
  console.log('✉️ 模拟发送消息:', { activityId, content })
  return mockApi.sendMessage(activityId, content)
}

export const changePassword = (passwordData) => {
  console.log('🔐 修改密码请求:', passwordData)
  return mockApi.changePassword(passwordData)
}

export const fetchUserProfile = () => {
  console.log('👤 模拟获取用户信息')
  return mockApi.getUserProfile()
}

export const updateUserProfile = (profileData) => {
  console.log('✏️ 模拟更新用户信息:', profileData)
  return Promise.resolve({ 
    code: 200, 
    message: '更新成功',
    data: profileData 
  })
}

export const fetchMyActivities = (type = 'all') => {
  console.log('📊 模拟获取我的活动:', type)
  return mockApi.getMyActivities(type)
}

export const fetchMyTeams = () => {
  console.log('🏆 模拟获取我的团队')
  return mockApi.getMyTeams()
}

export const uploadImage = (file) => {
  console.log('🖼️ 模拟上传图片:', file.name)
  return Promise.resolve({ 
    code: 200, 
    message: '上传成功',
    data: { 
      url: 'https://example.com/uploaded-image.jpg',
      filename: file.name 
    }
  })
}

// 默认导出
export default {
  login,
  register,
  logout,
  changePassword,
  fetchActivities,
  fetchNearbyActivities,
  fetchActivityDetail,
  createActivity,
  enrollActivity,
  approveEnrollment,
  rejectEnrollment,
  fetchTeams,
  createTeam,
  quickMatch,
  joinTeam,
  updateLocation,
  checkIn,
  fetchMessages,
  sendMessage,
  fetchUserProfile,
  updateUserProfile,
  fetchMyActivities,
  fetchMyTeams,
  uploadImage
}