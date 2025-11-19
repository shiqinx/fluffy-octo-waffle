import request from '@/utils/request'
import {
  mockLogin,
  mockRegister,
  mockChangePassword,
  mockGetUserInfo
} from './mock'
import { 
  convertToUserRegisterRequest,
  convertToUserLoginRequest,
  convertToChangePasswordRequest
} from '@/utils/dataModelConverter'
import { 
  createValidationError,
  createAuthError,
  createNetworkError,
  createNotFoundError,
  handleApiError
} from '@/utils/errorHandler'
import {
  validateLoginParams,
  validateRegisterParams,
  validateActivityParams
} from '@/utils/validation'

// 检查是否使用模拟数据
const useMock = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_BASE_URL

// 用户登录（UserController）
// POST /api/user/login
export const login = async (data) => {
  try {
    // 参数验证
    const validatedCredentials = await validateLoginParams(data)
    const { studentId: validatedUserId, password: validatedPassword } = validatedCredentials
    
    console.log('🔐 登录API调用:', { studentId: validatedUserId, passwordLength: validatedPassword.length })
    
    // 转换为后端UserLoginRequest格式
    const loginRequest = convertToUserLoginRequest({
      userId: validatedUserId,
      password: validatedPassword,
      userPassword: validatedPassword,
      rememberMe: data.rememberMe || false
    })
    
    if (useMock) {
      const response = await mockLogin({
        studentId: validatedUserId,
        password: validatedPassword
      })
      // 验证响应格式
      if (!response || !response.success || !response.data) {
        throw new Error('无效的响应格式')
      }
      return {
        success: true,
        message: response.message || '登录成功',
        data: {
          token: response.data.token || '',
          user: response.data.user || {},
          expiresIn: response.data.expiresIn || null
        }
      }
    }
    
    const response = await request.post('/api/user/login', loginRequest)
    
    // 适配后端JWT响应格式
    const backendData = response.data
    return {
      success: true,
      message: backendData.message || '登录成功',
      data: {
        token: backendData.accessToken || backendData.token || '',
        refreshToken: backendData.refreshToken || '',
        tokenType: backendData.tokenType || 'Bearer',
        user: {
          id: backendData.userId,
          // 其他用户信息可以从后端获取或从token解析
        },
        expiresIn: null,
        rememberMe: backendData.rememberMe || false
      }
    }
  } catch (error) {
    console.error('❌ 登录API错误:', error)
    
    // 处理mockLogin抛出的错误对象
    if (error && typeof error === 'object' && error.success === false && error.message) {
      return {
        success: false,
        message: error.message,
        error: {
          code: 'LOGIN_FAILED',
          message: error.message,
          type: 'BUSINESS_LOGIC_ERROR'
        }
      }
    }
    
    // 处理字符串错误
    if (typeof error === 'string') {
      return {
        success: false,
        message: error,
        error: {
          code: 'LOGIN_FAILED',
          message: error,
          type: 'BUSINESS_LOGIC_ERROR'
        }
      }
    }
    
    // 处理Error对象
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message || '登录失败',
        error: {
          code: 'LOGIN_FAILED',
          message: error.message || '登录失败',
          type: 'BUSINESS_LOGIC_ERROR'
        }
      }
    }
    
    const errorResponse = handleApiError(error, '登录失败')
    
    // 确保错误响应格式一致，同时提供 message 字段和 error 对象
    if (errorResponse.error) {
      return {
        success: false,
        message: errorResponse.error.message || '登录失败',
        error: errorResponse.error
      }
    }
    
    // 兜底处理
    return {
      success: false,
      message: '登录失败',
      error: {
        code: 'LOGIN_FAILED',
        message: '登录失败',
        type: 'BUSINESS_LOGIC_ERROR'
      }
    }
  }
}

// 用户注册（UserController）
// POST /api/user/register
export const register = async (data) => {
  try {
    // 参数验证
    if (!data || typeof data !== 'object') {
      throw new Error('注册参数不能为空')
    }
    if (!data.realName) {
      throw new Error('真实姓名不能为空')
    }
    if (!data.studentId) {
      throw new Error('学号不能为空')
    }
    if (!data.password) {
      throw new Error('密码不能为空')
    }
    
    // 转换为后端UserRegisterRequest格式
    const registerRequest = convertToUserRegisterRequest(data)
    
    if (useMock) {
      const response = await mockRegister(data)
      // 验证响应格式
      if (!response || !response.success) {
        throw new Error('无效的响应格式')
      }
      return {
        success: true,
        message: response.message || '注册成功',
        result: response.data || {}
      }
    }
    
    const response = await request.post('/api/user/register', registerRequest)
    
    // 适配后端响应格式
    const backendData = response.data
    return {
      success: true,
      message: backendData.message || '注册成功',
      result: {
        userId: backendData.userId,
        timestamp: backendData.timestamp
      }
    }
  } catch (error) {
    const errorResponse = handleApiError(error, '注册失败')
    
    // 确保错误响应格式一致，同时提供 message 字段和 error 对象
    if (errorResponse.error) {
      return {
        success: false,
        message: errorResponse.error.message || '注册失败',
        error: errorResponse.error
      }
    }
    
    // 兜底处理
    return {
      success: false,
      message: '注册失败',
      error: {
        code: 'REGISTER_FAILED',
        message: '注册失败',
        type: 'BUSINESS_LOGIC_ERROR'
      }
    }
  }
}

// 获取用户信息（AuthController）
// GET /api/auth/me
export const getUserInfo = async () => {
  try {
    if (useMock) {
      const response = await mockGetUserInfo(localStorage.getItem('token'))
      // 验证响应格式
      if (!response || !response.success || !response.data) {
        throw new Error('无效的响应格式')
      }
      return {
        success: true,
        message: response.message || '获取用户信息成功',
        result: response.data
      }
    }
    const response = await request.get('/api/auth/me')
    // 统一处理响应格式
    return {
      success: true,
      message: '获取用户信息成功',
      result: response.data || {}
    }
  } catch (error) {
    return handleApiError(error, '获取用户信息失败')
  }
}

// 修改密码（UserController）
// POST /api/user/change-password
export const changePassword = async (data) => {
  try {
    // 参数验证
    if (!data || typeof data !== 'object') {
      throw new Error('修改密码参数不能为空')
    }
    if (!data.oldPassword || !data.newPassword) {
      throw new Error('旧密码和新密码不能为空')
    }
    
    // 转换为后端ChangePasswordRequest格式
    const changePasswordRequest = convertToChangePasswordRequest({
      userId: data.userId,
      user_OldPassword: data.oldPassword,
      user_NewPassword: data.newPassword
    })
    
    if (useMock) {
      const response = await mockChangePassword(data)
      // 验证响应格式
      if (!response || !response.success) {
        throw new Error('无效的响应格式')
      }
      return {
        success: true,
        message: response.message || '密码修改成功',
        result: response.data || {}
      }
    }
    
    const response = await request.post('/api/user/change-password', changePasswordRequest)
    
    // 适配后端响应格式
    const backendData = response.data
    return {
      success: true,
      message: backendData.message || '密码修改成功',
      result: {
        userId: backendData.userId,
        timestamp: backendData.timestamp
      }
    }
  } catch (error) {
    const errorResponse = handleApiError(error, '密码修改失败')
    
    // 确保错误响应格式一致，同时提供 message 字段和 error 对象
    if (errorResponse.error) {
      return {
        success: false,
        message: errorResponse.error.message || '密码修改失败',
        error: errorResponse.error
      }
    }
    
    // 兜底处理
    return {
      success: false,
      message: '密码修改失败',
      error: {
        code: 'CHANGE_PASSWORD_FAILED',
        message: '密码修改失败',
        type: 'BUSINESS_LOGIC_ERROR'
      }
    }
  }
}

// 刷新令牌（AuthController）
// POST /api/auth/refresh
export const refreshToken = async () => {
  try {
    if (useMock) {
      // 简单的Mock刷新：检查localStorage中的token
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('未找到有效的token')
      }
      
      const response = {
        success: true,
        message: '令牌刷新成功',
        data: {
          token: token,
          tokenType: 'Bearer'
        }
      }
      
      // 验证响应格式
      if (!response || !response.success || !response.data) {
        throw new Error('无效的响应格式')
      }
      return {
        success: true,
        message: response.message || '令牌刷新成功',
        result: {
          accessToken: response.data.token || '',
          tokenType: 'Bearer',
          expireIn: null
        }
      }
    }
    
    // 适配后端刷新令牌接口，需要从请求头传递Authorization
    const response = await request.post('/api/auth/refresh', {}, {
      headers: {
        // 后端从Authorization头中提取refreshToken
        'Authorization': `Bearer ${localStorage.getItem('refreshToken') || ''}`
      }
    })
    
    // 适配后端JWT刷新响应格式
    const backendData = response.data
    return {
      success: true,
      message: '令牌刷新成功',
      result: {
        accessToken: backendData.accessToken || '',
        tokenType: backendData.tokenType || 'Bearer',
        expiresIn: backendData.expiresIn || null
      }
    }
  } catch (error) {
    return handleApiError(error, '令牌刷新失败')
  }
}

// 用户登出（UserController）
// POST /api/user/logout
export const logout = async () => {
  try {
    if (useMock) {
      // 简单的Mock登出：清除localStorage中的token
      clearToken()
      const response = {
        success: true,
        message: '登出成功',
        data: {}
      }
      
      // 验证响应格式
      if (!response || !response.success) {
        throw new Error('无效的响应格式')
      }
      return {
        success: true,
        message: response.message || '登出成功',
        result: response.data || {}
      }
    }
    
    const response = await request.post('/api/user/logout')
    
    // 适配后端响应格式
    const backendData = response.data
    return {
      success: true,
      message: backendData.message || '登出成功',
      result: {
        userId: backendData.userId,
        timestamp: backendData.timestamp
      }
    }
  } catch (error) {
    return handleApiError(error, '登出失败')
  }
}

// 第三方登录（AuthController）
// POST /api/auth/third-party/login
export const authLogin = async (data) => {
  try {
    // 参数验证
    if (!data || typeof data !== 'object') {
      throw new Error('第三方登录参数不能为空')
    }
    if (!data.provider || !data.code) {
      throw new Error('第三方登录提供者和授权码不能为空')
    }
    
    if (useMock) {
      const response = await mockLogin(loginRequest)
      // 验证响应格式
      if (!response || !response.success || !response.data) {
        throw new Error('无效的响应格式')
      }
      return {
        success: true,
        message: response.message || '第三方登录成功',
        result: {
          token: response.data.token || '',
          user: response.data.user || {},
          expiresIn: response.data.expiresIn || null
        }
      }
    }
    const response = await request.post('/api/auth/third-party/login', data)
    // 统一处理响应格式
    return {
      success: true,
      message: '第三方登录成功',
      result: {
        token: response.data.token || response.data.accessToken || '',
        user: response.data.user || {},
        expiresIn: response.data.expiresIn || null
      }
    }
  } catch (error) {
    return handleApiError(error, '第三方登录失败')
  }
}

// 第三方登录刷新令牌
// POST /api/auth/third-party/refresh
export const authRefreshToken = async () => {
  try {
    if (useMock) {
      // 简单的Mock刷新：检查localStorage中的token
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('未找到有效的token')
      }
      
      const response = {
        success: true,
        message: '第三方令牌刷新成功',
        data: {
          token: token,
          tokenType: 'Bearer'
        }
      }
      
      // 验证响应格式
      if (!response || !response.success || !response.data) {
        throw new Error('无效的响应格式')
      }
      return {
        success: true,
        message: response.message || '令牌刷新成功',
        result: {
          accessToken: response.data.token || '',
          tokenType: 'Bearer',
          expireIn: null
        }
      }
    }
    const response = await request.post('/api/auth/third-party/refresh')
    // 统一处理响应格式
    return {
      success: true,
      message: '令牌刷新成功',
      result: {
        accessToken: response.data.token || response.data.accessToken || '',
        tokenType: response.data.tokenType || 'Bearer',
        expireIn: response.data.expireIn || response.data.expiresIn || null
      }
    }
  } catch (error) {
    return handleApiError(error, '第三方登录令牌刷新失败')
  }
}

// 检查令牌状态（AuthController）
// 检查令牌有效性
// GET /api/auth/check
export const checkToken = async () => {
  try {
    if (useMock) {
      // 简单的Mock检查：检查localStorage中是否有token
      const token = localStorage.getItem('token')
      const response = {
        success: !!token,
        data: {
          valid: !!token,
          userId: token ? getCurrentUserId() : null,
          username: token ? 'Mock用户' : null,
          expiresIn: null
        }
      }
      
      // 验证响应格式
      if (!response || !response.success || !response.data) {
        throw new Error('无效的响应格式')
      }
      return {
        success: true,
        message: '令牌验证成功',
        result: {
          valid: response.data.valid || true,
          userId: response.data.userId || '',
          username: response.data.username || '',
          expiresIn: response.data.expiresIn || null
        }
      }
    }
    
    const response = await request.get('/api/auth/check')
    
    // 适配后端令牌检查响应格式
    const backendData = response.data
    return {
      success: true,
      message: '令牌验证成功',
      result: {
        valid: backendData.valid !== undefined ? backendData.valid : true,
        aboutToExpire: backendData.aboutToExpire || false,
        userId: backendData.userId || '',
        username: backendData.username || '',
        expiresIn: backendData.expiresIn || null
      }
    }
  } catch (error) {
    return handleApiError(error, '令牌验证失败')
  }
}

// Token 辅助函数

/**
 * 存储token到localStorage
 * @param {string} token - 访问令牌
 * @param {number} expiresIn - 过期时间（秒）
 */
export const storeToken = (token, expiresIn = null) => {
  try {
    localStorage.setItem('token', token)
    if (expiresIn) {
      const expirationTime = new Date().getTime() + (expiresIn * 1000)
      localStorage.setItem('tokenExpiration', expirationTime.toString())
    }
  } catch (error) {
    console.error('存储token失败:', error)
  }
}

/**
 * 从localStorage获取token
 * @returns {string|null} token或null
 */
export const getToken = () => {
  try {
    return localStorage.getItem('token')
  } catch (error) {
    console.error('获取token失败:', error)
    return null
  }
}

/**
 * 清除localStorage中的token
 */
export const clearToken = () => {
  try {
    localStorage.removeItem('token')
    localStorage.removeItem('tokenExpiration')
  } catch (error) {
    console.error('清除token失败:', error)
  }
}

/**
 * 检查token是否过期
 * @returns {boolean} 是否已过期
 */
export const isTokenExpired = () => {
  try {
    const expirationTime = localStorage.getItem('tokenExpiration')
    if (!expirationTime) return false
    
    const now = new Date().getTime()
    return now > parseInt(expirationTime)
  } catch (error) {
    console.error('检查token过期状态失败:', error)
    return true
  }
}

/**
 * 验证token格式
 * @param {string} token - 要验证的token
 * @returns {boolean} 是否有效
 */
export const validateTokenFormat = (token) => {
  if (!token || typeof token !== 'string') return false
  // JWT格式检查：通常包含三个部分，由点分隔
  const parts = token.split('.')
  return parts.length === 3
}

// 数据模型转换函数

/**
 * 转换登录响应为统一格式
 * @param {Object} response - 原始响应数据
 * @returns {Object} 统一格式的响应
 */
export const convertToLoginResponse = (response) => {
  if (!response || !response.data) {
    return {
      success: false,
      message: '无效的响应数据',
      result: {}
    }
  }
  
  return {
    success: true,
    message: '登录成功',
    result: {
      token: response.data.token || response.data.accessToken || '',
      user: response.data.user || {},
      expiresIn: response.data.expiresIn || null
    }
  }
}

/**
 * 转换令牌刷新响应为统一格式
 * @param {Object} response - 原始响应数据
 * @returns {Object} 统一格式的响应
 */
export const convertToRefreshTokenResponse = (response) => {
  if (!response || !response.data) {
    return {
      success: false,
      message: '无效的响应数据',
      result: {}
    }
  }
  
  return {
    success: true,
    message: '令牌刷新成功',
    result: {
      accessToken: response.data.token || response.data.accessToken || '',
      tokenType: response.data.tokenType || 'Bearer',
      expireIn: response.data.expireIn || response.data.expiresIn || null
    }
  }
}

/**
 * 转换令牌检查响应为统一格式
 * @param {Object} response - 原始响应数据
 * @returns {Object} 统一格式的响应
 */
export const convertToTokenCheckResponse = (response) => {
  if (!response || !response.data) {
    return {
      success: false,
      message: '无效的响应数据',
      result: {}
    }
  }
  
  return {
    success: true,
    message: '令牌验证成功',
    result: {
      valid: response.data.valid !== undefined ? response.data.valid : true,
      userId: response.data.userId || response.data.id || '',
      username: response.data.username || '',
      expiresIn: response.data.expiresIn || response.data.expireIn || null
    }
  }
}