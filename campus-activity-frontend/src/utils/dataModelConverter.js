// 数据模型转换工具函数
// 用于在前端数据结构与后端DTO之间进行转换

/**
 * 将前端撤回消息数据转换为后端RecallMessageRequest格式
 * @param {Object} recallData - 前端撤回消息数据
 * @returns {Object} 符合后端RecallMessageRequest格式的数据
 */
export const convertToRecallMessageRequest = (recallData) => {
  return {
    messageId: recallData.messageId,
    senderId: recallData.senderId,
    receiverId: recallData.receiverId,
    sentAt: recallData.sentAt || new Date().toISOString()
  }
}

/**
 * 将前端消息数据转换为后端MessageSendDTO格式
 * @param {Object} messageData - 前端消息数据
 * @returns {Object} 符合后端MessageSendDTO格式的数据
 */
export const convertToMessageSendDTO = (messageData) => {
  return {
    content: messageData.content,
    senderId: messageData.senderId,
    receiverId: messageData.receiverId,
    receiverType: messageData.receiverType,
    type: messageData.type || 'text',
    sentAt: messageData.sentAt || new Date().toISOString()
  }
}

/**
 * 将前端团队数据转换为后端TeamDTO格式
 * @param {Object} teamData - 前端团队数据
 * @returns {Object} 符合后端TeamDTO格式的数据
 */
export const convertToTeamDTO = (teamData) => {
  return {
    name: teamData.name,
    description: teamData.description,
    tags: teamData.tags || [],
    // 其他字段将由后端自动填充
  }
}

/**
 * 将前端团队成员数据转换为后端TeamMemberDTO格式
 * @param {Object} memberData - 前端团队成员数据
 * @returns {Object} 符合后端TeamMemberDTO格式的数据
 */
export const convertToTeamMemberDTO = (memberData) => {
  return {
    id: memberData.id,
    userId: memberData.userId,
    userName: memberData.userName,
    avatar: memberData.avatar || '',
    role: memberData.role || 'member',
    joinedAt: memberData.joinedAt || memberData.createdAt || new Date().toISOString(),
    status: memberData.status || 'active'
  }
}

/**
 * 将前端团队申请数据转换为后端BelongDTO格式
 * @param {Object} applyData - 前端团队申请数据
 * @returns {Object} 符合后端BelongDTO格式的数据
 */
export const convertToBelongDTO = (applyData) => {
  return {
    teamId: applyData.teamId,
    userId: applyData.userId || null, // 如果未提供，后端会使用当前登录用户ID
    message: applyData.message || '我想加入这个团队',
    status: applyData.status || 'pending'
  }
}

/**
 * 将前端团队申请数据转换为后端BelongTeamRequest格式
 * @param {Object} applyData - 前端团队申请数据
 * @returns {Object} 符合后端BelongTeamRequest格式的数据
 */
export const convertToBelongTeamRequest = (applyData) => {
  return {
    teamId: applyData.teamId,
    userId: applyData.userId || null, // 如果未提供，后端会使用当前登录用户ID
    message: applyData.message || '我想加入这个团队'
  }
}

/**
 * 将前端团队搜索数据转换为后端ResearchTeamRequest格式
 * @param {Object} searchData - 前端团队搜索数据
 * @returns {Object} 符合后端ResearchTeamRequest格式的数据
 */
export const convertToResearchTeamRequest = (searchData) => {
  return {
    keyword: searchData.keyword || searchData.q || ''
  }
}

/**
 * 将前端活动数据转换为后端ActivityDTO格式
 * @param {Object} activityData - 前端活动数据
 * @returns {Object} 符合后端ActivityDTO格式的数据
 */
export const convertToActivityDTO = (activityData) => {
  return {
    title: activityData.title,
    description: activityData.description,
    startTime: activityData.startTime,
    endTime: activityData.endTime,
    location: activityData.location,
    maxParticipants: activityData.maxParticipants,
    tags: activityData.tags || [],
    coverImage: activityData.coverImage || '',
    status: activityData.status || 'recruiting'
  }
}

/**
 * 将前端参与数据转换为后端PartiDTO格式
 * @param {Object} partiData - 前端参与数据
 * @returns {Object} 符合后端PartiDTO格式的数据
 */
export const convertToPartiDTO = (partiData) => {
  return {
    activityId: partiData.activityId,
    userId: partiData.userId || null, // 如果未提供，后端会使用当前登录用户ID
    status: partiData.status || 'pending',
    role: partiData.role || 'participant'
  }
}

/**
 * 将前端参数转换为后端UserPartActivity格式
 * @param {Object} params - 前端参数
 * @returns {Object} 符合后端UserPartActivity格式的数据
 */
export const convertToUserPartActivity = (params) => {
  return {
    userId: params.userId,
    page: params.page || 1,
    pageSize: params.pageSize || 10,
    status: params.status || 'joined'
  }
}

/**
 * 将前端位置数据转换为后端LocationDTO格式
 * @param {Object} locationData - 前端位置数据
 * @returns {Object} 符合后端LocationDTO格式的数据
 */
export const convertToLocationDTO = (locationData) => {
  return {
    latitude: locationData.latitude,
    longitude: locationData.longitude,
    address: locationData.address || '',
    timestamp: locationData.timestamp || new Date().toISOString()
  }
}

/**
 * 将前端用户位置数据转换为后端UserLocationDTO格式
 * @param {Object} locationData - 前端用户位置数据
 * @returns {Object} 符合后端UserLocationDTO格式的数据
 */
export const convertToUserLocationDTO = (locationData) => {
  return {
    userId: locationData.userId || null,
    latitude: locationData.latitude,
    longitude: locationData.longitude,
    address: locationData.address || '',
    timestamp: locationData.timestamp || new Date().toISOString(),
    accuracy: locationData.accuracy || null
  }
}

/**
 * 将前端用户注册数据转换为后端UserRegisterRequest格式
 * @param {Object} registerData - 前端注册数据
 * @returns {Object} 符合后端UserRegisterRequest格式的数据
 */
export const convertToUserRegisterRequest = (registerData) => {
  return {
    realName: registerData.realName || '',
    studentId: registerData.studentId || '',
    password: registerData.password || ''
  }
}

/**
 * 将前端用户登录数据转换为后端UserLoginRequest格式
 * @param {Object} loginData - 前端登录数据
 * @returns {Object} 符合后端UserLoginRequest格式的数据
 */
export const convertToUserLoginRequest = (loginData) => {
  return {
    userId: loginData.userId || loginData.studentId || null,
    userPassword: loginData.userPassword || loginData.password || '',
    rememberMe: loginData.rememberMe || false
  }
}

/**
 * 将前端修改密码数据转换为后端ChangePasswordRequest格式
 * @param {Object} passwordData - 前端修改密码数据
 * @returns {Object} 符合后端ChangePasswordRequest格式的数据
 */
export const convertToChangePasswordRequest = (passwordData) => {
  return {
    userId: parseInt(passwordData.userId) || null,
    user_OldPassword: passwordData.user_OldPassword || '',
    user_NewPassword: passwordData.user_NewPassword || ''
  }
}

/**
 * 批量转换位置历史数据
 * @param {Array} locationHistory - 位置历史数据数组
 * @returns {Array} 转换后的位置历史数据数组
 */
export const convertToLocationHistoryDTO = (locationHistory) => {
  if (!Array.isArray(locationHistory)) {
    return []
  }
  
  return locationHistory.map(location => ({
    userId: location.userId || null,
    latitude: location.latitude,
    longitude: location.longitude,
    address: location.address || '',
    timestamp: location.timestamp || new Date().toISOString(),
    accuracy: location.accuracy || null
  }))
}

/**
 * 转换后端返回的分页数据格式
 * @param {Object} responseData - 后端返回的数据
 * @returns {Object} 标准化的前端分页数据格式
 */
export const convertToPaginationData = (responseData) => {
  if (!responseData) {
    return {
      list: [],
      total: 0,
      page: 1,
      pageSize: 10
    }
  }
  
  return {
    list: responseData.list || responseData.data || [],
    total: responseData.total || responseData.count || 0,
    page: responseData.page || responseData.current || 1,
    pageSize: responseData.pageSize || responseData.size || 10
  }
}

import { 
  handleApiError, 
  createValidationError, 
  createAuthError,
  createNotFoundError 
} from './errorHandler'

// API调用测试工具函数
export const testApiCall = async (apiFunction, params = {}, expectedSuccess = true) => {
  try {
    const result = await apiFunction(...params)
    
    // 记录测试结果
    console.log(`\n=== API测试结果 ===`)
    console.log(`API函数: ${apiFunction.name}`)
    console.log(`参数:`, params)
    console.log(`成功: ${result.success}`)
    
    if (!result.success) {
      console.log(`错误信息: ${result.message}`)
      console.log(`错误代码: ${result.code}`)
    }
    
    return result
  } catch (error) {
    console.error(`\n=== API测试失败 ===`)
    console.error(`API函数: ${apiFunction.name}`)
    console.error(`错误:`, error)
    return handleApiError(error)
  }
}

// 批量测试API调用
export const batchTestApis = async (apiTests) => {
  console.log('\n========== 开始批量API测试 ==========\n')
  
  const results = []
  let successCount = 0
  let failedCount = 0
  
  for (const test of apiTests) {
    const { api, params = [], description } = test
    
    if (description) {
      console.log(`\n${description}`)
    }
    
    const result = await testApiCall(api, params)
    results.push({
      test,
      result
    })
    
    if (result.success) {
      successCount++
    } else {
      failedCount++
    }
  }
  
  console.log('\n========== API测试汇总 ==========')
  console.log(`总测试数: ${apiTests.length}`)
  console.log(`成功: ${successCount}`)
  console.log(`失败: ${failedCount}`)
  
  return {
    results,
    summary: {
      total: apiTests.length,
      success: successCount,
      failed: failedCount
    }
  }
}