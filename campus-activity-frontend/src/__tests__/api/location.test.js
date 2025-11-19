import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  saveLocation,
  saveUserLocation,
  saveUserLocationHistory,
  getUserLocationHistory
} from '@/api/location'

describe('Location API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // 设置环境变量为真实API模式
    vi.stubEnv('VITE_USE_MOCK', 'false')
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8080')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('saveLocation', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const locationData = {
        regionName: '测试区域',
        centerLatitude: 39.9042,
        centerLongitude: 116.4074,
        administrativeCode: '110101',
        regionType: '校园',
        detailAddress: '北京市朝阳区',
        regionRadius: 1000
      }
      
      const result = await saveLocation(locationData)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
    })

    it('应该处理无效的位置数据', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await saveLocation(null)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('位置数据不能为空')
    })

    it('应该验证经纬度字段', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const invalidLocation = {
        regionName: '测试区域',
        centerLatitude: 'invalid',
        centerLongitude: 116.4074,
        administrativeCode: '110101',
        regionType: '校园',
        regionRadius: 1000
      }
      
      const result = await saveLocation(invalidLocation)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('有效的经纬度信息')
    })

    it('应该验证区域名称', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const invalidLocation = {
        centerLatitude: 39.9042,
        centerLongitude: 116.4074,
        administrativeCode: '110101',
        regionType: '校园',
        regionRadius: 1000
      }
      
      const result = await saveLocation(invalidLocation)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('区域名称必须是有效的字符串')
    })

    it('应该验证区域半径', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const invalidLocation = {
        regionName: '测试区域',
        centerLatitude: 39.9042,
        centerLongitude: 116.4074,
        administrativeCode: '110101',
        regionType: '校园',
        regionRadius: -100
      }
      
      const result = await saveLocation(invalidLocation)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('区域半径必须是大于0的数字')
    })
  })

  describe('saveUserLocation', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const locationData = {
        userId: 1001,
        latitude: 39.9042,
        longitude: 116.4074,
        validTime: 3600,
        address: '校园内',
        timestamp: new Date().toISOString(),
        accuracy: 10
      }
      
      const result = await saveUserLocation(locationData)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
    })

    it('应该处理无效的用户位置数据', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await saveUserLocation(null)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('位置数据不能为空')
    })

    it('应该验证用户ID', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const invalidLocation = {
        userId: 'invalid',
        latitude: 39.9042,
        longitude: 116.4074,
        validTime: 3600
      }
      
      const result = await saveUserLocation(invalidLocation)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('用户ID必须是有效的数字')
    })

    it('应该验证有效时间', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const invalidLocation = {
        userId: 1001,
        latitude: 39.9042,
        longitude: 116.4074,
        validTime: -100
      }
      
      const result = await saveUserLocation(invalidLocation)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('有效时间必须是大于0的数字')
    })

    it('应该处理缺少地址信息的情况', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const locationData = {
        userId: 1001,
        latitude: 39.9042,
        longitude: 116.4074,
        validTime: 3600
      }
      
      const result = await saveUserLocation(locationData)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
    })
  })

  describe('saveUserLocationHistory', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const locationHistory = [
        {
          userId: 1001,
          latitude: 39.9042,
          longitude: 116.4074,
          timestamp: new Date().toISOString(),
          accuracy: 10
        },
        {
          userId: 1001,
          latitude: 39.9043,
          longitude: 116.4075,
          timestamp: new Date().toISOString(),
          accuracy: 15
        }
      ]
      
      const result = await saveUserLocationHistory(locationHistory)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.message).toContain('成功保存2条位置记录')
    })

    it('应该处理非数组输入', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await saveUserLocationHistory('not an array')
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('位置历史数据必须是数组格式')
    })

    it('应该处理空数组', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await saveUserLocationHistory([])
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('位置历史数据不能为空数组')
    })

    it('应该验证位置记录的有效性', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const invalidHistory = [
        {
          userId: 1001,
          latitude: 39.9042,
          longitude: 116.4074
        },
        {
          userId: 1001,
          latitude: 'invalid',
          longitude: 116.4075
        }
      ]
      
      const result = await saveUserLocationHistory(invalidHistory)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('发现1条无效的位置记录')
    })
  })

  describe('getUserLocationHistory', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const params = {
        userId: 1001,
        startTime: '2023-01-01T00:00:00Z',
        endTime: '2023-12-31T23:59:59Z',
        page: 1,
        pageSize: 20
      }
      
      const result = await getUserLocationHistory(params)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.result).toHaveProperty('list')
      expect(result.result).toHaveProperty('total')
      expect(result.result).toHaveProperty('page')
      expect(result.result).toHaveProperty('pageSize')
    })

    it('应该处理缺少查询参数的情况', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await getUserLocationHistory({})
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('至少需要提供userId、startTime或endTime之一')
    })

    it('应该处理过大的分页参数', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const params = {
        userId: 1001,
        page: 1,
        pageSize: 200
      }
      
      const result = await getUserLocationHistory(params)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('每页记录数不能超过100条')
    })

    it('应该处理默认分页参数', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const params = {
        userId: 1001
      }
      
      const result = await getUserLocationHistory(params)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.result.page).toBe(1)
      expect(result.result.pageSize).toBe(20)
    })

    it('应该处理只有时间范围的查询', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const params = {
        startTime: '2023-01-01T00:00:00Z',
        endTime: '2023-12-31T23:59:59Z'
      }
      
      const result = await getUserLocationHistory(params)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.result).toHaveProperty('list')
    })
  })

  describe('数据完整性', () => {
    it('应该返回一致的响应格式', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const locationData = {
        regionName: '测试区域',
        centerLatitude: 39.9042,
        centerLongitude: 116.4074,
        administrativeCode: '110101',
        regionType: '校园',
        regionRadius: 1000
      }
      
      const userLocationData = {
        userId: 1001,
        latitude: 39.9042,
        longitude: 116.4074,
        validTime: 3600
      }
      
      const locationResult = await saveLocation(locationData)
      const userLocationResult = await saveUserLocation(userLocationData)
      
      // 所有响应都应该有success字段
      expect(locationResult).toHaveProperty('success')
      expect(userLocationResult).toHaveProperty('success')
      
      // 成功的响应应该有message字段
      if (locationResult.success) {
        expect(locationResult).toHaveProperty('message')
      }
      if (userLocationResult.success) {
        expect(userLocationResult).toHaveProperty('message')
      }
    })
  })

  describe('边界情况', () => {
    it('应该处理极值坐标', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const extremeLocation = {
        regionName: '极值测试区域',
        centerLatitude: 90,
        centerLongitude: 180,
        administrativeCode: '110101',
        regionType: '校园',
        detailAddress: '极值测试地址',
        regionRadius: 1
      }
      
      const result = await saveLocation(extremeLocation)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
    })

    it('应该处理极大的有效时间', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const locationData = {
        userId: 1001,
        latitude: 39.9042,
        longitude: 116.4074,
        validTime: 999999999
      }
      
      const result = await saveUserLocation(locationData)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
    })
  })
})