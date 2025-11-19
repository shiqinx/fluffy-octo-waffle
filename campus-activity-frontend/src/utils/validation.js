// 统一参数验证和格式化工具
import { createValidationError } from './errorHandler'

/**
 * 参数验证规则
 */
export const ValidationRules = {
  // 学号验证
  studentId: {
    required: true,
    pattern: /^\d{6,12}$/,
    message: '学号必须是6-12位数字'
  },
  
  // 用户名验证（兼容学号）
  username: {
    required: true,
    pattern: /^[a-zA-Z0-9_]{3,20}$/,
    message: '用户名必须是3-20位字母、数字或下划线'
  },
  
  // 密码验证
  password: {
    required: true,
    minLength: 6,
    pattern: /^(?=.*[a-zA-Z])(?=.*\d)/,
    message: '密码至少6位，必须包含字母和数字'
  },
  
  // 中文姓名验证
  realName: {
    required: true,
    pattern: /^[\u4e00-\u9fa5]{2,10}$/,
    message: '姓名必须是2-10位中文字符'
  },
  
  // 手机号验证
  phone: {
    required: false,
    pattern: /^1[3-9]\d{9}$/,
    message: '手机号格式错误'
  },
  
  // 邮箱验证
  email: {
    required: false,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: '邮箱格式错误'
  },
  
  // 活动ID验证
  activityId: {
    required: true,
    pattern: /^[a-zA-Z0-9_-]+$/,
    message: '活动ID格式错误'
  },
  
  // 团队ID验证
  teamId: {
    required: true,
    pattern: /^\d+$/,
    message: '团队ID必须是数字'
  },
  
  // 用户ID验证
  userId: {
    required: true,
    pattern: /^\d+$/,
    message: '用户ID必须是数字'
  },
  
  // 分页参数验证
  page: {
    required: false,
    type: 'number',
    min: 1,
    default: 1,
    message: '页码必须是大于0的数字'
  },
  
  pageSize: {
    required: false,
    type: 'number',
    min: 1,
    max: 100,
    default: 10,
    message: '每页数量必须在1-100之间'
  },
  
  // 关键词搜索验证
  keyword: {
    required: false,
    type: 'string',
    maxLength: 50,
    message: '搜索关键词不能超过50个字符'
  }
}

/**
 * 验证单个字段
 * @param {string} fieldName 字段名
 * @param {any} value 字段值
 * @param {Object} rule 验证规则
 * @returns {Promise<void>}
 */
export const validateField = async (fieldName, value, rule) => {
  // 检查必填
  if (rule.required && (value === undefined || value === null || value === '')) {
    throw createValidationError(`${fieldName}不能为空`, fieldName)
  }
  
  // 如果非必填且为空，跳过其他验证
  if (!rule.required && (value === undefined || value === null || value === '')) {
    return
  }
  
  // 类型检查
  if (rule.type && typeof value !== rule.type) {
    throw createValidationError(`${fieldName}类型错误`, fieldName)
  }
  
  // 字符串长度检查
  if (typeof value === 'string') {
    if (rule.minLength && value.length < rule.minLength) {
      throw createValidationError(`${fieldName}长度不能少于${rule.minLength}个字符`, fieldName)
    }
    
    if (rule.maxLength && value.length > rule.maxLength) {
      throw createValidationError(`${fieldName}长度不能超过${rule.maxLength}个字符`, fieldName)
    }
  }
  
  // 数字范围检查
  if (typeof value === 'number') {
    if (rule.min !== undefined && value < rule.min) {
      throw createValidationError(`${fieldName}不能小于${rule.min}`, fieldName)
    }
    
    if (rule.max !== undefined && value > rule.max) {
      throw createValidationError(`${fieldName}不能大于${rule.max}`, fieldName)
    }
  }
  
  // 正则表达式检查
  if (rule.pattern && !rule.pattern.test(value)) {
    throw createValidationError(rule.message, fieldName)
  }
}

/**
 * 验证对象参数
 * @param {Object} data 要验证的数据
 * @param {Object} rules 验证规则对象
 * @returns {Promise<Object>} 验证后的数据
 */
export const validateParams = async (data, rules) => {
  const validatedData = {}
  
  for (const [fieldName, rule] of Object.entries(rules)) {
    const value = data[fieldName]
    
    try {
      await validateField(fieldName, value, rule)
      
      // 设置默认值
      if (value === undefined && rule.default !== undefined) {
        validatedData[fieldName] = rule.default
      } else if (value !== undefined) {
        validatedData[fieldName] = value
      }
    } catch (error) {
      throw error
    }
  }
  
  return validatedData
}

/**
 * 登录参数验证
 * @param {Object} credentials 登录凭据
 * @returns {Promise<Object>} 验证后的登录参数
 */
export const validateLoginParams = async (credentials) => {
  // 首先检查是否为null或undefined
  if (!credentials || typeof credentials !== 'object') {
    throw createValidationError('登录参数不能为空')
  }
  
  const rules = {
    studentId: { ...ValidationRules.studentId, required: false },
    username: { ...ValidationRules.username, required: false },
    password: ValidationRules.password
  }
  
  const data = await validateParams(credentials, rules)
  
  // 兼容多种登录方式 - 至少需要学号或用户名其中一个
  const userId = data.studentId || data.username
  if (!userId || userId.trim() === '') {
    throw createValidationError('学号或用户名不能为空')
  }
  
  return {
    studentId: userId.trim(), // 保持原始字段名，让mockLogin能正确识别
    username: userId.trim(),  // 同时提供username字段
    password: data.password,
    rememberMe: data.rememberMe || false
  }
}

/**
 * 注册参数验证
 * @param {Object} userData 用户数据
 * @returns {Promise<Object>} 验证后的注册参数
 */
export const validateRegisterParams = async (userData) => {
  // 首先检查是否为null或undefined
  if (!userData || typeof userData !== 'object') {
    throw createValidationError('注册参数不能为空')
  }
  
  const rules = {
    studentId: ValidationRules.studentId,
    realName: ValidationRules.realName,
    password: ValidationRules.password,
    confirmPassword: {
      required: true,
      message: '确认密码不能为空'
    },
    phone: { ...ValidationRules.phone, required: false },
    email: { ...ValidationRules.email, required: false }
  }
  
  const data = await validateParams(userData, rules)
  
  // 验证密码确认
  if (data.password !== data.confirmPassword) {
    throw createValidationError('两次输入的密码不一致', 'confirmPassword')
  }
  
  // 返回清理后的数据
  const { confirmPassword, ...result } = data
  return result
}

/**
 * 活动参数验证
 * @param {Object} activityData 活动数据
 * @returns {Promise<Object>} 验证后的活动参数
 */
export const validateActivityParams = async (activityData) => {
  const rules = {
    title: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 100,
      message: '活动标题长度必须在1-100字符之间'
    },
    description: {
      required: true,
      type: 'string',
      minLength: 10,
      maxLength: 2000,
      message: '活动描述长度必须在10-2000字符之间'
    },
    startTime: {
      required: true,
      type: 'string',
      message: '开始时间不能为空'
    },
    endTime: {
      required: true,
      type: 'string',
      message: '结束时间不能为空'
    },
    location: {
      required: true,
      type: 'object',
      message: '活动地点不能为空'
    },
    maxParticipants: {
      required: true,
      type: 'number',
      min: 1,
      max: 1000,
      message: '参与人数必须在1-1000之间'
    },
    tags: {
      required: false,
      type: 'array',
      maxItems: 10,
      message: '标签数量不能超过10个'
    }
  }
  
  const data = await validateParams(activityData, rules)
  
  // 验证时间逻辑
  const startTime = new Date(data.startTime)
  const endTime = new Date(data.endTime)
  const now = new Date()
  
  if (startTime <= now) {
    throw createValidationError('活动开始时间必须在未来', 'startTime')
  }
  
  if (endTime <= startTime) {
    throw createValidationError('活动结束时间必须晚于开始时间', 'endTime')
  }
  
  return data
}

/**
 * 分页参数验证和格式化
 * @param {Object} params 查询参数
 * @returns {Promise<Object>} 格式化的分页参数
 */
export const validatePaginationParams = async (params = {}) => {
  const rules = {
    page: ValidationRules.page,
    pageSize: ValidationRules.pageSize,
    keyword: ValidationRules.keyword
  }
  
  return await validateParams(params, rules)
}

/**
 * 加入活动参数验证
 * @param {Object} enrollmentData 报名数据
 * @returns {Promise<Object>} 验证后的报名参数
 */
export const validateJoinActivityParams = async (enrollmentData) => {
  const rules = {
    activityId: ValidationRules.activityId,
    userId: ValidationRules.userId,
    message: {
      required: false,
      type: 'string',
      maxLength: 200,
      message: '申请消息不能超过200个字符'
    }
  }
  
  return await validateParams(enrollmentData, rules)
}

/**
 * 数据清理工具
 * @param {Object} data 原始数据
 * @param {Array} allowedFields 允许的字段列表
 * @returns {Object} 清理后的数据
 */
export const sanitizeData = (data, allowedFields) => {
  const sanitized = {}
  
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      sanitized[field] = data[field]
    }
  }
  
  return sanitized
}

/**
 * 移除空值字段
 * @param {Object} data 数据对象
 * @returns {Object} 清理后的数据
 */
export const removeEmptyFields = (data) => {
  const cleaned = {}
  
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined && value !== '') {
      cleaned[key] = value
    }
  }
  
  return cleaned
}