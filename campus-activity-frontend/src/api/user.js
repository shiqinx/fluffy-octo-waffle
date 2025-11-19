import request from '@/utils/request'
import { 
  mockUpdateUserProfile, 
  mockUploadAvatar,
  mockUserRegister, 
  mockUserLogin, 
  mockUserLogout, 
  mockChangePassword, 
  mockSaveUserLocation
} from './mock'

// 检查是否使用模拟数据
const useMock = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_BASE_URL

// 获取用户信息
export const getUserInfo = () => {
  if (useMock) {
    const { mockGetUserInfo } = require('./mock')
    const token = localStorage.getItem('token')
    return mockGetUserInfo(token)
  }
  return request.get('/user/info')
}

// 更新用户信息
export const updateUserInfo = (data) => {
  if (useMock) {
    // 模拟更新用户信息
    return Promise.resolve({
      success: true,
      message: '更新成功',
      data: { ...data }
    })
  }
  return request.put('/user/info', data)
}

// 获取用户统计信息
export const getUserStatistics = () => {
  if (useMock) {
    // 模拟用户统计信息
    return Promise.resolve({
      success: true,
      data: {
        totalActivities: 15,
        joinedActivities: 8,
        createdTeams: 3,
        joinedTeams: 5
      }
    })
  }
  return request.get('/user/statistics')
}

// 用户注册（/api/user/register）
export const userRegister = (data) => {
  if (useMock) {
    return mockUserRegister(data)
  }
  return request.post('/api/user/register', data)
}

// 用户登录（/api/user/login）
export const userLogin = (data) => {
  if (useMock) {
    return mockUserLogin(data)
  }
  return request.post('/api/user/login', data)
}

// 用户退出（/api/user/logout）
export const userLogout = () => {
  if (useMock) {
    return mockUserLogout()
  }
  return request.post('/api/user/logout')
}

// 修改密码（/api/user/change-password）
export const changeUserPassword = (data) => {
  if (useMock) {
    return mockChangePassword(data)
  }
  return request.post('/api/user/change-password', data)
}

// 保存用户位置（/api/user-location/save）
export const saveUserLocation = (locationData) => {
  console.log('user.js - 保存用户位置，原始数据:', locationData)
  
  // 数据验证和转换（与location.js保持一致）
  if (!locationData) {
    return Promise.reject(new Error('位置数据不能为空'))
  }
  
  if (typeof locationData.latitude !== 'number' || typeof locationData.longitude !== 'number') {
    return Promise.reject(new Error('位置数据必须包含有效的经纬度信息'))
  }
  
  if (typeof locationData.userId !== 'number') {
    return Promise.reject(new Error('用户ID必须是有效的数字'))
  }
  
  if (!locationData.validTime || typeof locationData.validTime !== 'number' || locationData.validTime <= 0) {
    return Promise.reject(new Error('有效时间必须是大于0的数字'))
  }
  
  // 构建符合后端userLocationRequest接口的请求数据
  const userLocationRequest = {
    userId: locationData.userId,
    latitude: locationData.latitude,
    longitude: locationData.longitude,
    validTime: locationData.validTime,
    address: locationData.address || '',
    timestamp: locationData.timestamp || new Date().toISOString(),
    accuracy: locationData.accuracy || null
  }
  
  console.log('user.js - 发送到后端的数据:', userLocationRequest)
  
  if (useMock) {
    return mockSaveUserLocation(userLocationRequest)
  }
  
  return request.post('/api/user-location/save', userLocationRequest)
}

/**
 * 更新用户资料
 * @param {Object} profileData - 用户资料数据
 * @returns {Promise}
 */
export const updateUserProfile = (profileData) => {
  if (useMock) {
    return mockUpdateUserProfile(profileData)
  }
  
  // 真实API调用
  return request.put('/user/profile', profileData)
}

/**
 * 上传用户头像
 * @param {File} file - 头像文件
 * @returns {Promise}
 */
export const uploadAvatar = (file) => {
  if (useMock) {
    return mockUploadAvatar(file)
  }
  
  // 真实API调用
  const formData = new FormData()
  formData.append('avatar', file)
  
  return request.post('/user/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取用户详情
 * @param {number} userId - 用户ID
 * @returns {Promise}
 */
export const getUserDetail = (userId) => {
  if (useMock) {
    // 在模拟模式下，我们可以复用 mockGetUserInfo 或创建新的模拟函数
    const { mockGetUserInfo } = require('./mock')
    return mockGetUserInfo(localStorage.getItem('token'))
  }
  
  // 真实API调用
  return request.get(`/user/${userId}`)
}

/**
 * 更新用户标签
 * @param {Array} tags - 标签数组
 * @returns {Promise}
 */
export const updateUserTags = (tags) => {
  if (useMock) {
    // 模拟更新标签
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          data: { tags },
          message: '标签更新成功'
        })
      }, 500)
    })
  }
  
  // 真实API调用
  return request.put('/user/tags', { tags })
}