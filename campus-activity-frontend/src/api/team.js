// @/api/team.js
import request from '@/utils/request'
import { 
  mockCreateTeam, 
  mockApplyTeam, 
  mockAgreeTeamApply, 
  mockSearchTeam, 
  mockGetMyTeams, 
  mockGetTeamMembers,
  mockTeams,
  teamMembers,
  teamApplications
} from './mock'
import { convertToTeamDTO, convertToBelongDTO, convertToBelongTeamRequest, convertToResearchTeamRequest, convertToPaginationData } from '@/utils/dataModelConverter'
import { handleApiError } from '@/utils/errorHandler'

// 检查是否使用模拟数据
const useMock = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_BASE_URL

// 创建团队（/api/team/create）
export const createTeam = async (teamData) => {
  try {
    // 转换数据为后端TeamDTO格式
    const teamDTO = convertToTeamDTO(teamData)
    
    if (useMock) {
      const response = await mockCreateTeam(teamDTO)
      return convertToTeamDTO(response.data || response)
    }
    
    const response = await request.post('/api/team/create', teamDTO)
    const result = response.data || { success: true, data: response }
    if (!result.success) {
      throw result
    }
    return convertToTeamDTO(result.data || result)
  } catch (error) {
    return handleApiError(error, '创建团队失败')
  }
}

// 申请加入团队（/api/team/apply）
export const applyTeam = async (data) => {
  try {
    // 转换数据为后端BelongTeamRequest格式
    const belongTeamRequest = convertToBelongTeamRequest(data)
    
    if (useMock) {
      const response = await mockApplyTeam(belongTeamRequest)
      if (!response.success) {
        throw response
      }
      return { result: true, message: response.message }
    }
    
    const response = await request.post('/api/team/apply', belongTeamRequest)
    const result = response.data || { success: true, data: response }
    if (!result.success) {
      throw result
    }
    return { result: true, message: result.message || '申请成功' }
  } catch (error) {
    return handleApiError(error, '申请加入团队失败')
  }
}

// 同意团队申请（/api/team/agree-apply）
export const agreeTeamApply = async (data) => {
  try {
    if (useMock) {
      const response = await mockAgreeTeamApply(data)
      if (!response.success) {
        throw response
      }
      return { result: true, message: response.message }
    }
    
    const response = await request.post('/api/team/agree-apply', data)
    const result = response.data || { success: true, data: response }
    if (!result.success) {
      throw result
    }
    return { result: true, message: result.message || '审核成功' }
  } catch (error) {
    return handleApiError(error, '审核团队申请失败')
  }
}

// 搜索团队（/api/team/search）
export const searchTeam = async (params) => {
  try {
    // 转换数据为后端ResearchTeamRequest格式
    const searchRequest = convertToResearchTeamRequest(params)
    
    if (useMock) {
      const response = await mockSearchTeam(searchRequest)
      if (!response.success) {
        throw response
      }
      return convertToPaginationData(response.data, convertToTeamDTO)
    }
    const response = await request.get('/api/team/search', { params: searchRequest })
    const result = response.data || { success: true, data: response }
    if (!result.success) {
      throw result
    }
    return convertToPaginationData(result.data, convertToTeamDTO)
  } catch (error) {
    return handleApiError(error, '搜索团队失败')
  }
}

// 保留原有函数以保持兼容性
export const getTeams = async (params) => {
  try {
    return await searchTeam(params)
  } catch (error) {
    return handleApiError(error, '获取团队列表失败')
  }
}

// 添加getTeamList函数以保持兼容性
export const getTeamList = async (params) => {
  try {
    return await searchTeam(params)
  } catch (error) {
    return handleApiError(error, '获取团队列表失败')
  }
}

export const getTeamDetail = async (id) => {
  try {
    if (useMock) {
      // 使用静态导入的mock数据
      // 确保mockTeams存在且是数组
      if (!mockTeams || !Array.isArray(mockTeams)) {
        throw { success: false, message: '团队数据未初始化' }
      }
      
      // 处理ID类型，支持字符串和数字
      const teamId = typeof id === 'string' ? parseInt(id) : id
      const team = mockTeams.find(t => t.id === teamId)
      
      if (!team) {
        throw { success: false, message: '团队不存在' }
      }
      
      // 获取团队成员
      const membersResponse = await mockGetTeamMembers(teamId)
      
      return {
        success: true,
        data: {
          ...team,
          members: membersResponse.data.list
        }
      }
    }
    
    const response = await request.get(`/api/team/${id}`)
    const result = response.data || { success: true, data: response }
    if (!result.success) {
      throw result
    }
    return result
  } catch (error) {
    return handleApiError(error, '获取团队详情失败')
  }
}

export const joinTeam = (teamId) => {
  return applyTeam({ teamId })
}

export const getUserTeams = () => {
  if (useMock) {
    return Promise.resolve({
      code: 200,
      message: 'success',
      data: [
        {
          id: 1,
          name: '我的团队1',
          role: 'leader',
          memberCount: 5
        },
        {
          id: 2,
          name: '我的团队2',
          role: 'member',
          memberCount: 8
        }
      ]
    })
  }
  return request.get('/api/belong/my-teams')
}

// 保留更新和删除团队的功能
export const updateTeam = (id, data) => {
  if (useMock) {
    return Promise.resolve({
      code: 200,
      message: 'success',
      data: { id, ...data }
    })
  }
  return request.put(`/api/team/${id}`, data)
}

export const deleteTeam = (id) => {
  if (useMock) {
    return Promise.resolve({
      code: 200,
      message: '删除成功',
      data: null
    })
  }
  return request.delete(`/api/team/${id}`)
}

// 获取我的团队（支持按角色筛选）
export const getMyTeams = async (params) => {
  try {
    if (useMock) {
      const response = await mockGetMyTeams(params)
      if (!response.success) {
        throw response
      }
      return response
    }
    
    const response = await request.get('/api/team/my-teams', { params })
    const result = response.data || { success: true, data: response }
    if (!result.success) {
      throw result
    }
    return result
  } catch (error) {
    return handleApiError(error, '获取我的团队失败')
  }
}

// 退出团队
export const leaveTeam = async (teamId) => {
  try {
    if (useMock) {
      return { success: true, message: '退出成功' }
    }
    
    const response = await request.post(`/api/team/leave/${teamId}`)
    const result = response.data || { success: true, data: response }
    if (!result.success) {
      throw result
    }
    return { success: true, message: result.message || '退出成功' }
  } catch (error) {
    return handleApiError(error, '退出团队失败')
  }
}

// 获取团队加入申请
export const getTeamJoinRequests = async (teamId) => {
  try {
    if (useMock) {
      return {
        success: true,
        data: {
          list: [],
          total: 0
        }
      }
    }
    
    const response = await request.get(`/api/team/${teamId}/join-requests`)
    const result = response.data || { success: true, data: response }
    if (!result.success) {
      throw result
    }
    return result
  } catch (error) {
    return handleApiError(error, '获取团队申请失败')
  }
}

// 同意加入申请
export const agreeJoinRequest = async (requestId) => {
  try {
    if (useMock) {
      return { success: true, message: '已同意申请' }
    }
    
    const response = await request.post(`/api/team/agree-join-request/${requestId}`)
    const result = response.data || { success: true, data: response }
    if (!result.success) {
      throw result
    }
    return { success: true, message: result.message || '已同意申请' }
  } catch (error) {
    return handleApiError(error, '同意申请失败')
  }
}