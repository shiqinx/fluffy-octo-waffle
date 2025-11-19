import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getUserInfo,
  updateUserInfo,
  getUserStatistics,
  userRegister,
  userLogin,
  userLogout,
  changeUserPassword,
  saveUserLocation,
  updateUserProfile,
  uploadAvatar,
  getUserDetail,
  updateUserTags
} from '@/api/user'

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

describe('User API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue('mock-token')
    
    // 设置环境变量为真实API模式
    vi.stubEnv('VITE_USE_MOCK', 'false')
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8080')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('getUserInfo', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await getUserInfo()
      
      expect(result).toBeDefined()
      expect(typeof result.success).toBe('boolean')
    })
  })

  describe('updateUserInfo', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const updateData = {
        username: 'newname',
        email: 'new@example.com'
      }
      
      const result = await updateUserInfo(updateData)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.data).toEqual(updateData)
    })
  })

  describe('getUserStatistics', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await getUserStatistics()
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(typeof result.data.totalActivities).toBe('number')
    })
  })

  describe('userRegister', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const registerData = {
        username: 'newuser',
        password: 'password123',
        email: 'newuser@example.com'
      }
      
      const result = await userRegister(registerData)
      
      expect(result).toBeDefined()
      expect(typeof result.success).toBe('boolean')
    })
  })

  describe('userLogin', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const loginData = {
        username: '2330502143',
        password: '123456'
      }
      
      const result = await userLogin(loginData)
      
      expect(result).toBeDefined()
      expect(typeof result.success).toBe('boolean')
    })
  })

  describe('userLogout', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await userLogout()
      
      expect(result).toBeDefined()
      expect(typeof result.success).toBe('boolean')
    })
  })

  describe('changeUserPassword', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const passwordData = {
        oldPassword: '123456',
        newPassword: 'newpass'
      }
      
      const result = await changeUserPassword(passwordData)
      
      expect(result).toBeDefined()
      expect(typeof result.success).toBe('boolean')
    })
  })

  describe('saveUserLocation', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const locationData = {
        userId: 1,
        latitude: 23.028501,
        longitude: 112.184488,
        validTime: 3600,
        address: '测试地址',
        timestamp: '2023-01-01T00:00:00.000Z',
        accuracy: 10
      }
      
      const result = await saveUserLocation(locationData)
      
      expect(result).toBeDefined()
      expect(typeof result.success).toBe('boolean')
    })

    it('应该拒绝空的位置数据', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      await expect(saveUserLocation(null)).rejects.toThrow('位置数据不能为空')
      await expect(saveUserLocation(undefined)).rejects.toThrow('位置数据不能为空')
    })

    it('应该拒绝无效的经纬度', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const invalidLocation1 = {
        userId: 1,
        latitude: 'invalid',
        longitude: 112.184488,
        validTime: 3600
      }
      const invalidLocation2 = {
        userId: 1,
        latitude: 23.028501,
        longitude: 'invalid',
        validTime: 3600
      }

      await expect(saveUserLocation(invalidLocation1)).rejects.toThrow('位置数据必须包含有效的经纬度信息')
      await expect(saveUserLocation(invalidLocation2)).rejects.toThrow('位置数据必须包含有效的经纬度信息')
    })

    it('应该拒绝无效的用户ID', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const invalidLocation = {
        userId: 'invalid',
        latitude: 23.028501,
        longitude: 112.184488,
        validTime: 3600
      }

      await expect(saveUserLocation(invalidLocation)).rejects.toThrow('用户ID必须是有效的数字')
    })

    it('应该拒绝无效的有效时间', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const invalidLocation1 = {
        userId: 1,
        latitude: 23.028501,
        longitude: 112.184488,
        validTime: null
      }
      const invalidLocation2 = {
        userId: 1,
        latitude: 23.028501,
        longitude: 112.184488,
        validTime: -1
      }
      const invalidLocation3 = {
        userId: 1,
        latitude: 23.028501,
        longitude: 112.184488,
        validTime: 0
      }

      await expect(saveUserLocation(invalidLocation1)).rejects.toThrow('有效时间必须是大于0的数字')
      await expect(saveUserLocation(invalidLocation2)).rejects.toThrow('有效时间必须是大于0的数字')
      await expect(saveUserLocation(invalidLocation3)).rejects.toThrow('有效时间必须是大于0的数字')
    })
  })

  describe('updateUserProfile', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const profileData = {
        nickname: '新昵称',
        bio: '个人简介',
        phone: '13800138000'
      }
      
      const result = await updateUserProfile(profileData)
      
      expect(result).toBeDefined()
      expect(typeof result.success).toBe('boolean')
    })
  })

  describe('uploadAvatar', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const file = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' })
      
      const result = await uploadAvatar(file)
      
      expect(result).toBeDefined()
      expect(typeof result.success).toBe('boolean')
    })
  })

  describe('getUserDetail', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await getUserDetail(1)
      
      expect(result).toBeDefined()
      expect(typeof result.success).toBe('boolean')
    })
  })

  describe('updateUserTags', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const tags = ['编程', '运动', '音乐']
      
      const result = await updateUserTags(tags)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.data.tags).toEqual(tags)
    })
  })
})