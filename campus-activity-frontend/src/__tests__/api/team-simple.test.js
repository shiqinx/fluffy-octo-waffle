import { describe, it, expect, vi, beforeEach } from 'vitest'

// 设置环境变量
process.env.VITE_USE_MOCK = 'true'

// Mock @/api/mock 模块 - 必须在导入任何其他模块之前定义
vi.mock('@/api/mock', () => ({
  mockCreateTeam: vi.fn(),
  mockApplyTeam: vi.fn(),
  mockGetMyTeams: vi.fn(),
  mockGetTeamMembers: vi.fn(),
  mockAgreeTeamApply: vi.fn(),
  mockSearchTeam: vi.fn(),
  mockTeams: [],
  teamMembers: {},
  teamApplications: {}
}))

// Mock request模块
vi.mock('@/utils/request', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

// Mock dataModelConverter
vi.mock('@/utils/dataModelConverter', () => ({
  handleApiError: vi.fn((error, defaultMessage) => ({
    success: false,
    message: error.message || defaultMessage,
    result: null
  })),
  convertToTeamDTO: vi.fn((data) => data),
  convertToBelongDTO: vi.fn((data) => data),
  convertToBelongTeamRequest: vi.fn((data) => data),
  convertToResearchTeamRequest: vi.fn((data) => data),
  convertToPaginationData: vi.fn((data, converter) => {
    if (converter && Array.isArray(data?.list)) {
      return { success: true, data: { ...data, list: data.list.map(converter) } }
    }
    return data || { success: true, data: { list: [], total: 0 } }
  })
}))

// 导入要测试的函数
import { 
  createTeam, 
  applyTeam, 
  agreeTeamApply, 
  searchTeam, 
  getTeamDetail,
  getMyTeams
} from '@/api/team'

// 导入mock函数以便在测试中使用
import { 
  mockCreateTeam,
  mockApplyTeam,
  mockGetMyTeams,
  mockGetTeamMembers,
  mockAgreeTeamApply,
  mockSearchTeam,
  mockTeams
} from '@/api/mock'

describe('Team API (简化版)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 重置环境变量mock
    import.meta.env.VITE_USE_MOCK = 'false'
    import.meta.env.VITE_API_BASE_URL = 'http://localhost:8080'
  })

  describe('createTeam', () => {
    it('应该成功创建团队（Mock模式）', async () => {
      const mockCreateData = {
        success: true,
        data: { id: 456, name: 'Mock团队' }
      }
      
      mockCreateTeam.mockResolvedValue(mockCreateData)

      const teamData = {
        name: 'Mock团队',
        description: '这是一个Mock团队'
      }

      const result = await createTeam(teamData)

      expect(mockCreateTeam).toHaveBeenCalledWith(teamData)
      // createTeam返回的是convertToTeamDTO处理后的数据，不是success包装
      expect(result.id).toBe(456)
      expect(result.name).toBe('Mock团队')
    })
  })

  describe('applyTeam', () => {
    it('应该成功申请加入团队（Mock模式）', async () => {
      const mockApplyData = {
        success: true,
        message: '申请已提交'
      }
      
      mockApplyTeam.mockResolvedValue(mockApplyData)

      const applicationData = { teamId: 456 }

      const result = await applyTeam(applicationData)

      expect(mockApplyTeam).toHaveBeenCalledWith(applicationData)
      expect(result.result).toBe(true)
    })
  })

  describe('agreeTeamApply', () => {
    it('应该成功同意团队申请（Mock模式）', async () => {
      const mockAgreeData = {
        success: true,
        message: '申请已通过'
      }
      
      mockAgreeTeamApply.mockResolvedValue(mockAgreeData)

      const agreementData = { teamId: 789, userId: 101 }

      const result = await agreeTeamApply(agreementData)

      expect(mockAgreeTeamApply).toHaveBeenCalledWith(agreementData)
      expect(result.result).toBe(true)
    })
  })

  describe('searchTeam', () => {
    it('应该成功搜索团队（Mock模式）', async () => {
      const mockSearchData = {
        success: true,
        data: {
          list: [{ id: 3, name: 'Mock搜索结果' }],
          total: 1
        }
      }
      
      mockSearchTeam.mockResolvedValue(mockSearchData)

      const searchParams = { keyword: 'Mock' }

      const result = await searchTeam(searchParams)

      expect(mockSearchTeam).toHaveBeenCalledWith(searchParams)
      expect(result.success).toBe(true)
    })
  })

  describe('getTeamDetail', () => {
    it('应该成功获取团队详情（Mock模式）', async () => {
      const mockDetailData = {
        success: true,
        data: { 
          id: 123, 
          name: 'Mock团队详情',
          members: []
        }
      }
      
      // 设置mockTeams数据，让getTeamDetail能找到团队
      mockTeams.push({ id: 123, name: 'Mock团队详情' })
      
      mockGetTeamMembers.mockResolvedValue(mockDetailData)

      const result = await getTeamDetail(123)

      expect(mockGetTeamMembers).toHaveBeenCalledWith(123)
      expect(result.success).toBe(true)
    })
  })

  describe('getMyTeams', () => {
    it('应该在Mock模式下成功获取我的团队', async () => {
      const mockMyTeamsData = {
        success: true,
        data: {
          list: [{ id: 1, name: 'Mock我的团队', role: 'member' }],
          total: 1
        }
      }
      
      mockGetMyTeams.mockResolvedValue(mockMyTeamsData)

      const result = await getMyTeams({ userId: 123 })

      expect(mockGetMyTeams).toHaveBeenCalledWith({ userId: 123 })
      expect(result.success).toBe(true)
    })
  })
})