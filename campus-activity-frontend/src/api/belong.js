import request from '@/utils/request'
import { mockGetMyTeams, mockGetTeamMembers } from './mock'
import { convertToTeamMemberDTO, convertToBelongDTO, convertToPaginationData } from '@/utils/dataModelConverter'
import { handleApiError } from '@/utils/errorHandler'

// 检查是否使用模拟数据
const useMock = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_BASE_URL

// 获取团队成员（/api/belong/team-members/{teamId}）
export const getTeamMembers = async (teamId, params) => {
  try {
    if (useMock) {
      const response = await mockGetTeamMembers(teamId, params)
      if (!response.success) {
        throw response
      }
      return convertToPaginationData(response.data, convertToTeamMemberDTO)
    }
    const response = await request.get(`/api/belong/team-members/${teamId}`, { params })
    const result = response.data || { success: true, data: response }
    if (!result.success) {
      throw result
    }
    return convertToPaginationData(result.data, convertToTeamMemberDTO)
  } catch (error) {
    return handleApiError(error, '获取团队成员失败')
  }
}

// 获取我的团队（/api/belong/my-teams）
export const getMyTeams = async (params) => {
  try {
    if (useMock) {
      const response = await mockGetMyTeams(params)
      if (!response.success) {
        throw response
      }
      return convertToPaginationData(response.data, convertToBelongDTO)
    }
    const response = await request.get('/api/belong/my-teams', { params })
    const result = response.data || { success: true, data: response }
    if (!result.success) {
      throw result
    }
    return convertToPaginationData(result.data, convertToBelongDTO)
  } catch (error) {
    return handleApiError(error, '获取我的团队失败')
  }
}

// 获取我的活动（/api/belong/my-activities）
export const getMyActivities = async (params) => {
  try {
    if (useMock) {
      const mockResponse = {
        success: true,
        data: {
          list: [
            {
              id: 1,
              activityId: 101,
              activityTitle: '篮球友谊赛',
              role: 'organizer',
              status: 'ongoing',
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 2,
              activityId: 102,
              activityTitle: '编程竞赛',
              role: 'participant',
              status: 'recruiting',
              joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            }
          ],
          total: 2,
          page: params?.page || 1,
          pageSize: params?.pageSize || 10
        }
      }
      return convertToPaginationData(mockResponse.data, convertToBelongDTO)
    }
    const response = await request.get('/api/belong/my-activities', { params })
    const result = response.data || { success: true, data: response }
    if (!result.success) {
      throw result
    }
    return convertToPaginationData(result.data, convertToBelongDTO)
  } catch (error) {
    return handleApiError(error, '获取我的活动失败')
  }
}

// 获取活动参与者（/api/belong/activity-participants/{activityId}）
export const getActivityParticipants = async (activityId, params) => {
  try {
    if (useMock) {
      const mockResponse = {
        success: true,
        data: {
          list: [
            {
              id: 1,
              userId: 1001,
              userName: '张三',
              avatar: '',
              role: 'organizer',
              joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 2,
              userId: 1002,
              userName: '李四',
              avatar: '',
              role: 'participant',
              joinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 3,
              userId: 1003,
              userName: '王五',
              avatar: '',
              role: 'participant',
              joinedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
            }
          ],
          total: 3,
          page: params?.page || 1,
          pageSize: params?.pageSize || 10
        }
      }
      return convertToPaginationData(mockResponse.data, convertToTeamMemberDTO)
    }
    const response = await request.get(`/api/belong/activity-participants/${activityId}`, { params })
    const result = response.data || { success: true, data: response }
    if (!result.success) {
      throw result
    }
    return convertToPaginationData(result.data, convertToTeamMemberDTO)
  } catch (error) {
    return handleApiError(error, '获取活动参与者失败')
  }
}

// 退出团队
export const leaveTeam = async (teamId) => {
  try {
    if (useMock) {
      const mockResponse = {
        success: true,
        message: '已退出团队'
      }
      return { result: true, message: mockResponse.message }
    }
    const response = await request.delete('/api/belong/team', {
      data: { teamId }
    })
    const result = response.data || { success: true, data: response }
    if (!result.success) {
      throw result
    }
    return { result: true, message: result.message || '退出团队成功' }
  } catch (error) {
    return handleApiError(error, '退出团队失败')
  }
}

// 获取团队创建的活动
export const getTeamActivities = async (teamId, params) => {
  try {
    if (useMock) {
      const mockResponse = {
        success: true,
        data: {
          list: [
            {
              id: 1,
              activityId: 101,
              activityTitle: '团队建设活动',
              status: 'ongoing',
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              participantCount: 10
            }
          ],
          total: 1,
          page: params?.page || 1,
          pageSize: params?.pageSize || 10
        }
      }
      return convertToPaginationData(mockResponse.data, convertToBelongDTO)
    }
    const response = await request.get(`/api/belong/team-activities/${teamId}`, { params })
    const result = response.data || { success: true, data: response }
    if (!result.success) {
      throw result
    }
    return convertToPaginationData(result.data, convertToBelongDTO)
  } catch (error) {
    return handleApiError(error, '获取团队活动失败')
  }
}