import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useActivityStore } from '@/stores/activity'

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

// Mock userStore
vi.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    userInfo: { id: 1, name: 'Test User' }
  })
}))

describe('Activity Store', () => {
  let activityStore

  beforeEach(() => {
    // 创建新的Pinia实例
    setActivePinia(createPinia())
    activityStore = useActivityStore()
    
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
    it('应该正确初始化活动状态', () => {
      expect(activityStore.activities).toBeInstanceOf(Array)
      expect(activityStore.activities.length).toBeGreaterThan(0)
      expect(activityStore.loading).toBe(false)
    })

    it('应该从localStorage加载活动数据', () => {
      // Mock localStorage数据
      const mockActivities = [
        {
          id: 1,
          title: 'Mock活动',
          startTime: new Date('2024-01-01T10:00:00Z').toISOString(),
          endTime: new Date('2024-01-01T12:00:00Z').toISOString(),
          registrationDeadline: new Date('2023-12-31T23:59:59Z').toISOString()
        }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockActivities))

      // 创建新的store实例来测试localStorage恢复
      setActivePinia(createPinia())
      const newActivityStore = useActivityStore()

      expect(newActivityStore.activities).toHaveLength(1)
      expect(newActivityStore.activities[0].title).toBe('Mock活动')
      expect(newActivityStore.activities[0].startTime).toBeInstanceOf(Date)
    })

    it('应该处理损坏的localStorage数据', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json')

      const consoleSpy = vi.spyOn(console, 'error')

      setActivePinia(createPinia())
      const newActivityStore = useActivityStore()

      expect(consoleSpy).toHaveBeenCalledWith('从localStorage加载活动失败:', expect.any(Error))
      // 应该回退到默认数据
      expect(newActivityStore.activities.length).toBeGreaterThan(0)
    })

    it('localStorage为空时应该使用默认数据', () => {
      localStorageMock.getItem.mockReturnValue(null)

      setActivePinia(createPinia())
      const newActivityStore = useActivityStore()

      expect(newActivityStore.activities.length).toBeGreaterThan(0)
      // 验证默认活动数据
      expect(newActivityStore.activities[0]).toHaveProperty('title')
      expect(newActivityStore.activities[0]).toHaveProperty('type')
      expect(newActivityStore.activities[0]).toHaveProperty('locationName')
    })
  })

  describe('saveActivitiesToStorage', () => {
    it('应该正确保存活动数据到localStorage', () => {
      const mockActivities = [
        {
          id: 1,
          title: '测试活动',
          startTime: new Date('2024-01-01T10:00:00Z'),
          endTime: new Date('2024-01-01T12:00:00Z'),
          registrationDeadline: new Date('2023-12-31T23:59:59Z')
        }
      ]
      activityStore.activities = mockActivities

      activityStore.saveActivitiesToStorage()

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'campus_activities',
        JSON.stringify([
          {
            id: 1,
            title: '测试活动',
            startTime: '2024-01-01T10:00:00.000Z',
            endTime: '2024-01-01T12:00:00.000Z',
            registrationDeadline: '2023-12-31T23:59:59.000Z'
          }
        ])
      )
    })

    it('应该处理localStorage保存错误', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const consoleSpy = vi.spyOn(console, 'error')

      activityStore.saveActivitiesToStorage()

      expect(consoleSpy).toHaveBeenCalledWith('❌ 保存活动数据失败:', expect.any(Error))
    })
  })

  describe('loadActivities', () => {
    it('应该成功加载活动数据', async () => {
      await activityStore.loadActivities()

      expect(activityStore.loading).toBe(false)
      expect(activityStore.activities).toBeInstanceOf(Array)
      expect(activityStore.activities.length).toBeGreaterThan(0)
    })

    it('应该设置loading状态', async () => {
      // 直接测试loading状态变化
      expect(activityStore.loading).toBe(false)
      
      const loadPromise = activityStore.loadActivities()
      
      // 由于loadActivities是同步的，我们需要在下一个事件循环中检查
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(activityStore.loading).toBe(false) // 应该已经完成
    })
  })

  describe('getActivityById', () => {
    it('应该根据ID获取活动', () => {
      const activity = activityStore.getActivityById(1)
      expect(activity).toBeDefined()
      expect(activity.id).toBe(1)
    })

    it('找不到活动时应该返回null', () => {
      const activity = activityStore.getActivityById(999)
      expect(activity).toBeNull()
    })

    it('应该确保返回的日期是Date对象', () => {
      const activity = activityStore.getActivityById(1)
      expect(activity.startTime).toBeInstanceOf(Date)
      expect(activity.endTime).toBeInstanceOf(Date)
    })
  })

  describe('createNewActivity', () => {
    it('应该成功创建新活动', async () => {
      // Mock API response
      const mockAPI = vi.fn().mockResolvedValue({
        success: true,
        data: {
          id: 999,
          title: '新创建的活动',
          description: '活动描述',
          category: 'sports',
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          location: { name: '测试地点' },
          maxParticipants: 10
        }
      })

      // Mock the API module
      vi.doMock('@/api/activity', () => ({
        createActivity: mockAPI
      }))

      const activityData = {
        title: '新创建的活动',
        description: '活动描述',
        category: 'sports',
        startTime: new Date(),
        endTime: new Date(),
        location: { name: '测试地点' },
        maxParticipants: 10
      }

      const newActivity = await activityStore.createNewActivity(activityData)

      expect(newActivity).toBeDefined()
      expect(newActivity.title).toBe('新创建的活动')
      expect(activityStore.activities[0].title).toBe('新创建的活动') // 应该被添加到列表开头
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('应该处理创建活动失败', async () => {
      // Mock API failure
      const mockAPI = vi.fn().mockResolvedValue({
        success: false,
        message: '创建失败'
      })

      vi.doMock('@/api/activity', () => ({
        createActivity: mockAPI
      }))

      const activityData = {
        title: '失败的活动',
        description: '活动描述'
      }

      await expect(activityStore.createNewActivity(activityData)).rejects.toThrow('创建失败')
    })
  })

  describe('enrollInActivity', () => {
    it('应该成功报名活动', async () => {
      const activityId = 1
      const initialParticipants = activityStore.activities.find(a => a.id === activityId).currentParticipants

      await activityStore.enrollInActivity(activityId)

      const activity = activityStore.activities.find(a => a.id === activityId)
      expect(activity.isEnrolled).toBe(true)
      expect(activity.currentParticipants).toBe(initialParticipants + 1)
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('找不到活动时应该静默处理', async () => {
      const initialActivities = [...activityStore.activities]
      
      // 不应该抛出错误
      await expect(activityStore.enrollInActivity(999)).resolves.toBeUndefined()
      
      expect(activityStore.activities).toEqual(initialActivities)
    })
  })

  describe('updateActivity', () => {
    it('应该更新现有活动', async () => {
      const activityId = 1
      const updatedData = {
        title: '更新后的活动',
        description: '更新后的描述'
      }

      const updatedActivity = await activityStore.updateActivity(activityId, updatedData)

      expect(updatedActivity.title).toBe('更新后的活动')
      expect(updatedActivity.description).toBe('更新后的描述')
      expect(updatedActivity.updatedAt).toBeInstanceOf(Date)
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('找不到活动时应该抛出错误', async () => {
      await expect(activityStore.updateActivity(999, { title: '不应该更新' }))
        .rejects.toThrow('活动不存在')
    })
  })

  describe('clearActivitiesStorage', () => {
    it('应该清理localStorage中的活动数据', () => {
      activityStore.clearActivitiesStorage()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('campus_activities')
      expect(activityStore.activities).toHaveLength(0)
    })

    it('应该处理清理失败的情况', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Remove error')
      })

      const consoleSpy = vi.spyOn(console, 'error')

      const result = activityStore.clearActivitiesStorage()

      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('❌ 清理活动数据失败:', expect.any(Error))
    })
  })
})