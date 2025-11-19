// @/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { validatedApi } from '@/api'
import { handleApiError } from '@/utils/errorHandler'
import { useUserStore } from './userStore'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const loading = ref(false)
  const error = ref(null)

  // 安全地从 localStorage 读取数据
  const getStoredItem = (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key)
      if (item === null || item === 'undefined') {
        return defaultValue
      }
      
      // token 是字符串，不需要 JSON.parse
      if (key === 'token') {
        return item
      }
      
      // user 和 loginTime 需要 JSON.parse
      return JSON.parse(item)
    } catch (error) {
      console.error(`读取 ${key} 失败:`, error)
      // 如果解析失败，尝试清理损坏的数据
      try {
        localStorage.removeItem(key)
      } catch (removeError) {
        console.error(`清理 ${key} 失败:`, removeError)
      }
      return defaultValue
    }
  }

  const token = ref(getStoredItem('token'))
  const user = ref(getStoredItem('user'))
  const loginTime = ref(getStoredItem('loginTime', null))

  const isAuthenticated = computed(() => {
    if (!token.value || !loginTime.value) {
      console.log('❌ 认证失败: token或loginTime为空')
      return false
    }
    
    // 检查是否超过4小时
    const loginTimestamp = parseInt(loginTime.value)
    const currentTime = Date.now()
    const fourHours = 4 * 60 * 60 * 1000
    
    if (currentTime - loginTimestamp > fourHours) {
      console.log('⏰ Token已过期')
      // 只清除数据，不调用 logoutUser 避免循环
      clearAuth()
      return false
    }
    
    console.log('✅ 认证状态: 已登录')
    return true
  })

  const setAuth = (newToken, userData) => {
    console.log('🔄 设置认证信息:', { newToken, userData })
    
    token.value = newToken
    user.value = userData
    loginTime.value = Date.now().toString()
    
    // 安全地存储到 localStorage
    try {
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('loginTime', loginTime.value)
      console.log('💾 认证信息已保存到localStorage')
    } catch (error) {
      console.error('存储到localStorage失败:', error)
    }
  }

  const clearAuth = () => {
    console.log('🧹 清除认证信息')
    
    token.value = null
    user.value = null
    loginTime.value = null
    
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('loginTime')
      // 清除位置权限请求标记，这样下次登录时会重新请求
      localStorage.removeItem('locationPermissionRequested')
      console.log('🗑️ localStorage已清理，包括位置权限标记')
    } catch (error) {
      console.error('清理localStorage失败:', error)
    }
  }

  const loginUser = async (studentId, password) => {
    try {
      console.log('🔐 开始用户登录')
      console.log('🔍 接收到的参数:')
      console.log('- studentId:', studentId)
      console.log('- studentId 类型:', typeof studentId)
      console.log('- studentId 长度:', studentId ? studentId.length : 'N/A')
      console.log('- password:', password)
      console.log('- password 类型:', typeof password)
      console.log('- password 长度:', password ? password.length : 'N/A')
      
      // 重要：在登录新用户前，先完全清除旧的认证信息
      console.log('🧹 登录前清除旧认证信息')
      clearAuth()
      
      // 清除userStore中的用户信息
      try {
        const userStore = useUserStore()
        if (userStore && typeof userStore.clearUserInfo === 'function') {
          userStore.clearUserInfo()
          console.log('✅ userStore 数据已清除')
        }
      } catch (error) {
        console.error('清除 userStore 失败:', error)
      }
      
      // 构造登录凭据
      const credentials = { studentId, password, rememberMe: false }
      console.log('📝 构造的登录凭据:', credentials)
      
      // 调用login API，传递正确的参数格式
      console.log('🔍 调用 validatedApi.login')
      const response = await validatedApi.login(credentials)
      console.log('✅ 登录API响应:', response)
      
      if (response && response.success) {
        if (response.data) {
          setAuth(response.data.token, response.data.user)
          
          // 登录成功后不再在登录过程中直接请求位置权限
          // 位置权限请求将在首页正式进行，这里只清除可能存在的旧标记
          try {
            // 清除旧的权限请求标记，让首页能够正常显示权限请求对话框
            localStorage.removeItem('locationPermissionRequested')
            localStorage.removeItem('locationPermissionGranted')
            localStorage.removeItem('lastUserLocation')
            console.log('📍 清除旧的位置权限标记，准备在首页重新请求')
          } catch (error) {
            console.error('清理位置权限标记失败:', error)
          }
          
          return response
        } else {
          throw new Error('登录响应缺少data字段')
        }
      } else {
        // 处理登录失败的情况
        const errorMessage = response?.message || response?.error?.message || '登录失败'
        console.error('❌ 登录失败:', { response, errorMessage })
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('❌ 登录过程错误:', error)
      
      // 如果已经是Error对象，直接抛出
      if (error instanceof Error) {
        clearAuth()
        throw error
      }
      
      // 如果是API返回的错误对象，转换为Error对象
      if (error && typeof error === 'object') {
        const errorMessage = error.message || error.error?.message || '登录失败'
        clearAuth()
        throw new Error(errorMessage)
      }
      
      // 其他情况，使用handleApiError处理
      const apiError = handleApiError(error)
      clearAuth()
      throw new Error(apiError.error?.message || '登录失败')
    }
  }

  const registerUser = async (userData) => {
    try {
      console.log('📝 开始用户注册:', userData)
      const response = await validatedApi.register(userData)
      console.log('✅ 注册API响应:', response)
      return response
    } catch (error) {
      console.error('❌ 注册过程错误:', error)
      const apiError = handleApiError(error)
      throw apiError.error || apiError
    }
  }

  // 修改密码
  const changePassword = async (passwordData) => {
    try {
      console.log('🔐 开始修改密码')
      loading.value = true
      error.value = null
      
      const response = await validatedApi.changePassword(passwordData)
      console.log('✅ 修改密码API响应:', response)
      return response
    } catch (error) {
      console.error('❌ 修改密码过程错误:', error)
      const apiError = handleApiError(error)
      error.value = apiError.error?.message || apiError.message || '修改密码失败'
      throw apiError
    } finally {
      loading.value = false
    }
  }

  const logoutUser = async () => {
    console.log('🚪 用户退出登录')
    
    // 先清除数据
    clearAuth()
    
    // 然后调用 API 退出
    try {
      await validatedApi.logout()
      console.log('✅ 退出API调用成功')
    } catch (error) {
      console.error('退出API调用失败:', error)
      // 即使API调用失败，本地也要清除状态
    }
    
    // 清除 user store 的数据
    try {
      const userStore = useUserStore()
      if (userStore && typeof userStore.clearUserInfo === 'function') {
        userStore.clearUserInfo()
        console.log('✅ userStore 数据已清除')
      }
    } catch (error) {
      console.error('清除 userStore 失败:', error)
    }
  }

  // 初始化时清理可能损坏的数据
  const initialize = () => {
    console.log('🔧 初始化认证store')
    console.log('📊 当前认证状态:', {
      token: token.value ? '存在' : '空',
      user: user.value ? '存在' : '空', 
      loginTime: loginTime.value ? '存在' : '空'
    })
    
    // 清理所有可能损坏的数据
    const keysToCheck = ['token', 'user', 'loginTime']
    keysToCheck.forEach(key => {
      const item = localStorage.getItem(key)
      if (item === 'undefined' || item === 'null') {
        localStorage.removeItem(key)
        console.log(`🧹 清理损坏的 ${key} 数据`)
      }
    })
  }

  // 立即调用初始化
  initialize()

  return {
    token,
    user,
    userInfo: user, // 为了兼容性，添加 userInfo 别名
    loading,
    error,
    loginTime,
    isAuthenticated,
    loginUser,
    registerUser,
    logoutUser,
    changePassword,
    clearAuth,
    setAuth,
    initialize
  }
})