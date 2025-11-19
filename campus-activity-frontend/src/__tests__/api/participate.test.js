import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  getUserParticipatedActivities,
  getActivityParticipants,
  cancelParticipation,
  getParticipationApplications,
  approveParticipation,
  getParticipationStatus
} from '@/api/participate'

describe('Participate API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUserParticipatedActivities', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const params = {
        userId: 1001,
        page: 1,
        pageSize: 10,
        status: 'joined'
      }
      
      const result = await getUserParticipatedActivities(params)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.message).toBe('获取用户参与活动列表成功')
      expect(result.result).toBeDefined()
      expect(result.result.userPartActivity).toBeDefined()
      expect(Array.isArray(result.result.userPartActivity)).toBe(true)
      expect(result.result.total).toBeDefined()
    })

    it('应该处理缺少用户ID的查询', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const params = {
        page: 1,
        pageSize: 10,
        status: 'joined'
      }
      
      const result = await getUserParticipatedActivities(params)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('用户ID不能为空')
    })

    it('应该处理空查询参数', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await getUserParticipatedActivities(null)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('查询参数不能为空')
    })

    it('应该处理不同的状态值', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const joinedParams = { userId: 1001, status: 'joined' }
      const pendingParams = { userId: 1001, status: 'pending' }
      const allParams = { userId: 1001, status: 'all' }
      const invalidParams = { userId: 1001, status: 'invalid' }
      
      const joinedResult = await getUserParticipatedActivities(joinedParams)
      const pendingResult = await getUserParticipatedActivities(pendingParams)
      const allResult = await getUserParticipatedActivities(allParams)
      const invalidResult = await getUserParticipatedActivities(invalidParams)
      
      expect(joinedResult.success).toBe(true)
      expect(pendingResult.success).toBe(true)
      expect(allResult.success).toBe(true)
      expect(invalidResult.success).toBe(false)
      expect(invalidResult.message).toContain('无效的状态值')
    })

    it('应该处理默认分页参数', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const params = {
        userId: 1001,
        page: 1,
        pageSize: 10
      }
      
      const result = await getUserParticipatedActivities(params)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.result).toBeDefined()
      expect(result.result.userPartActivity).toBeDefined()
      expect(Array.isArray(result.result.userPartActivity)).toBe(true)
      expect(result.result.total).toBeDefined()
    }, 10000)
  })

  describe('getActivityParticipants', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const activityId = 123
      const params = {
        page: 1,
        pageSize: 20
      }
      
      const result = await getActivityParticipants(activityId, params)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data.participants)).toBe(true)
    })

    it('应该处理缺少活动ID的查询', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const params = {
        page: 1,
        pageSize: 20
      }
      
      const result = await getActivityParticipants(null, params)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('活动ID不能为空')
    })

    it('应该处理空的活动ID', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await getActivityParticipants('')
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('活动ID不能为空')
    })

    it('应该处理数字和字符串类型的活动ID', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const numberId = 123
      const stringId = '123'
      
      const numberResult = await getActivityParticipants(numberId, { page: 1, pageSize: 10 })
      const stringResult = await getActivityParticipants(stringId, { page: 1, pageSize: 10 })
      
      expect(numberResult.success).toBe(true)
      expect(stringResult.success).toBe(true)
    })
  })

  describe('cancelParticipation', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const activityId = 123
      
      const result = await cancelParticipation(activityId)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.message).toBe('取消参与活动成功')
      expect(result.result).toBeDefined()
      expect(result.result.activityId).toBe(123)
      expect(result.result.status).toBe('cancelled')
      expect(result.result.cancelTime).toBeDefined()
    })

    it('应该处理缺少活动ID的取消请求', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await cancelParticipation(null)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('活动ID不能为空')
    })

    it('应该处理无效的活动ID格式', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const invalidId = {}
      
      const result = await cancelParticipation(invalidId)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('活动ID格式错误')
    })

    it('应该处理数字和字符串类型的活动ID', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const numberId = 123
      const stringId = '123'
      
      const numberResult = await cancelParticipation(numberId)
      const stringResult = await cancelParticipation(stringId)
      
      expect(numberResult.success).toBe(true)
      expect(stringResult.success).toBe(true)
    })
  })

  describe('getParticipationApplications', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const activityId = 123
      const params = {
        page: 1,
        pageSize: 20
      }
      
      const result = await getParticipationApplications(activityId, params)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data.applications)).toBe(true)
    })

    it('应该处理空参数', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await getParticipationApplications(123, { page: 1, pageSize: 10 })
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
    })
  })

  describe('approveParticipation', () => {
    it('应该在模拟模式下批准申请', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const applicationId = 123
      const approved = true
      const reason = '符合参与条件'
      
      const result = await approveParticipation(applicationId, approved, reason)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.message).toBe('已批准申请')
    })

    it('应该在模拟模式下拒绝申请', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const applicationId = 123
      const approved = false
      const reason = '不符合参与条件'
      
      const result = await approveParticipation(applicationId, approved, reason)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.message).toBe('已拒绝申请')
    })

    it('应该处理缺少参数的审批请求', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await approveParticipation()
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
    })
  })

  describe('getParticipationStatus', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const activityIds = [101, 102, 103]
      const userId = 1001
      
      const result = await getParticipationStatus(activityIds, userId)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.message).toBe('批量获取参与状态成功')
      expect(result.result).toBeDefined()
      expect(result.result.userPartActivity).toBeDefined()
      expect(Array.isArray(result.result.userPartActivity)).toBe(true)
      expect(result.result.userPartActivity.length).toBe(3)
      expect(result.result.total).toBe(3)
    })

    it('应该处理空的活动ID列表', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const activityIds = []
      const userId = 1001
      
      const result = await getParticipationStatus(activityIds, userId)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('活动ID列表不能为空且必须是数组格式')
    })

    it('应该处理非数组格式的活动ID列表', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const activityIds = 'not-an-array'
      const userId = 1001
      
      const result = await getParticipationStatus(activityIds, userId)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('活动ID列表不能为空且必须是数组格式')
    })

    it('应该处理缺少用户ID的查询', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const activityIds = [101, 102, 103]
      
      const result = await getParticipationStatus(activityIds, null)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('用户ID不能为空')
    })

    it('应该处理无效格式的活动ID', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const activityIds = [101, {}, '103']
      const userId = 1001
      
      const result = await getParticipationStatus(activityIds, userId)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(false)
      expect(result.message).toContain('活动ID格式错误')
    })

    it('应该处理数字和字符串混合的活动ID列表', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const activityIds = [101, '102', 103]
      const userId = 1001
      
      const result = await getParticipationStatus(activityIds, userId)
      
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.result.userPartActivity.length).toBe(3)
    })

    it('应该返回正确的参与状态', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const activityIds = [101, 102, 103, 999] // 999是不存在的活动
      const userId = 1001
      
      const result = await getParticipationStatus(activityIds, userId)
      
      expect(result.success).toBe(true)
      const statuses = result.result.userPartActivity.map(item => ({
        activityId: item.activityId,
        status: item.status
      }))
      
      expect(statuses).toContainEqual({ activityId: 101, status: 'joined' })
      expect(statuses).toContainEqual({ activityId: 102, status: 'joined' })
      expect(statuses).toContainEqual({ activityId: 103, status: 'pending' })
      expect(statuses).toContainEqual({ activityId: 999, status: 'none' })
    })
  })

  describe('数据完整性', () => {
    it('应该返回一致的响应格式', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const params = { userId: 1001 }
      const activityId = 123
      const activityIds = [101, 102]
      
      const userActivitiesResult = await getUserParticipatedActivities(params)
      const participantsResult = await getActivityParticipants(activityId, { page: 1, pageSize: 10 })
      const cancelResult = await cancelParticipation(activityId)
      const statusResult = await getParticipationStatus(activityIds, 1001)
      
      expect(userActivitiesResult).toHaveProperty('success')
      expect(userActivitiesResult).toHaveProperty('message')
      expect(userActivitiesResult).toHaveProperty('result')
      
      expect(participantsResult).toHaveProperty('success')
      expect(participantsResult).toHaveProperty('data')
      
      expect(cancelResult).toHaveProperty('success')
      expect(cancelResult).toHaveProperty('message')
      expect(cancelResult).toHaveProperty('result')
      
      expect(statusResult).toHaveProperty('success')
      expect(statusResult).toHaveProperty('message')
      expect(statusResult).toHaveProperty('result')
    })
  })

  describe('边界情况', () => {
    it('应该处理极大的分页参数', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const params = {
        userId: 1001,
        page: 1000,
        pageSize: 1000
      }
      
      const result = await getUserParticipatedActivities(params)
      
      expect(result.success).toBe(true)
    })

    it('应该处理极小的分页参数', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const params = {
        userId: 1001,
        page: 0,
        pageSize: 1
      }
      
      const result = await getUserParticipatedActivities(params)
      
      expect(result.success).toBe(true)
    })

    it('应该处理空的活动ID列表', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await getActivityParticipants('')
      
      expect(result.success).toBe(false)
      expect(result.message).toContain('活动ID不能为空')
    })

    it('应该处理特殊字符的活动ID', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await getActivityParticipants('special-123_abc', { page: 1, pageSize: 10 })
      
      expect(result.success).toBe(true)
    })
  })
})