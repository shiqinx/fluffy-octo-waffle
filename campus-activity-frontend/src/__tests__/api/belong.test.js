import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getTeamMembers,
  getMyTeams,
  getMyActivities,
  getActivityParticipants,
  leaveTeam,
  getTeamActivities
} from '@/api/belong'

describe('Belong API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // 设置环境变量为真实API模式
    vi.stubEnv('VITE_USE_MOCK', 'false')
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8080')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('getTeamMembers', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await getTeamMembers(1, { page: 1, pageSize: 10 })
      
      expect(result).toBeDefined()
      expect(result.list).toBeDefined()
      expect(Array.isArray(result.list)).toBe(true)
      expect(typeof result.total).toBe('number')
    })

    it('应该处理无效的团队ID', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await getTeamMembers(null, { page: 1, pageSize: 10 })
      
      expect(result).toBeDefined()
    })
  })

  describe('getMyTeams', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await getMyTeams({ page: 1, pageSize: 10 })
      
      expect(result).toBeDefined()
      expect(result.list).toBeDefined()
      expect(Array.isArray(result.list)).toBe(true)
      expect(typeof result.total).toBe('number')
    })

    it('应该处理默认分页参数', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await getMyTeams()
      
      expect(result).toBeDefined()
      expect(result.list).toBeDefined()
    })
  })

  describe('getMyActivities', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await getMyActivities({ page: 1, pageSize: 10 })
      
      expect(result).toBeDefined()
      expect(result.list).toBeDefined()
      expect(Array.isArray(result.list)).toBe(true)
      expect(typeof result.total).toBe('number')
      
      if (result.list.length > 0) {
        const activity = result.list[0]
        expect(activity).toHaveProperty('activityId')
        expect(activity).toHaveProperty('activityTitle')
        expect(activity).toHaveProperty('role')
        expect(activity).toHaveProperty('status')
      }
    })

    it('应该处理不同的角色类型', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await getMyActivities({ page: 1, pageSize: 10 })
      
      expect(result).toBeDefined()
      
      if (result.list.length > 0) {
        const roles = result.list.map(activity => activity.role)
        expect(roles.every(role => ['organizer', 'participant'].includes(role))).toBe(true)
      }
    })
  })

  describe('getActivityParticipants', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await getActivityParticipants(1, { page: 1, pageSize: 10 })
      
      expect(result).toBeDefined()
      expect(result.list).toBeDefined()
      expect(Array.isArray(result.list)).toBe(true)
      expect(typeof result.total).toBe('number')
      
      if (result.list.length > 0) {
        const participant = result.list[0]
        expect(participant).toHaveProperty('userId')
        expect(participant).toHaveProperty('userName')
        expect(participant).toHaveProperty('role')
        expect(participant).toHaveProperty('joinedAt')
      }
    })

    it('应该处理无效的活动ID', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await getActivityParticipants(null, { page: 1, pageSize: 10 })
      
      expect(result).toBeDefined()
    })

    it('应该处理不同的参与者角色', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await getActivityParticipants(1, { page: 1, pageSize: 10 })
      
      expect(result).toBeDefined()
      
      if (result.list.length > 0) {
        const roles = result.list.map(participant => participant.role)
        expect(roles.every(role => ['organizer', 'participant'].includes(role))).toBe(true)
      }
    })
  })

  describe('leaveTeam', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await leaveTeam(1)
      
      expect(result).toBeDefined()
      expect(result.result).toBe(true)
      expect(typeof result.message).toBe('string')
    })

    it('应该处理无效的团队ID', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await leaveTeam(null)
      
      expect(result).toBeDefined()
    })
  })

  describe('getTeamActivities', () => {
    it('应该在模拟模式下工作', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await getTeamActivities(1, { page: 1, pageSize: 10 })
      
      expect(result).toBeDefined()
      expect(result.list).toBeDefined()
      expect(Array.isArray(result.list)).toBe(true)
      expect(typeof result.total).toBe('number')
      
      if (result.list.length > 0) {
        const activity = result.list[0]
        expect(activity).toHaveProperty('activityId')
        expect(activity).toHaveProperty('activityTitle')
        expect(activity).toHaveProperty('status')
        expect(activity).toHaveProperty('createdAt')
      }
    })

    it('应该处理无效的团队ID', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await getTeamActivities(null, { page: 1, pageSize: 10 })
      
      expect(result).toBeDefined()
    })

    it('应该处理默认分页参数', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const result = await getTeamActivities(1)
      
      expect(result).toBeDefined()
      expect(result.list).toBeDefined()
    })
  })

  describe('数据完整性', () => {
    it('应该返回一致的响应格式', async () => {
      vi.stubEnv('VITE_USE_MOCK', 'true')
      
      const teamMembers = await getTeamMembers(1)
      const myTeams = await getMyTeams()
      const myActivities = await getMyActivities()
      const participants = await getActivityParticipants(1)
      const teamActivities = await getTeamActivities(1)
      
      // 所有分页响应都应该有相同的结构
      const paginationResponses = [teamMembers, myTeams, myActivities, participants, teamActivities]
      
      paginationResponses.forEach(response => {
        expect(response).toHaveProperty('list')
        expect(response).toHaveProperty('total')
        expect(response).toHaveProperty('page')
        expect(response).toHaveProperty('pageSize')
        expect(Array.isArray(response.list)).toBe(true)
        expect(typeof response.total).toBe('number')
      })
    })
  })
})