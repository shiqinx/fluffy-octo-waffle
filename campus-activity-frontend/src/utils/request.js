// @/utils/request.js
import axios from 'axios'
import { showToast } from 'vant'
import { useAuthStore } from '@/stores/auth'
import { useMock, getApiBaseUrl, isDevelopment } from './env'

// 创建axios实例
const request = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    console.log('🚀 发起请求:', {
      url: config.url,
      method: config.method,
      data: config.data,
      mockMode: useMock()
    })
    
    // 添加认证token
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    
    // 添加刷新令牌到请求头（刷新令牌接口需要）
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken && config.url && config.url.includes('/api/auth/refresh')) {
      config.headers['X-Refresh-Token'] = refreshToken
    }
    
    // 如果是模拟模式，添加模拟标记
    if (useMock()) {
      config.headers['X-Mock-Mode'] = 'true'
    }
    
    // 添加版本信息等通用参数
    config.headers['X-App-Version'] = '1.0.0'
    
    return config
  },
  (error) => {
    console.error('❌ 请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 开发环境下记录响应
    if (isDevelopment) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data
      })
    }
    
    // 统一处理响应格式
    const { data } = response
    
    // 如果后端直接返回数据（非统一格式），包装成统一格式
    if (!data || typeof data !== 'object') {
      return {
        data: {
          success: true,
          message: '操作成功',
          result: data
        }
      }
    }
    
    // 如果已经是统一格式，直接返回
    if (data.hasOwnProperty('success') || data.hasOwnProperty('code')) {
      return response
    }
    
    // 包装后端直接返回的数据格式（如JWT令牌响应）
    return {
      data: {
        success: true,
        message: '操作成功',
        result: data
      }
    }
  },
  async (error) => {
    const { response, config } = error
    
    // 开发环境下记录错误
    if (isDevelopment) {
      console.error(`[API Error] ${config?.method?.toUpperCase()} ${config?.url}`, {
        status: response?.status,
        data: response?.data,
        message: error.message
      })
    }
    
    // 处理401未授权错误
    if (response?.status === 401) {
      // 如果不是刷新令牌的请求，尝试刷新令牌
      if (!config.url.includes('/api/auth/refresh')) {
        const refreshToken = localStorage.getItem('refreshToken')
        
        if (refreshToken) {
          try {
            // 调用刷新令牌接口
            const refreshResponse = await request.post('/api/auth/refresh', {}, {
              headers: {
                'Authorization': `Bearer ${refreshToken}`
              }
            })
            
            // 保存新的访问令牌
            const newAccessToken = refreshResponse.data.result?.accessToken
            if (newAccessToken) {
              localStorage.setItem('token', newAccessToken)
              
              // 重新发送原请求
              config.headers.Authorization = `Bearer ${newAccessToken}`
              return request(config)
            }
          } catch (refreshError) {
            console.error('[Token Refresh Failed]', refreshError)
          }
        }
      }
      
      // 清除令牌并跳转到登录页
      const authStore = useAuthStore()
      authStore.clearAuth()
      localStorage.removeItem('refreshToken')
      
      // 如果不在登录页，跳转到登录页
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    
    // 处理其他HTTP错误
    const errorMessage = response?.data?.message || error.message || '请求失败'
    
    return Promise.reject({
      success: false,
      message: errorMessage,
      code: response?.status,
      data: response?.data
    })
  }
)

export default request