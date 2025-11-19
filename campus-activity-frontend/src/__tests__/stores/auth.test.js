import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import * as apiUtils from '@/utils/api'
import { validatedApi } from '@/api'

// Mock API
vi.mock('@/utils/api', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  changePassword: vi.fn(),
  getUserInfo: vi.fn(),
  refreshToken: vi.fn()
}))

// Mock validatedApi
vi.mock('@/api', () => ({
  validatedApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    changePassword: vi.fn(),
    getUserInfo: vi.fn(),
    refreshToken: vi.fn()
  }
}))

// Mock errorHandler
vi.mock('@/utils/errorHandler', () => ({
  handleApiError: vi.fn((error) => {
    // 简化错误处理，直接返回错误对象
    return {
      success: false,
      error: {
        message: error.message || '网络错误',
        code: error.code || 'UNKNOWN_ERROR'
      }
    }
  })
}))

// Mock userStore
vi.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    clearUserInfo: vi.fn()
  })
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
})

describe('Auth Store', () => {
  let authStore

  beforeEach(() => {
    // 创建新的Pinia实例
    setActivePinia(createPinia())
    authStore = useAuthStore()
    
    // 清除所有mock调用记录
    vi.clearAllMocks()
    
    // Mock console.log避免测试输出过多
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    // 恢复console
    vi.restoreAllMocks()
  })

  describe('初始状态', () => {
    it('应该正确初始化认证状态', () => {
      expect(authStore.token).toBeUndefined()
      expect(authStore.user).toBe(null)
      expect(authStore.loginTime).toBe(null)
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('应该从localStorage恢复认证数据', () => {
      // Mock localStorage数据
      localStorageMock.getItem.mockImplementation((key) => {
        const data = {
          'token': 'test-token',
          'user': '{"id":1,"name":"Test User"}',
          'loginTime': Date.now().toString()
        }
        return data[key] || null
      })

      // 创建新的store实例来测试localStorage恢复
      setActivePinia(createPinia())
      const newAuthStore = useAuthStore()

      expect(newAuthStore.token).toBe('test-token')
      expect(newAuthStore.user).toEqual({ id: 1, name: 'Test User' })
      expect(newAuthStore.loginTime).toBeTruthy()
    })

    it('应该处理损坏的localStorage数据', () => {
      // Mock损坏的localStorage数据
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'user') {
          return 'invalid-json'
        }
        return null
      })

      // Mock console.error
      const consoleSpy = vi.spyOn(console, 'error')

      setActivePinia(createPinia())
      const newAuthStore = useAuthStore()

      expect(newAuthStore.user).toBe(null)
      expect(consoleSpy).toHaveBeenCalled()
    })
  })

  describe('isAuthenticated计算属性', () => {
    it('没有token时应该返回false', () => {
      authStore.token = null
      authStore.loginTime = Date.now().toString()
      
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('没有loginTime时应该返回false', () => {
      authStore.token = 'test-token'
      authStore.loginTime = null
      
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('token未过期时应该返回true', () => {
      authStore.token = 'test-token'
      authStore.loginTime = Date.now().toString()
      
      expect(authStore.isAuthenticated).toBe(true)
    })

    it('token过期时应该返回false并清除认证信息', () => {
      authStore.token = 'test-token'
      authStore.loginTime = (Date.now() - 5 * 60 * 60 * 1000).toString() // 5小时前
      
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.token).toBe(null)
      expect(authStore.user).toBe(null)
      expect(authStore.loginTime).toBe(null)
    })
  })

  describe('setAuth', () => {
    it('应该正确设置认证信息', () => {
      const userData = { id: 1, name: 'Test User' }
      const token = 'test-token'

      authStore.setAuth(token, userData)

      expect(authStore.token).toBe(token)
      expect(authStore.user).toEqual(userData)
      expect(authStore.loginTime).toBeTruthy()
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', token)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(userData))
      expect(localStorageMock.setItem).toHaveBeenCalledWith('loginTime', expect.any(String))
    })

    it('应该处理localStorage存储错误', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const consoleSpy = vi.spyOn(console, 'error')

      authStore.setAuth('test-token', { id: 1 })

      expect(consoleSpy).toHaveBeenCalledWith('存储到localStorage失败:', expect.any(Error))
    })
  })

  describe('clearAuth', () => {
    it('应该清除所有认证信息', () => {
      // 先设置一些数据
      authStore.setAuth('test-token', { id: 1 })

      // 清除认证信息
      authStore.clearAuth()

      expect(authStore.token).toBe(null)
      expect(authStore.user).toBe(null)
      expect(authStore.loginTime).toBe(null)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('loginTime')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('locationPermissionRequested')
    })

    it('应该处理localStorage清除错误', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Remove error')
      })

      const consoleSpy = vi.spyOn(console, 'error')

      authStore.clearAuth()

      expect(consoleSpy).toHaveBeenCalledWith('清理localStorage失败:', expect.any(Error))
    })
  })

  describe('loginUser', () => {
    it('应该成功登录用户', async () => {
      const mockResponse = {
        success: true,
        data: {
          token: 'test-token',
          user: { id: 1, name: 'Test User' }
        }
      }
      validatedApi.login.mockResolvedValue(mockResponse)

      const result = await authStore.loginUser('2021001', 'password123')

      expect(validatedApi.login).toHaveBeenCalledWith({ studentId: '2021001', password: 'password123', rememberMe: false })
      expect(authStore.token).toBe('test-token')
      expect(authStore.user).toEqual({ id: 1, name: 'Test User' })
      expect(result).toEqual(mockResponse)
    })

    it('登录前应该清除旧认证信息', async () => {
      // 先设置一些旧数据
      authStore.setAuth('old-token', { id: 999, name: 'Old User' })

      const mockResponse = {
        success: true,
        data: {
          token: 'new-token',
          user: { id: 1, name: 'New User' }
        }
      }
      validatedApi.login.mockResolvedValue(mockResponse)

      await authStore.loginUser('2021001', 'password123')

      // 验证localStorage.removeItem被调用了（清除旧数据）
      expect(localStorageMock.removeItem).toHaveBeenCalled()
      
      // 验证特定的key被移除
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('locationPermissionRequested')

      // 验证新数据被设置
      expect(authStore.token).toBe('new-token')
      expect(authStore.user).toEqual({ id: 1, name: 'New User' })
    })

    it('登录失败时应该清除认证信息', async () => {
      // 先设置一些数据
      authStore.setAuth('test-token', { id: 1 })

      const error = new Error('Login failed')
      validatedApi.login.mockRejectedValue(error)

      await expect(authStore.loginUser('2021001', 'wrongpassword')).rejects.toThrow('Login failed')

      expect(authStore.token).toBe(null)
      expect(authStore.user).toBe(null)
      expect(authStore.loginTime).toBe(null)
    })

    it('应该处理无效的登录响应', async () => {
      validatedApi.login.mockResolvedValue({ success: true, data: null })

      await expect(authStore.loginUser('2021001', 'password123')).rejects.toThrow('登录响应缺少data字段')
    })
  })

  describe('registerUser', () => {
    it('应该成功注册用户', async () => {
      const userData = {
        realName: '张三',
        studentId: '2021001',
        password: 'password123'
      }
      const mockResponse = { success: true, message: '注册成功' }
      validatedApi.register.mockResolvedValue(mockResponse)

      const result = await authStore.registerUser(userData)

      expect(validatedApi.register).toHaveBeenCalledWith(userData)
      expect(result).toEqual(mockResponse)
    })

    it('应该处理注册失败', async () => {
      const userData = {
        realName: '张三',
        studentId: '2021001',
        password: 'password123'
      }
      const error = new Error('Registration failed')
      validatedApi.register.mockRejectedValue(error)

      await expect(authStore.registerUser(userData)).rejects.toThrow('Registration failed')
    })
  })

  describe('changePassword', () => {
    it('应该成功修改密码', async () => {
      const passwordData = {
        userId: 1,
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123'
      }
      const mockResponse = { success: true, message: '密码修改成功' }
      validatedApi.changePassword.mockResolvedValue(mockResponse)

      const result = await authStore.changePassword(passwordData)

      expect(validatedApi.changePassword).toHaveBeenCalledWith(passwordData)
      expect(result).toEqual(mockResponse)
    })

    it('应该处理修改密码失败', async () => {
      const passwordData = {
        userId: 1,
        currentPassword: '', // 空密码会触发验证失败
        newPassword: 'newpassword123'
      }
      
      // Mock validatedApi.changePassword 抛出错误
      const error = new Error('请填写完整信息')
      validatedApi.changePassword.mockRejectedValue(error)
      
      await expect(authStore.changePassword(passwordData)).rejects.toThrow('请填写完整信息')
    })
  })

  describe('logoutUser', () => {
    it('应该成功退出登录', async () => {
      // 先设置一些认证数据
      authStore.setAuth('test-token', { id: 1 })

      const mockLogoutResponse = { success: true }
      validatedApi.logout.mockResolvedValue(mockLogoutResponse)

      await authStore.logoutUser()

      expect(authStore.token).toBe(null)
      expect(authStore.user).toBe(null)
      expect(authStore.loginTime).toBe(null)
      expect(validatedApi.logout).toHaveBeenCalled()
    })

    it('应该处理logout API失败', async () => {
      // 先设置一些认证数据
      authStore.setAuth('test-token', { id: 1 })

      const error = new Error('Logout API failed')
      validatedApi.logout.mockRejectedValue(error)

      // 即使API失败，本地数据也应该被清除
      await authStore.logoutUser()

      expect(authStore.token).toBe(null)
      expect(authStore.user).toBe(null)
      expect(authStore.loginTime).toBe(null)
    })
  })

  describe('initialize', () => {
    it('应该正确初始化store', () => {
      const consoleSpy = vi.spyOn(console, 'log')

      authStore.initialize()

      expect(consoleSpy).toHaveBeenCalledWith('🔧 初始化认证store')
    })
  })
})