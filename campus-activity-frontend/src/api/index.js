// 统一API入口
// 整合所有API调用，避免重复导入

// 导入验证工具
import {
  validateLoginParams,
  validateRegisterParams,
  validateActivityParams,
  validateJoinActivityParams,
  validatePaginationParams,
  sanitizeData,
  removeEmptyFields
} from '../utils/validation'

import {
  handleApiError,
  createValidationError,
  createNetworkError,
  createAuthError,
  createNotFoundError
} from '../utils/errorHandler'

// 导入所有API函数
import {
  login,
  register,
  logout,
  changePassword
} from './auth'

import {
  createActivity,
  joinActivity,
  agreeJoinActivity,
  checkInActivity,
  sendActivityChat,
  getActivityList,
  getActivityDetail,
  getActivityChatHistory
} from './activity'

import {
  getUserInfo,
  updateUserInfo
} from './user'

import {
  getTeamList,
  createTeam,
  joinTeam
} from './team'

import {
  sendMessage,
  getMessageHistory
} from './chat'

import {
  updateLocation,
  getNearbyActivities
} from './location'

// 认证相关API
export {
  login,
  register,
  logout,
  changePassword
} from './auth'

// 活动相关API
export {
  createActivity,
  joinActivity,
  agreeJoinActivity,
  checkInActivity,
  sendActivityChat,
  getActivityList,
  getActivityDetail,
  getActivityChatHistory
} from './activity'

// 用户相关API
export {
  getUserInfo,
  updateUserInfo
} from './user'

// 团队相关API
export {
  getTeamList,
  createTeam,
  joinTeam
} from './team'

// 聊天相关API
export {
  sendMessage,
  getMessageHistory
} from './chat'

// 位置相关API
export {
  updateLocation,
  getNearbyActivities
} from './location'

// 导出验证工具
export {
  validateLoginParams,
  validateRegisterParams,
  validateActivityParams,
  validateJoinActivityParams,
  validatePaginationParams,
  sanitizeData,
  removeEmptyFields,
  handleApiError,
  createValidationError,
  createNetworkError,
  createAuthError,
  createNotFoundError
}

// 带验证的API包装函数
export const validatedApi = {
  // 带验证的登录
  login: async (credentials) => {
    try {
      const validatedCredentials = await validateLoginParams(credentials)
      const authModule = await import('./auth')
      return await authModule.login(validatedCredentials)
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // 带验证的注册
  register: async (userData) => {
    try {
      const validatedUserData = await validateRegisterParams(userData)
      const authModule = await import('./auth')
      return await authModule.register(validatedUserData)
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // 带验证的活动创建
  createActivity: async (activityData) => {
    try {
      const validatedActivityData = await validateActivityParams(activityData)
      const activityModule = await import('./activity')
      return await activityModule.createActivity(validatedActivityData)
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // 带验证的加入活动
  joinActivity: async (enrollmentData) => {
    try {
      const validatedEnrollmentData = await validateJoinActivityParams(enrollmentData)
      const activityModule = await import('./activity')
      return await activityModule.joinActivity(validatedEnrollmentData)
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // 带验证的活动列表查询
  getActivityList: async (params) => {
    try {
      const validatedParams = await validatePaginationParams(params)
      const activityModule = await import('./activity')
      return await activityModule.getActivityList(validatedParams)
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // 带验证的退出登录
  logout: async () => {
    try {
      const authModule = await import('./auth')
      return await authModule.logout()
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // 带验证的修改密码
  changePassword: async (passwordData) => {
    try {
      const authModule = await import('./auth')
      return await authModule.changePassword(passwordData)
    } catch (error) {
      throw handleApiError(error)
    }
  }
}

// 默认导出所有API
const apiExports = {
  // 验证工具
  validateLoginParams,
  validateRegisterParams,
  validateActivityParams,
  validateJoinActivityParams,
  validatePaginationParams,
  sanitizeData,
  removeEmptyFields,

  // 错误处理工具
  handleApiError,
  createValidationError,
  createNetworkError,
  createAuthError,
  createNotFoundError,

  // 带验证的API
  validatedApi
}

// 动态添加其他API函数
const addApiFunctions = async () => {
  const authModule = await import('./auth')
  const activityModule = await import('./activity')
  const userModule = await import('./user')
  const teamModule = await import('./team')
  const chatModule = await import('./chat')
  const locationModule = await import('./location')

  // 认证
  apiExports.login = authModule.login
  apiExports.register = authModule.register
  apiExports.logout = authModule.logout
  apiExports.changePassword = authModule.changePassword

  // 活动
  apiExports.createActivity = activityModule.createActivity
  apiExports.joinActivity = activityModule.joinActivity
  apiExports.agreeJoinActivity = activityModule.agreeJoinActivity
  apiExports.checkInActivity = activityModule.checkInActivity
  apiExports.sendActivityChat = activityModule.sendActivityChat
  apiExports.getActivityList = activityModule.getActivityList
  apiExports.getActivityDetail = activityModule.getActivityDetail
  apiExports.getActivityChatHistory = activityModule.getActivityChatHistory

  // 用户
  apiExports.getUserInfo = userModule.getUserInfo
  apiExports.updateUserInfo = userModule.updateUserInfo

  // 团队
  apiExports.getTeamList = teamModule.getTeamList
  apiExports.createTeam = teamModule.createTeam
  apiExports.joinTeam = teamModule.joinTeam

  // 聊天
  apiExports.sendMessage = chatModule.sendMessage
  apiExports.getMessageHistory = chatModule.getMessageHistory

  // 位置
  apiExports.updateLocation = locationModule.updateLocation
  apiExports.getNearbyActivities = locationModule.getNearbyActivities
}

// 初始化API函数
addApiFunctions()

export default apiExports