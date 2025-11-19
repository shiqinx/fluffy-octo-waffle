import request from '@/utils/request'
import {
  mockGetUserParticipatedActivities,
  mockGetActivityParticipants,
  mockCancelParticipation,
  mockGetParticipationApplications
} from './mock'

// 检查是否使用模拟数据
const useMock = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_BASE_URL

// 获取用户参与的活动（ParticipateController）
// POST /api/participate/user/activities
export const getUserParticipatedActivities = async (params) => {
  try {
    // 验证必要参数
    if (!params) {
      throw new Error('查询参数不能为空')
    }
    
    const { userId, page = 1, pageSize = 10, status = 'joined' } = params
    
    if (!userId) {
      throw new Error('用户ID不能为空')
    }
    
    // 验证分页参数
    const pageNum = parseInt(page) || 1
    const size = parseInt(pageSize) || 10
    
    // 验证状态参数
    const validStatuses = ['joined', 'pending', 'cancelled', 'all']
    const statusValue = status || 'joined'
    
    if (!validStatuses.includes(statusValue)) {
      throw new Error('无效的状态值，有效状态：joined, pending, cancelled, all')
    }
    
    if (useMock) {
      // 模拟获取用户参与活动
      await new Promise(resolve => setTimeout(resolve, 300))
      const mockActivities = [
        {
          userId: userId,
          activityId: 101,
          activityName: '校园音乐节',
          status: 'joined',
          participateTime: new Date(Date.now() - 86400000).toISOString(),
          activityTime: new Date(Date.now() + 172800000).toISOString()
        },
        {
          userId: userId,
          activityId: 102,
          activityName: '科技创新大赛',
          status: 'pending',
          participateTime: new Date(Date.now() - 172800000).toISOString(),
          activityTime: new Date(Date.now() + 604800000).toISOString()
        }
      ]
      
      // 根据状态筛选
      const filteredActivities = statusValue === 'all' 
        ? mockActivities 
        : mockActivities.filter(activity => activity.status === statusValue)
      
      return {
        success: true,
        message: '获取用户参与活动列表成功',
        result: {
          userPartActivity: filteredActivities,
          total: filteredActivities.length
        }
      }
    }
    
    // 导入数据转换函数
    const { convertToUserPartActivity } = await import('@/utils/dataModelConverter')
    
    // 转换请求参数为后端UserPartActivity格式
    const userPartActivity = convertToUserPartActivity({
      userId,
      page: pageNum,
      pageSize: size,
      status: statusValue
    })
    
    const response = await request.post('/api/participate/user/activities', userPartActivity)
    
    // 处理不同的响应格式
    let result
    if (typeof response === 'string') {
      // 字符串响应 - 处理成功消息
      if (response.includes('成功')) {
        result = { userPartActivity: [], total: 0 }
      } else {
        throw new Error(response)
      }
    } else if (response && response.userPartActivity) {
      // UserPartActivityResponse格式
      result = {
        userPartActivity: response.userPartActivity || [],
        total: response.total || 0
      }
    } else if (response && response.data) {
      // 标准包装格式
      const data = response.data
      if (data.userPartActivity) {
        result = {
          userPartActivity: data.userPartActivity,
          total: data.total || 0
        }
      } else {
        result = { userPartActivity: [], total: 0 }
      }
    } else {
      // 直接响应或其他格式
      result = response || { userPartActivity: [], total: 0 }
    }
    
    return {
      success: true,
      message: '获取用户参与活动列表成功',
      result: result
    }
  } catch (error) {
    // 导入错误处理函数
    const { handleApiError } = await import('@/utils/dataModelConverter')
    return handleApiError(error, '获取用户参与活动列表失败')
  }
}

// 获取活动参与者（ParticipateController）
// GET /api/participate/activity/users
export const getActivityParticipants = async (activityId, params) => {
  try {
    // 验证必要参数
    if (!activityId) {
      throw new Error('活动ID不能为空')
    }
    
    if (useMock) {
      return mockGetActivityParticipants(activityId, params)
    }
    
    const response = await request.get('/api/participate/activity/users', {
      params: { activityId, ...params }
    })
    
    // 处理不同的响应格式
    let result
    if (typeof response === 'string') {
      // 字符串响应 - 处理成功消息
      if (response.includes('成功')) {
        result = []
      } else {
        throw new Error(response)
      }
    } else if (Array.isArray(response)) {
      // 直接返回数组格式
      result = response
    } else if (response && response.data) {
      // 标准包装格式
      result = Array.isArray(response.data) ? response.data : []
    } else {
      // 其他格式
      result = response || []
    }
    
    return {
      success: true,
      message: '获取活动参与者列表成功',
      result: result
    }
  } catch (error) {
    // 导入错误处理函数
    const { handleApiError } = await import('@/utils/dataModelConverter')
    return handleApiError(error, '获取活动参与者列表失败')
  }
}

// 取消参与活动
// POST /api/participate/cancel
export const cancelParticipation = async (activityId) => {
  try {
    // 验证必要参数
    if (!activityId) {
      throw new Error('活动ID不能为空')
    }
    
    if (typeof activityId !== 'number' && typeof activityId !== 'string') {
      throw new Error('活动ID格式错误')
    }
    
    if (useMock) {
      // 模拟取消参与活动
      await new Promise(resolve => setTimeout(resolve, 300))
      return {
        success: true,
        message: '取消参与活动成功',
        result: {
          activityId: activityId,
          status: 'cancelled',
          cancelTime: new Date().toISOString()
        }
      }
    }
    
    const response = await request.post('/api/participate/cancel', { activityId })
    
    // 验证响应格式
    if (response && !response.success) {
      throw new Error(response.message || '取消参与活动失败')
    }
    
    return {
      success: true,
      message: '取消参与活动成功',
      result: response.data || {}
    }
  } catch (error) {
    // 导入错误处理函数
    const { handleApiError } = await import('@/utils/dataModelConverter')
    return handleApiError(error, '取消参与活动失败')
  }
}

// 获取参与申请
// GET /api/participate/applications
export const getParticipationApplications = async (activityId, params) => {
  try {
    if (useMock) {
      return mockGetParticipationApplications(activityId, params)
    }
    const response = await request.get('/api/participate/applications', {
      params: { activityId, ...params }
    })
    return response
  } catch (error) {
    console.error('获取参与申请列表失败:', error)
    throw error
  }
}

// 审批参与申请
export const approveParticipation = async (applicationId, approved, reason) => {
  try {
    if (useMock) {
      // 模拟审批操作
      await new Promise(resolve => setTimeout(resolve, 500))
      return {
        success: true,
        message: approved ? '已批准申请' : '已拒绝申请'
      }
    }
    const response = await request.post('/api/participate/approve', {
      applicationId,
      approved,
      reason
    })
    return response
  } catch (error) {
    console.error('审批参与申请失败:', error)
    throw error
  }
}

// 批量获取用户参与状态
export const getParticipationStatus = async (activityIds, userId) => {
  try {
    // 验证必要参数
    if (!activityIds || !Array.isArray(activityIds) || activityIds.length === 0) {
      throw new Error('活动ID列表不能为空且必须是数组格式')
    }
    
    if (!userId) {
      throw new Error('用户ID不能为空')
    }
    
    // 验证活动ID格式
    const invalidIds = activityIds.filter(id => typeof id !== 'number' && typeof id !== 'string')
    if (invalidIds.length > 0) {
      throw new Error('活动ID格式错误，必须是数字或字符串')
    }
    
    if (useMock) {
      // 模拟批量获取参与状态
      await new Promise(resolve => setTimeout(resolve, 300))
      const userPartActivity = activityIds.map(id => ({
        userId: userId,
        activityId: id,
        status: mockGetParticipationStatusById(id, userId),
        participateTime: mockGetParticipationStatusById(id, userId) === 'joined' 
          ? new Date(Date.now() - 86400000).toISOString() 
          : null
      }))
      
      return {
        success: true,
        message: '批量获取参与状态成功',
        result: {
          userPartActivity: userPartActivity,
          total: userPartActivity.length
        }
      }
    }
    
    const response = await request.post('/api/participate/status', {
      activityIds,
      userId
    })
    
    // 验证响应格式
    if (response && !response.success) {
      throw new Error(response.message || '批量获取参与状态失败')
    }
    
    return {
      success: true,
      message: '批量获取参与状态成功',
      result: response.data || { userPartActivity: [], total: 0 }
    }
  } catch (error) {
    // 导入错误处理函数
    const { handleApiError } = await import('@/utils/dataModelConverter')
    return handleApiError(error, '批量获取参与状态失败')
  }
}

// 模拟辅助函数：根据ID获取参与状态
function mockGetParticipationStatusById(activityId, userId = 1001) {
  const participation = [
    { activityId: 101, status: 'joined' },
    { activityId: 102, status: 'joined' },
    { activityId: 103, status: 'pending' }
  ].find(p => p.activityId === activityId)
  return participation ? participation.status : 'none'
}