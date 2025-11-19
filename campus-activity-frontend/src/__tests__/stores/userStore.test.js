import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/userStore'

describe('User Store', () => {
  beforeEach(() => {
    // 创建一个新的 Pinia 实例
    setActivePinia(createPinia())
    // 清除 localStorage mock
    vi.clearAllMocks()
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const store = useUserStore()
      
      expect(store.userInfo).toBe(null)
      expect(store.currentCreditScore).toBe(0)
      expect(store.userStats).toEqual({
        createdActivities: 0,
        joinedActivities: 0,
        creditScore: 100,
        completionRate: 0
      })
      expect(store.loading).toBe(false)
      expect(store.error).toBe(null)
    })

    it('应该正确计算用户ID', () => {
      const store = useUserStore()
      
      // 初始状态没有用户信息
      expect(store.userId).toBe(null)
      
      // 设置用户信息后
      store.setUserInfo({ id: '123', name: '张三' })
      expect(store.userId).toBe('123')
    })

    it('应该正确计算用户名', () => {
      const store = useUserStore()
      
      // 初始状态显示默认用户名
      expect(store.userName).toBe('用户')
      
      // 设置真实姓名
      store.setUserInfo({ realName: '张三' })
      expect(store.userName).toBe('张三')
      
      // 设置普通姓名
      store.setUserInfo({ name: '李四' })
      expect(store.userName).toBe('李四')
    })
  })

  describe('setUserInfo', () => {
    it('应该正确设置用户信息', () => {
      const store = useUserStore()
      const userInfo = {
        id: '123',
        name: '张三',
        creditScore: 95
      }
      
      store.setUserInfo(userInfo)
      
      expect(store.userInfo).toEqual(userInfo)
      expect(store.currentCreditScore).toBe(95)
      expect(store.userStats.creditScore).toBe(95)
    })

    it('应该处理没有信誉分的用户信息', () => {
      const store = useUserStore()
      const userInfo = {
        id: '123',
        name: '张三'
      }
      
      store.setUserInfo(userInfo)
      
      expect(store.userInfo).toEqual(userInfo)
      expect(store.currentCreditScore).toBe(0)
    })
  })

  describe('updateUserInfo', () => {
    it('应该正确更新用户信息', () => {
      const store = useUserStore()
      store.setUserInfo({
        id: '123',
        name: '张三',
        email: 'old@example.com'
      })
      
      store.updateUserInfo({
        email: 'new@example.com',
        phone: '13800138000'
      })
      
      expect(store.userInfo).toEqual({
        id: '123',
        name: '张三',
        email: 'new@example.com',
        phone: '13800138000'
      })
    })

    it('应该正确更新信誉分', () => {
      const store = useUserStore()
      store.setUserInfo({
        id: '123',
        name: '张三',
        creditScore: 90
      })
      
      store.updateUserInfo({ creditScore: 95 })
      
      expect(store.currentCreditScore).toBe(95)
      expect(store.userStats.creditScore).toBe(95)
      expect(store.userInfo.creditScore).toBe(95)
    })

    it('应该在没有用户信息时不执行更新', () => {
      const store = useUserStore()
      
      store.updateUserInfo({ name: '张三' })
      
      expect(store.userInfo).toBe(null)
    })
  })

  describe('updateCreditScore', () => {
    it('应该正确更新信誉分', () => {
      const store = useUserStore()
      store.setUserInfo({
        id: '123',
        name: '张三',
        creditScore: 90
      })
      
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      store.updateCreditScore(5, '完成活动', 'activity123')
      
      expect(store.currentCreditScore).toBe(95)
      expect(store.userStats.creditScore).toBe(95)
      expect(store.userInfo.creditScore).toBe(95)
      expect(consoleSpy).toHaveBeenCalledWith('信誉分更新: 5, 原因: 完成活动, 活动ID: activity123')
      
      consoleSpy.mockRestore()
    })

    it('应该处理负信誉分变化', () => {
      const store = useUserStore()
      store.setUserInfo({
        id: '123',
        name: '张三',
        creditScore: 90
      })
      
      store.updateCreditScore(-10, '活动违约', 'activity456')
      
      expect(store.currentCreditScore).toBe(80)
      expect(store.userStats.creditScore).toBe(80)
      expect(store.userInfo.creditScore).toBe(80)
    })
  })

  describe('updateUserProfile', () => {
    it('应该成功更新用户资料', async () => {
      const store = useUserStore()
      store.setUserInfo({
        id: '123',
        name: '张三',
        email: 'old@example.com'
      })
      
      // Mock localStorage
      const localStorageMock = {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn()
      }
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock
      })
      
      const result = await store.updateUserProfile({
        email: 'new@example.com',
        phone: '13800138000'
      })
      
      expect(result).toBe(true)
      expect(store.userInfo.email).toBe('new@example.com')
      expect(store.userInfo.phone).toBe('13800138000')
      expect(store.loading).toBe(false)
      expect(store.error).toBe(null)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('userInfo', JSON.stringify(store.userInfo))
    })

    it('应该在没有用户信息时也能更新资料', async () => {
      const store = useUserStore()
      
      const localStorageSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {})
      
      const result = await store.updateUserProfile({
        name: '张三',
        email: 'zhangsan@example.com'
      })
      
      expect(result).toBe(true)
      expect(store.userInfo.name).toBe('张三')
      expect(store.userInfo.email).toBe('zhangsan@example.com')
      
      localStorageSpy.mockRestore()
    })
  })

  describe('changeAvatar', () => {
    it('应该成功更换头像', async () => {
      const store = useUserStore()
      store.setUserInfo({
        id: '123',
        name: '张三',
        avatar: 'old-avatar.jpg'
      })
      
      // 创建模拟文件
      const mockFile = new File([''], 'avatar.jpg', { type: 'image/jpeg' })
      
      // 简化测试，直接测试结果而不依赖FileReader
      const mockAvatarUrl = 'data:image/jpeg;base64,mock-image-data'
      
      // Mock FileReader构造函数
      global.FileReader = class {
        constructor() {
          this.onload = null
          this.result = null
        }
        
        readAsDataURL(file) {
          // 模拟异步读取
          setTimeout(() => {
            this.result = mockAvatarUrl
            if (this.onload) {
              this.onload({ target: { result: this.result } })
            }
          }, 0)
        }
      }
      
      const result = await store.changeAvatar(mockFile)
      
      expect(result).toBe(mockAvatarUrl)
      expect(store.userInfo.avatar).toBe(mockAvatarUrl)
      expect(store.loading).toBe(false)
    })
  })

  describe('fetchUserStats', () => {
    it('应该成功获取用户统计数据', async () => {
      const store = useUserStore()
      store.setUserInfo({
        id: '123',
        name: '张三',
        creditScore: 90
      })
      
      const result = await store.fetchUserStats()
      
      expect(result).toEqual({
        createdActivities: 5,
        joinedActivities: 12,
        creditScore: 90,
        completionRate: 85
      })
      expect(store.userStats).toEqual(result)
      expect(store.loading).toBe(false)
      expect(store.error).toBe(null)
    })
  })

  describe('fetchUserDetail', () => {
    it('应该成功获取用户详情', async () => {
      const store = useUserStore()
      
      const result = await store.fetchUserDetail()
      
      expect(result).toEqual({
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
      })
      expect(store.userInfo).toEqual(result)
      expect(store.currentCreditScore).toBe(95)
      expect(store.loading).toBe(false)
      expect(store.error).toBe(null)
    })
  })

  describe('clearUserInfo', () => {
    it('应该正确清除用户信息', () => {
      const store = useUserStore()
      store.setUserInfo({
        id: '123',
        name: '张三',
        creditScore: 90
      })
      store.currentCreditScore = 90
      store.userStats.creditScore = 90
      
      store.clearUserInfo()
      
      expect(store.userInfo).toBe(null)
      expect(store.currentCreditScore).toBe(0)
      expect(store.userStats).toEqual({
        createdActivities: 0,
        joinedActivities: 0,
        creditScore: 100,
        completionRate: 0
      })
    })
  })

  describe('logout', () => {
    it('应该正确退出登录', () => {
      const store = useUserStore()
      store.setUserInfo({
        id: '123',
        name: '张三',
        creditScore: 90
      })
      
      // Mock localStorage
      const localStorageMock = {
        removeItem: vi.fn(),
        getItem: vi.fn()
      }
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock
      })
      
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      store.logout()
      
      expect(store.userInfo).toBe(null)
      expect(store.currentCreditScore).toBe(0)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('userInfo')
      expect(consoleSpy).toHaveBeenCalledWith('用户已退出登录')
      
      consoleSpy.mockRestore()
    })
  })
})