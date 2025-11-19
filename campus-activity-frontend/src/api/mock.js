// 导入全局数据管理器
import { globalDataManager } from './global-data.js';

// 根据时间动态计算活动状态
export const calculateActivityStatus = (activity) => {
  const now = new Date();
  const startTime = new Date(activity.startTime);
  const endTime = new Date(activity.endTime);
  const enrollStartTime = activity.enrollStartTime ? new Date(activity.enrollStartTime) : null;
  const enrollEndTime = activity.enrollEndTime ? new Date(activity.enrollEndTime) : null;
  
  // 如果活动已结束
  if (now > endTime) {
    return 'ended';
  }
  
  // 如果活动正在进行中
  if (now >= startTime && now <= endTime) {
    return 'in_progress';
  }
  
  // 如果报名已结束但活动未开始
  if (enrollEndTime && now > enrollEndTime && now < startTime) {
    return 'recruiting'; // 仍显示招募中，但报名已截止
  }
  
  // 如果在报名时间内
  if (enrollStartTime && enrollEndTime && now >= enrollStartTime && now <= enrollEndTime) {
    return 'recruiting';
  }
  
  // 如果还没到报名时间但活动未开始
  if (enrollStartTime && now < enrollStartTime) {
    return 'recruiting'; // 预告状态
  }
  
  // 默认状态（如果没有设置报名时间）
  if (now < startTime) {
    return 'recruiting';
  }
  
  return activity.status || 'recruiting';
};

// 从全局管理器获取数据
let users = globalDataManager.getUsers();
let mockActivities = globalDataManager.getActivities();
let activityParticipants = {};
let currentToken = globalDataManager.getCurrentToken();

// 辅助函数：获取当前用户ID
const getCurrentUserId = () => {
  return globalDataManager.getCurrentUserId();
};

// 辅助函数：确保用户参与活动（用于测试）
const ensureUserParticipation = (activityId) => {
  globalDataManager.ensureUserParticipation(activityId);
};

// 模拟活动聊天记录
let activityChats = {
  1: [
    { id: 1, userId: 1, userName: '孙金瑶', content: '大家好，期待比赛！', time: new Date().toISOString() },
    { id: 2, userId: 2, userName: '卢敏婷', content: '我也很期待，一起加油！', time: new Date(Date.now() + 60000).toISOString() }
  ],
  2: [],
  3: [],
  4: [
    { id: 1, userId: 1, userName: '孙金瑶', content: '大家一起加油复习！', time: new Date().toISOString() },
    { id: 2, userId: 2, userName: '卢敏婷', content: '好的，互相帮助共同进步！', time: new Date(Date.now() + 30000).toISOString() }
  ],
  5: [],
  6: [
    { id: 1, userId: 1, userName: '孙金瑶', content: '联谊活动会很精彩！', time: new Date().toISOString() }
  ]
}

// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// 模拟登录
export const mockLogin = async (data) => {
  await delay(1000)
  
  // 支持对象参数格式
  const studentId = data.studentId || data.username
  const password = data.password
  
  console.log('🔐 mockLogin 尝试登录:', { studentId, password: '***', studentIdType: typeof studentId, passwordLength: password?.length })
  
  // 每次登录时都重新获取最新的用户数据，确保数据同步
  const currentUsers = globalDataManager.getUsers()
  console.log('📋 当前用户列表:', currentUsers.map(u => ({ 
    id: u.id, 
    studentId: u.studentId, 
    studentIdType: typeof u.studentId,
    realName: u.realName,
    password: u.password,
    passwordType: typeof u.password,
    passwordLength: u.password?.length
  })))
  
  // 增强用户匹配逻辑，添加详细的调试信息
  let user = null
  for (const u of currentUsers) {
    console.log('🔍 比较用户:', {
      inputStudentId: studentId,
      storedStudentId: u.studentId,
      studentIdMatch: u.studentId === studentId,
      studentIdMatchLoose: u.studentId == studentId,
      inputPassword: password,
      storedPassword: u.password,
      passwordMatch: u.password === password,
      passwordMatchLoose: u.password == password
    })
    
    if ((u.studentId == studentId) && (u.password == password)) {
      user = u
      break
    }
  }
  
  console.log('👤 找到的用户:', user ? { 
    id: user.id, 
    realName: user.realName,
    studentId: user.studentId,
    passwordMatch: user.password === password,
    passwordMatchLoose: user.password == password
  } : null)
  
  if (user) {
    // 保存当前token
    currentToken = 'mock_jwt_token_' + Date.now()
    globalDataManager.setCurrentToken(currentToken)
    globalDataManager.setCurrentUserId(user.id)
    
    const response = {
      success: true,
      data: {
        token: currentToken,
        user: {
          id: user.id,
          realName: user.realName,
          studentId: user.studentId,
          department: user.department,
          avatar: user.avatar,
          creditScore: user.creditScore
        }
      },
      message: '登录成功'
    }
    
    console.log('✅ 登录成功:', { userId: user.id, realName: user.realName })
    return response
  } else {
    console.log('❌ 登录失败: 学号或密码错误')
    throw {
      success: false,
      message: '学号或密码错误'
    }
  }
}

// 模拟创建活动
export const mockCreateActivity = async (activityData) => {
  await delay(1000)
  
  console.log('mockCreateActivity 接收到的数据:', activityData)
  
  // 使用全局数据管理器获取当前活动列表
  const currentActivities = globalDataManager.getActivities()
  const currentUsers = globalDataManager.getUsers()
  
  // 生成唯一的活动ID，避免冲突，统一使用字符串类型
  const existingIds = currentActivities.map(act => String(act.id))
  const newId = existingIds.length > 0 ? String(Math.max(...existingIds.map(id => parseInt(id))) + 1) : String(Date.now())
  
  const newActivity = {
    id: newId,
    title: activityData.title,
    description: activityData.description,
    category: activityData.category,
    startTime: activityData.startTime,
    endTime: activityData.endTime,
    // 统一地点格式：同时支持location对象和locationName字符串
    location: activityData.location?.name || activityData.locationName || '未指定地点',
    locationName: activityData.location?.name || activityData.locationName || '未指定地点',
    address: activityData.location?.address || '',
    coords: activityData.coords || null,
    maxParticipants: activityData.maxParticipants,
    organizerId: currentUsers[0].id,
    organizerName: currentUsers[0].realName,
    creatorId: currentUsers[0].id,
    creatorName: currentUsers[0].realName,
    currentParticipants: 1,
    status: calculateActivityStatus(activityData.startTime, activityData.endTime),
    tags: activityData.tags || [],
    coverImage: activityData.coverImage || '',
    // 设置报名时间：报名开始时间为当前时间，结束时间为活动开始前1小时
    enrollStartTime: new Date().toISOString(),
    enrollEndTime: new Date(Date.now() + 24 * 60 * 60 * 1000 - 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    // 添加列表页面需要的字段
    isEnrolled: false,
    isCreator: true,
    isApproved: false,
    distance: 0,
    participants: []
  }
  
  console.log('创建的新活动:', newActivity)
  
  // 使用全局数据管理器添加活动
  globalDataManager.addActivity(newActivity)
  
  // 创建参与者记录
  const participants = [{
    userId: currentUsers[0].id,
    userName: currentUsers[0].realName,
    status: 'approved',
    joinTime: new Date().toISOString()
  }]
  globalDataManager.setActivityParticipants(newActivity.id, participants)
  
  // 创建聊天记录数组
  globalDataManager.setActivityChats(newActivity.id, [])
  
  // 同步数据到localStorage，确保活动列表能读取到新创建的活动
  try {
    const updatedActivities = globalDataManager.getActivities()
    localStorage.setItem('campus_activities', JSON.stringify(updatedActivities))
    console.log('新活动已同步到localStorage，当前活动总数:', updatedActivities.length)
  } catch (error) {
    console.error('同步活动数据到localStorage失败:', error)
  }
  
  console.log('当前所有活动数量:', globalDataManager.getActivities().length)
  
  return {
    success: true,
    data: newActivity,
    message: '活动创建成功'
  }
}

// 模拟获取活动列表
export const mockGetActivityList = async (params = {}) => {
  await delay(600)
  
  console.log('mockGetActivityList 调用参数:', params)
  
  // 优先从localStorage获取最新数据，确保包含新创建的活动
  let currentActivities = []
  
  try {
    const localStorageData = localStorage.getItem('campus_activities')
    if (localStorageData) {
      currentActivities = JSON.parse(localStorageData)
      console.log('从localStorage获取活动数据:', currentActivities.length, '个活动')
    }
  } catch (error) {
    console.warn('从localStorage读取活动数据失败:', error)
  }
  
  // 如果localStorage中没有数据，则从全局数据管理器获取
  if (!currentActivities || currentActivities.length === 0) {
    currentActivities = globalDataManager.getActivities()
    console.log('从全局数据管理器获取活动数据:', currentActivities.length, '个活动')
    
    // 如果全局数据管理器也没有数据，使用默认数据
    if (!currentActivities || currentActivities.length === 0) {
      const defaultActivities = [
    {
      id: "1",
      title: "中医养生讲座",
      type: "学术讲座",
      category: "study",
      description: "传统中医养生文化讲座，邀请知名中医专家分享养生知识",
      location: "教学楼A101",
      startTime: "2024-01-15T14:00:00",
      endTime: "2024-01-15T16:00:00",
      maxParticipants: 100,
      organizerId: "1",
      organizerName: "张教授",
      status: "ongoing",
      tags: ["学术", "健康", "养生"],
      createdAt: "2024-01-10T10:00:00"
    },
    {
      id: "2",
      title: "摄影作品展览",
      type: "文化艺术",
      category: "culture",
      description: "校园摄影爱好者作品展示，展现校园生活的美好瞬间",
      location: "艺术中心展厅",
      startTime: "2024-01-16T10:00:00",
      endTime: "2024-01-18T18:00:00",
      maxParticipants: 200,
      organizerId: "2",
      organizerName: "李老师",
      status: "ongoing",
      tags: ["艺术", "摄影", "展览"],
      createdAt: "2024-01-11T09:00:00"
    },
    {
      id: "3",
      title: "编程马拉松大赛",
      type: "科技创新",
      category: "tech",
      description: "48小时编程挑战赛，展现编程技能和创新能力",
      location: "计算机实验室",
      startTime: "2024-01-20T09:00:00",
      endTime: "2024-01-22T09:00:00",
      maxParticipants: 50,
      organizerId: "3",
      organizerName: "王教授",
      status: "recruiting",
      tags: ["编程", "科技", "竞赛"],
      createdAt: "2024-01-12T14:00:00"
    },
    {
      id: "4",
      title: "篮球友谊赛",
      type: "体育竞技",
      category: "sports",
      description: "院系篮球友谊赛，增进友谊，锻炼身体",
      location: "体育馆",
      startTime: "2024-01-17T15:00:00",
      endTime: "2024-01-17T17:00:00",
      maxParticipants: 40,
      organizerId: "4",
      organizerName: "赵教练",
      status: "recruiting",
      tags: ["体育", "篮球", "竞技"],
      createdAt: "2024-01-13T11:00:00"
    },
    {
      id: "5",
      title: "校园音乐节",
      type: "文艺演出",
      category: "culture",
      description: "校园音乐节，展现学生音乐才华，享受音乐盛宴",
      location: "大礼堂",
      startTime: "2024-01-25T19:00:00",
      endTime: "2024-01-25T21:30:00",
      maxParticipants: 500,
      organizerId: "5",
      organizerName: "陈老师",
      status: "recruiting",
      tags: ["音乐", "演出", "文艺"],
      createdAt: "2024-01-14T16:00:00"
    },
    {
      id: "6",
      title: "图书馆学习小组",
      type: "学习交流",
      category: "study",
      description: "图书馆学习小组，共同学习，互相进步",
      location: "图书馆三楼研讨室",
      startTime: "2024-01-18T14:00:00",
      endTime: "2024-01-18T16:00:00",
      maxParticipants: 20,
      organizerId: "6",
      organizerName: "刘老师",
      status: "recruiting",
      tags: ["学习", "交流", "图书馆"],
      createdAt: "2024-01-15T13:00:00"
    }
  ]
  
  // 将默认活动添加到全局数据管理器
  defaultActivities.forEach(activity => {
    globalDataManager.addActivity(activity)
  })
  
  currentActivities = defaultActivities
    }
  }
  
  let filteredActivities = [...currentActivities]
  
  // 应用筛选条件
  if (params.status && params.status !== 'all') {
    filteredActivities = filteredActivities.filter(act => act.status === params.status)
  }
  
  if (params.tags) {
    filteredActivities = filteredActivities.filter(act => 
      params.tags.some(tag => act.tags.includes(tag))
    )
  }
  
  // 按创建者筛选
  if (params.creatorId) {
    filteredActivities = filteredActivities.filter(act => act.organizerId === params.creatorId)
  }
  
  // 按参与者筛选
  if (params.participantId) {
    filteredActivities = filteredActivities.filter(act => {
      const participants = globalDataManager.getActivityParticipants(act.id) || []
      return participants.some(p => p.userId === params.participantId && p.status === 'approved')
    })
  }
  
  // 关键词搜索
  if (params.keyword && params.keyword.trim()) {
    const keyword = params.keyword.toLowerCase().trim()
    filteredActivities = filteredActivities.filter(act => 
      act.title.toLowerCase().includes(keyword) ||
      act.description.toLowerCase().includes(keyword) ||
      act.type.toLowerCase().includes(keyword) ||
      act.location.toLowerCase().includes(keyword)
    )
  }
  
  console.log('筛选后的活动数量:', filteredActivities.length)
  
  // 为每个活动动态计算状态并添加列表页面所需的字段
  const activitiesWithStatus = filteredActivities.map(activity => {
    const currentUserId = localStorage.getItem('currentUserId') || '1'
    const participants = globalDataManager.getActivityParticipants(activity.id) || []
    
    return {
      ...activity,
      // 确保地点字段格式一致
      locationName: typeof activity.location === 'object' ? activity.location.name : activity.location,
      location: typeof activity.location === 'object' ? activity.location : { name: activity.location },
      // 动态计算状态
      status: calculateActivityStatus(activity),
      // 添加列表页面需要的字段
      isEnrolled: participants.some(p => p.userId === currentUserId),
      isCreator: activity.organizerId === currentUserId || activity.creatorId === currentUserId,
      isApproved: participants.some(p => p.userId === currentUserId && p.status === 'approved'),
      distance: Math.floor(Math.random() * 5000) + 100, // 模拟距离数据
      participants: participants.length,
      // 确保必要字段存在
      coverImage: activity.coverImage || `https://picsum.photos/seed/${activity.id}/400/300.jpg`,
      tags: activity.tags || [],
      category: activity.category || 'other'
    }
  })
  
  // 分页
  const page = parseInt(params.page) || 1
  const pageSize = parseInt(params.pageSize) || 10
  const startIndex = (page - 1) * pageSize
  const paginatedActivities = activitiesWithStatus.slice(startIndex, startIndex + pageSize)
  
  const result = {
    success: true,
    data: {
      list: paginatedActivities,
      total: filteredActivities.length,
      page,
      pageSize
    },
    message: '获取活动列表成功'
  }
  
  console.log('返回的活动列表:', result)
  
  return result
}

// 模拟获取活动详情
export const mockGetActivityDetail = async (activityId) => {
  await delay(500)
  
  console.log('mockGetActivityDetail 被调用，activityId:', activityId)
  
  // 从全局数据管理器获取活动数据，确保数据一致性
  let activities = globalDataManager.getActivities()
  
  // 如果没有活动数据，使用默认的正确数据
  if (!activities || activities.length === 0) {
    activities = [
      {
        id: "1",
        title: "中医养生讲座",
        type: "学术讲座",
        category: "study",
        description: "邀请中医专家讲解中医养生知识，分享传统保健方法",
        location: "学术报告厅",
        startTime: "2024-01-15T14:00:00",
        endTime: "2024-01-15T16:00:00",
        maxParticipants: 30,
        organizerId: "2",
        organizerName: "中医学院",
        status: "ongoing"
      },
      {
        id: "2",
        title: "摄影作品展览",
        type: "文化艺术",
        category: "culture",
        description: "展示学生摄影作品，分享摄影技巧，交流创作心得",
        location: "艺术展厅",
        startTime: "2024-01-16T10:00:00",
        endTime: "2024-01-18T18:00:00",
        maxParticipants: 25,
        organizerId: "3",
        organizerName: "摄影协会",
        status: "ongoing"
      },
      {
        id: "3",
        title: "编程马拉松大赛",
        type: "科技创新",
        category: "tech",
        description: "24小时编程挑战赛，主题为智慧校园，展示编程技能",
        location: "创新实验室",
        startTime: "2024-01-20T09:00:00",
        endTime: "2024-01-22T09:00:00",
        maxParticipants: 20,
        organizerId: "4",
        organizerName: "计算机学院",
        status: "recruiting"
      },
      {
        id: "4",
        title: "校园音乐节",
        type: "文艺演出",
        category: "culture",
        description: "年度校园音乐盛典，邀请校内知名乐队和校外专业音乐人同台演出。涵盖摇滚、民谣、流行等多种音乐风格。",
        location: "露天剧场",
        startTime: "2024-01-25T19:00:00",
        endTime: "2024-01-25T23:00:00",
        maxParticipants: 1000,
        organizerId: "5",
        organizerName: "学生会文艺部",
        status: "recruiting"
      },
      {
        id: "5",
        title: "篮球友谊赛",
        type: "体育竞技",
        category: "sports",
        description: "周末篮球比赛，欢迎所有篮球爱好者参加，一起享受运动的快乐",
        location: "篮球场1",
        startTime: "2024-01-17T15:00:00",
        endTime: "2024-01-17T17:00:00",
        maxParticipants: 8,
        organizerId: "1",
        organizerName: "篮球社",
        status: "recruiting"
      },
      {
        id: "6",
        title: "图书馆学习小组",
        type: "学习交流",
        category: "study",
        description: "图书馆学习小组，共同学习，互相进步",
        location: "图书馆三楼研讨室",
        startTime: "2024-01-18T14:00:00",
        endTime: "2024-01-18T16:00:00",
        maxParticipants: 20,
        organizerId: "6",
        organizerName: "刘老师",
        status: "recruiting"
      }
    ]
  }
  
  // 根据activityId查找活动，确保类型一致性
  let activity = activities.find(act => String(act.id) === String(activityId))
  
  console.log('查找的活动详情:', activity)
  
  if (!activity) {
    console.warn('活动不存在，activityId:', activityId, '可用活动ID:', activities.map(a => a.id))
    // 返回一个友好的错误响应，而不是抛出异常
    return {
      success: false,
      message: `活动ID ${activityId} 不存在，请检查活动列表`,
      error: {
        code: 'ACTIVITY_NOT_FOUND',
        activityId: activityId,
        availableIds: activities.map(a => a.id)
      }
    }
  }
  
  // 获取参与者信息
  let participants = globalDataManager.getActivityParticipants(activityId) || []
  const enrollments = globalDataManager.getActivityEnrollments(activityId) || []
  const currentUserId = getCurrentUserId()
  
  // 获取用户的参与记录，包含签到状态
  const participatedActivities = globalDataManager.getParticipatedActivities()
  
  // 为参与者数据添加签到状态信息
  participants = participants.map(participant => {
    const participation = participatedActivities.find(
      p => p.activityId === parseInt(activityId) && p.userId === participant.userId
    )
    
    return {
      ...participant,
      checkedIn: participation?.checkedIn || false,
      checkInTime: participation?.checkInTime || null
    }
  })
  
  // 动态计算活动状态
  const calculatedStatus = calculateActivityStatus(activity)
  
  // 构建组织者信息
  const organizer = {
    id: activity.organizerId,
    name: activity.organizerName,
    avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEOURBREIiLz4KPHBhdGggZD0iTTIwIDIyQzIzLjMxMzcgMjIgMjYgMTkuMzEzNyAyNiAxNkMyNiAxMi42ODYzIDIzLjMxMzcgMTAgMjAgMTBDMTYuNjg2MyAxMCAxNCAxMi42ODYzIDE0IDE2QzE0IDE5LjMxMzcgMTYuNjg2MyAyMiAyMCAyMloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yOCAzMEMyOCAyNy43OTAyIDI2LjIwOTggMjYgMjQgMjZIMTZDMTMuNzkwMiAyNiAxMiAyNy43OTAyIDEyIDMwVjMxQzEyIDMxLjU1MjMgMTIuNDQ3NyAzMiAxMyAzMkgyN0MyNy41NTIzIDMyIDI4IDMxLjU1MjMgMjggMzFWMzBaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
    role: '组织者',
    creditScore: 100
  }
  
  // 构建位置信息
  const locationInfo = {
    name: activity.location,
    address: activity.location,
    coords: null // 如果需要坐标可以在这里添加
  }
  
  // 构建完整的活动详情数据，确保与前端期望的结构一致
  const fullActivityData = {
    id: String(activity.id),
    title: activity.title,
    description: activity.description,
    category: activity.category || 'study',
    type: activity.type,
    status: calculatedStatus,
    startTime: activity.startTime,
    endTime: activity.endTime,
    enrollStartTime: activity.enrollStartTime || activity.startTime,
    enrollEndTime: activity.enrollEndTime || activity.startTime,
    location: locationInfo,
    coords: activity.coords || null,
    organizer: organizer,
    currentParticipants: participants.length,
    maxParticipants: activity.maxParticipants,
    participants: participants,
    enrollments: enrollments,
    createdAt: activity.createdAt || new Date().toISOString(),
    updatedAt: activity.updatedAt || new Date().toISOString()
  }
  
  console.log('返回的完整活动详情:', {
    id: fullActivityData.id,
    title: fullActivityData.title,
    type: fullActivityData.type,
    status: fullActivityData.status
  })
  
  return {
    success: true,
    data: fullActivityData,
    message: '获取活动详情成功'
  }
}

// 其他必要的导出函数
export const mockRegister = async (userData) => {
  await delay(1000)
  return { success: true, data: { id: 1 }, message: '注册成功' }
}

export const mockGetUserInfo = async (token) => {
  await delay(500)
  return { success: true, data: users[0], message: '获取用户信息成功' }
}

export const mockJoinActivity = async (activityId) => {
  await delay(800)
  
  const currentUserId = getCurrentUserId()
  const currentUser = globalDataManager.getUsers().find(u => u.id === currentUserId)
  
  // 创建参与记录
  const participation = {
    activityId: parseInt(activityId),
    userId: currentUserId,
    userName: currentUser?.realName || '测试用户',
    status: 'pending',
    joinTime: new Date().toISOString()
  }
  
  // 添加到参与记录中
  globalDataManager.addParticipatedActivity(participation)
  
  return { success: true, data: { activityId, status: 'pending' }, message: '报名成功，请等待审核' }
}

export const mockAgreeJoinActivity = async (data) => {
  await delay(600)
  
  const { activityId, userId } = data
  
  // 更新参与记录状态为已通过
  globalDataManager.updateParticipatedActivity(activityId, userId, {
    status: 'approved',
    approvedTime: new Date().toISOString()
  })
  
  // 同时更新活动参与者数据
  const participatedActivities = globalDataManager.getParticipatedActivities()
  const participation = participatedActivities.find(
    p => p.activityId === parseInt(activityId) && p.userId === userId
  )
  
  if (participation) {
    let participants = globalDataManager.getActivityParticipants(activityId)
    const existingParticipant = participants.find(p => p.userId === userId)
    
    if (!existingParticipant) {
      participants.push({
        userId: participation.userId,
        userName: participation.userName,
        status: participation.status,
        joinTime: participation.joinTime
      })
      globalDataManager.setActivityParticipants(activityId, participants)
    } else {
      existingParticipant.status = participation.status
    }
  }
  
  return { success: true, message: '已同意该用户加入活动' }
}

export const mockCheckInActivity = async (activityId) => {
  await delay(500)
  
  const currentUserId = getCurrentUserId()
  const participatedActivities = globalDataManager.getParticipatedActivities()
  
  // 查找用户的参与记录
  const participation = participatedActivities.find(
    p => p.activityId === parseInt(activityId) && p.userId === currentUserId
  )
  
  if (!participation) {
    return { 
      success: false, 
      message: '您还未报名此活动或报名未通过审核' 
    }
  }
  
  if (participation.status !== 'approved') {
    return { 
      success: false, 
      message: '您的报名还未通过审核，无法签到' 
    }
  }
  
  // 检查是否已经签到
  if (participation.checkedIn) {
    return { 
      success: false, 
      message: '您已经签到过了' 
    }
  }
  
  // 更新签到状态
  const checkInTime = new Date().toISOString()
  globalDataManager.updateParticipatedActivity(activityId, currentUserId, {
    checkedIn: true,
    checkInTime: checkInTime
  })
  
  // 同时更新活动数据中的参与者状态
  const activities = globalDataManager.getActivities()
  const activity = activities.find(a => a.id === parseInt(activityId))
  if (activity && activity.participants) {
    const participant = activity.participants.find(
      p => p.userId === currentUserId
    )
    if (participant) {
      participant.checkedIn = true
      participant.checkInTime = checkInTime
    }
  }
  
  return { 
    success: true, 
    data: { 
      checkInTime: checkInTime,
      checkedIn: true
    }, 
    message: '签到成功！' 
  }
}

export const mockSendActivityChat = async (data) => {
  await delay(400)
  const newMessage = {
    id: Date.now(),
    userId: getCurrentUserId(),
    userName: globalDataManager.getUsers()[0]?.realName || '测试用户',
    content: data.content,
    time: new Date().toISOString()
  }
  return { success: true, data: newMessage, message: '消息发送成功' }
}

export const mockGetActivityChatHistory = async (activityId, params = {}) => {
  await delay(400)
  console.log('mockGetActivityChatHistory 接收到的参数:', { activityId, params })
  
  // 从全局数据管理器获取活动聊天记录
  const chats = globalDataManager.getActivityChats(activityId) || []
  
  return {
    success: true,
    data: {
      list: chats,
      total: chats.length,
      page: params.page || 1,
      pageSize: params.pageSize || 20
    },
    message: '获取聊天记录成功'
  }
}

// 导出全局数据管理器
export { globalDataManager };

// 添加缺失的导出
export const mockChangePassword = async (data) => {
  await delay(800)
  return { success: true, message: '密码修改成功' }
}

// 导出活动数据（如果需要）
export { mockActivities };

// 添加缺失的 mockSaveUserLocation 导出
export const mockSaveUserLocation = async (locationData) => {
  await delay(500)
  console.log('mockSaveUserLocation 接收到的位置数据:', locationData)
  return { 
    success: true, 
    data: { 
      id: Date.now(),
      ...locationData,
      savedAt: new Date().toISOString()
    }, 
    message: '位置保存成功' 
  }
}

// 添加缺失的 mockUpdateUserProfile 导出
export const mockUpdateUserProfile = async (profileData) => {
  await delay(800)
  console.log('mockUpdateUserProfile 接收到的数据:', profileData)
  
  // 模拟更新用户资料
  const currentUserId = getCurrentUserId()
  const users = globalDataManager.getUsers()
  const userIndex = users.findIndex(u => u.id === currentUserId)
  
  if (userIndex !== -1) {
    // 更新用户信息
    Object.assign(users[userIndex], profileData)
    return {
      success: true,
      data: users[userIndex],
      message: '用户资料更新成功'
    }
  } else {
    return {
      success: false,
      message: '用户不存在'
    }
  }
}

// 添加缺失的 mockUploadAvatar 导出
export const mockUploadAvatar = async (file) => {
  await delay(1000)
  console.log('mockUploadAvatar 接收到的文件:', file)
  
  // 模拟头像上传，返回一个随机头像URL
  const avatarUrls = [
    'https://picsum.photos/seed/avatar1/200/200.jpg',
    'https://picsum.photos/seed/avatar2/200/200.jpg',
    'https://picsum.photos/seed/avatar3/200/200.jpg',
    'https://picsum.photos/seed/avatar4/200/200.jpg',
    'https://picsum.photos/seed/avatar5/200/200.jpg'
  ]
  
  const randomAvatar = avatarUrls[Math.floor(Math.random() * avatarUrls.length)]
  
  return {
    success: true,
    data: {
      url: randomAvatar,
      filename: `avatar_${Date.now()}.jpg`,
      size: file?.size || 12345
    },
    message: '头像上传成功'
  }
}

// 添加缺失的消息相关导出
export const mockSendMessage = async (messageData) => {
  await delay(300)
  console.log('mockSendMessage 接收到的数据:', messageData)
  
  const newMessage = {
    id: Date.now(),
    senderId: getCurrentUserId(),
    senderName: globalDataManager.getUsers()[0]?.realName || '测试用户',
    ...messageData,
    sentAt: new Date().toISOString()
  }
  
  return {
    success: true,
    data: newMessage,
    message: '消息发送成功'
  }
}

export const mockRecallMessage = async (recallData) => {
  await delay(300)
  console.log('mockRecallMessage 接收到的数据:', recallData)
  
  return {
    success: true,
    data: {
      messageId: recallData.messageId,
      recalled: true,
      recallTime: new Date().toISOString()
    },
    message: '消息撤回成功'
  }
}

export const mockGetMessageHistory = async (params) => {
  await delay(400)
  console.log('mockGetMessageHistory 接收到的参数:', params)
  
  const mockHistory = [
    {
      id: 1,
      senderId: 2,
      senderName: '张三',
      receiverId: getCurrentUserId(),
      content: '你好，最近怎么样？',
      sentAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 2,
      senderId: getCurrentUserId(),
      senderName: '当前用户',
      receiverId: 2,
      content: '挺好的，谢谢关心！',
      sentAt: new Date(Date.now() - 1800000).toISOString()
    }
  ]
  
  return {
    success: true,
    data: {
      list: mockHistory,
      total: mockHistory.length,
      page: params.page || 1,
      pageSize: params.pageSize || 20
    },
    message: '获取消息历史成功'
  }
}

export const mockGetActivityMessageHistory = async (activityId, params = {}) => {
  await delay(400)
  console.log('mockGetActivityMessageHistory 接收到的参数:', { activityId, params })
  
  // 从全局数据管理器获取活动聊天记录
  const chats = globalDataManager.getActivityChats(activityId) || []
  
  return {
    success: true,
    data: {
      list: chats,
      total: chats.length,
      page: params.page || 1,
      pageSize: params.pageSize || 20
    },
    message: '获取活动消息历史成功'
  }
}

// 其他导出函数保持不变

// 添加缺失的用户相关导出
export const mockUserLogin = mockLogin; // 别名导出，与 user.js 中的导入保持一致

export const mockUserRegister = async (data) => {
  await delay(800)
  console.log('mockUserRegister 接收到的数据:', data)
  
  // 模拟用户注册
  const users = globalDataManager.getUsers()
  
  // 检查学号是否已存在
  if (users.some(u => u.studentId === data.studentId)) {
    return {
      success: false,
      message: '学号已存在'
    }
  }
  
  // 创建新用户
  const newUser = {
    id: users.length + 1,
    ...data,
    creditScore: 100,
    createdAt: new Date().toISOString()
  }
  
  users.push(newUser)
  
  return {
    success: true,
    data: newUser,
    message: '注册成功'
  }
}

export const mockUserLogout = async () => {
  await delay(300)
  return { success: true, message: '退出登录成功' }
}

// 团队相关的模拟函数
export const mockCreateTeam = async (teamData) => {
  await delay(800)
  console.log('mockCreateTeam 接收到的数据:', teamData)
  
  const newTeam = {
    id: Date.now(),
    ...teamData,
    leaderId: getCurrentUserId(),
    leaderName: globalDataManager.getUsers()[0]?.realName || '测试用户',
    memberCount: 1,
    status: 'active',
    createdAt: new Date().toISOString()
  }
  
  return {
    success: true,
    data: newTeam,
    message: '团队创建成功'
  }
}

export const mockApplyTeam = async (applicationData) => {
  await delay(500)
  console.log('mockApplyTeam 接收到的数据:', applicationData)
  
  return {
    success: true,
    data: {
      id: Date.now(),
      ...applicationData,
      status: 'pending',
      appliedAt: new Date().toISOString()
    },
    message: '申请提交成功'
  }
}

export const mockAgreeTeamApply = async (approvalData) => {
  await delay(500)
  console.log('mockAgreeTeamApply 接收到的数据:', approvalData)
  
  return {
    success: true,
    data: {
      ...approvalData,
      status: 'approved',
      approvedAt: new Date().toISOString()
    },
    message: '申请审核成功'
  }
}

export const mockSearchTeam = async (searchParams) => {
  await delay(600)
  console.log('mockSearchTeam 接收到的参数:', searchParams)
  
  // 模拟团队数据
  const mockTeams = [
    {
      id: 1,
      name: '篮球队',
      description: '热爱篮球的团队',
      leaderId: 1,
      leaderName: '张三',
      memberCount: 5,
      maxMembers: 10,
      status: 'active',
      tags: ['运动', '篮球'],
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      name: '编程小组',
      description: '一起学习编程',
      leaderId: 2,
      leaderName: '李四',
      memberCount: 3,
      maxMembers: 8,
      status: 'active',
      tags: ['学习', '编程'],
      createdAt: new Date().toISOString()
    }
  ]
  
  let filteredTeams = [...mockTeams]
  
  // 应用搜索条件
  if (searchParams.keyword) {
    filteredTeams = filteredTeams.filter(team => 
      team.name.includes(searchParams.keyword) || 
      team.description.includes(searchParams.keyword)
    )
  }
  
  if (searchParams.tags) {
    filteredTeams = filteredTeams.filter(team => 
      searchParams.tags.some(tag => team.tags.includes(tag))
    )
  }
  
  return {
    success: true,
    data: {
      list: filteredTeams,
      total: filteredTeams.length,
      page: searchParams.page || 1,
      pageSize: searchParams.pageSize || 10
    },
    message: '搜索团队成功'
  }
}

export const mockGetMyTeams = async () => {
  await delay(400)
  
  const currentUserId = getCurrentUserId()
  
  return {
    success: true,
    data: [
      {
        id: 1,
        name: '我的团队1',
        role: 'leader',
        memberCount: 5,
        maxMembers: 10,
        status: 'active'
      },
      {
        id: 2,
        name: '我的团队2',
        role: 'member',
        memberCount: 8,
        maxMembers: 15,
        status: 'active'
      }
    ],
    message: '获取我的团队成功'
  }
}

export const mockGetTeamMembers = async (teamId) => {
  await delay(300)
  
  const mockMembers = [
    {
      id: 1,
      name: '张三',
      role: 'leader',
      joinTime: new Date().toISOString()
    },
    {
      id: 2,
      name: '李四',
      role: 'member',
      joinTime: new Date().toISOString()
    }
  ]
  
  return {
    success: true,
    data: {
      list: mockMembers,
      total: mockMembers.length
    },
    message: '获取团队成员成功'
  }
}

// 获取活动聊天室列表（用户参与的和创建的）
export const mockGetActivityChatRooms = async () => {
  await delay(400)
  const currentUserId = getCurrentUserId()
  const activities = globalDataManager.getActivities()
  const participatedActivities = globalDataManager.getParticipatedActivities()
  
  // 获取用户创建的活动
  const createdActivities = activities.filter(activity => activity.creatorId === currentUserId)
  
  // 获取用户已参与的活动（审核通过的）
  const enrolledActivities = participatedActivities
    .filter(participation => participation.userId === currentUserId && participation.status === 'approved')
    .map(participation => activities.find(activity => activity.id === participation.activityId))
    .filter(Boolean)
  
  // 合并所有活动聊天室
  const allChatRooms = [...createdActivities, ...enrolledActivities]
  
  const chatRooms = allChatRooms.map(activity => {
    const activityChats = globalDataManager.getActivityChats(activity.id)
    const lastMessage = activityChats?.slice(-1)[0]
    
    return {
      id: activity.id,
      name: activity.title,
      type: 'activity',
      activityId: activity.id,
      avatar: activity.images?.[0] || '/default-activity.png',
      lastMessage: lastMessage ? `${lastMessage.userName}: ${lastMessage.content}` : `暂无消息 - ${activity.title}`,
      lastMessageTime: lastMessage?.timestamp || activity.createdAt,
      unreadCount: lastMessage ? Math.floor(Math.random() * 5) : 0, // 有消息才有未读数
      memberCount: activity.currentParticipants || 0,
      isCreator: activity.creatorId === currentUserId,
      status: activity.status
    }
  })
  
  return {
    success: true,
    data: chatRooms,
    message: '获取活动聊天室列表成功'
  }
}

// 发送活动聊天消息
export const mockSendActivityMessage = async (activityId, content) => {
  await delay(200)
  const currentUserId = getCurrentUserId()
  const currentUser = globalDataManager.getUsers()[0]
  
  const newMessage = {
    id: Date.now(),
    senderId: currentUserId,
    senderName: currentUser.realName || '用户',
    content: content,
    timestamp: new Date().toISOString(),
    type: 'text'
  }
  
  globalDataManager.addActivityChat(activityId, newMessage)
  
  return {
    success: true,
    data: newMessage,
    message: '消息发送成功'
  }
}

// 获取活动聊天成员列表
export const mockGetActivityChatMembers = async (activityId) => {
  await delay(300)
  const activities = globalDataManager.getActivities()
  const participatedActivities = globalDataManager.getParticipatedActivities()
  const users = globalDataManager.getUsers()
  
  const activity = activities.find(a => a.id === parseInt(activityId))
  if (!activity) {
    return {
      success: false,
      message: '活动不存在'
    }
  }
  
  // 获取活动创建者
  const creator = users.find(u => u.id === activity.creatorId)
  
  // 获取已参与的成员
  const members = participatedActivities
    .filter(p => p.activityId === parseInt(activityId) && p.status === 'approved')
    .map(p => {
      const user = users.find(u => u.id === p.userId)
      return user ? {
        id: user.id,
        name: user.realName,
        avatar: user.avatar || '/default-avatar.png',
        role: p.userId === activity.creatorId ? 'creator' : 'member',
        joinTime: p.createdAt
      } : null
    })
    .filter(Boolean)
  
  // 确保创建者在成员列表中
  if (creator && !members.find(m => m.id === creator.id)) {
    members.unshift({
      id: creator.id,
      name: creator.realName,
      avatar: creator.avatar || '/default-avatar.png',
      role: 'creator',
      joinTime: activity.createdAt
    })
  }
  
  return {
    success: true,
    data: members,
    message: '获取聊天成员成功'
  }
}

// 导出团队数据供其他模块使用
export const mockTeams = [
  {
    id: 1,
    name: '篮球队',
    description: '热爱篮球的团队',
    leaderId: 1,
    leaderName: '张三',
    memberCount: 5,
    maxMembers: 10,
    status: 'active',
    tags: ['运动', '篮球'],
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: '编程小组',
    description: '一起学习编程',
    leaderId: 2,
    leaderName: '李四',
    memberCount: 3,
    maxMembers: 8,
    status: 'active',
    tags: ['学习', '编程'],
    createdAt: new Date().toISOString()
  }
]

export const teamMembers = []
export const teamApplications = []