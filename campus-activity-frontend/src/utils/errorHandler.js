// 统一API错误处理工具
export class ApiError extends Error {
  constructor(message, code, type = 'API_ERROR') {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.type = type
  }
}

export const ErrorTypes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
}

export const ErrorCodes = {
  // 网络相关
  NETWORK_OFFLINE: 'NETWORK_OFFLINE',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  
  // 认证相关
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  UNAUTHORIZED: 'UNAUTHORIZED',
  
  // 权限相关
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // 验证相关
  INVALID_PARAMETERS: 'INVALID_PARAMETERS',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // 资源相关
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  
  // 服务器相关
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // 业务逻辑相关
  BUSINESS_LOGIC_ERROR: 'BUSINESS_LOGIC_ERROR',
  DUPLICATE_OPERATION: 'DUPLICATE_OPERATION'
}

/**
 * 统一错误处理函数
 * @param {Error|Object} error 原始错误
 * @param {string} defaultMessage 默认错误消息
 * @param {Object} options 选项
 * @returns {Object} 标准化的错误响应
 */
export const handleApiError = (error, defaultMessage = '操作失败', options = {}) => {
  console.error('🚨 API错误详情:', {
    error,
    defaultMessage,
    options,
    timestamp: new Date().toISOString()
  })

  // 如果已经是ApiError，直接返回
  if (error instanceof ApiError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        type: error.type
      }
    }
  }

  // 分析错误类型
  const errorInfo = analyzeError(error)
  
  // 根据选项决定是否显示详细错误
  const shouldShowDetails = options.showDetails || false
  const userMessage = shouldShowDetails ? errorInfo.message : getUserFriendlyMessage(errorInfo)

  return {
    success: false,
    error: {
      code: errorInfo.code,
      message: userMessage,
      type: errorInfo.type,
      originalError: options.includeOriginal ? error : undefined,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * 分析错误类型和代码
 * @param {Error|Object} error 错误对象
 * @returns {Object} 错误信息
 */
const analyzeError = (error) => {
  // 网络错误
  if (!navigator.onLine) {
    return {
      type: ErrorTypes.NETWORK_ERROR,
      code: ErrorCodes.NETWORK_OFFLINE,
      message: '网络连接已断开，请检查网络设置'
    }
  }

  // HTTP状态码错误
  if (error.response) {
    const status = error.response.status
    const data = error.response.data || {}

    switch (status) {
      case 400:
        return {
          type: ErrorTypes.VALIDATION_ERROR,
          code: data.code || ErrorCodes.INVALID_PARAMETERS,
          message: data.message || '请求参数错误'
        }
      case 401:
        return {
          type: ErrorTypes.AUTH_ERROR,
          code: data.code || ErrorCodes.UNAUTHORIZED,
          message: data.message || '身份验证失败，请重新登录'
        }
      case 403:
        return {
          type: ErrorTypes.PERMISSION_ERROR,
          code: data.code || ErrorCodes.FORBIDDEN,
          message: data.message || '权限不足，无法执行此操作'
        }
      case 404:
        return {
          type: ErrorTypes.NOT_FOUND_ERROR,
          code: data.code || ErrorCodes.NOT_FOUND,
          message: data.message || '请求的资源不存在'
        }
      case 408:
        return {
          type: ErrorTypes.TIMEOUT_ERROR,
          code: ErrorCodes.NETWORK_TIMEOUT,
          message: '请求超时，请稍后重试'
        }
      case 409:
        return {
          type: ErrorTypes.BUSINESS_LOGIC_ERROR,
          code: data.code || ErrorCodes.RESOURCE_CONFLICT,
          message: data.message || '操作冲突，请检查数据状态'
        }
      case 429:
        return {
          type: ErrorTypes.BUSINESS_LOGIC_ERROR,
          code: ErrorCodes.DUPLICATE_OPERATION,
          message: '操作过于频繁，请稍后再试'
        }
      case 500:
        return {
          type: ErrorTypes.SERVER_ERROR,
          code: ErrorCodes.INTERNAL_SERVER_ERROR,
          message: '服务器内部错误，请稍后重试'
        }
      case 503:
        return {
          type: ErrorTypes.SERVER_ERROR,
          code: ErrorCodes.SERVICE_UNAVAILABLE,
          message: '服务暂时不可用，请稍后重试'
        }
      default:
        return {
          type: ErrorTypes.SERVER_ERROR,
          code: `HTTP_${status}`,
          message: data.message || `服务器错误 (${status})`
        }
    }
  }

  // 请求超时
  if (error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'))) {
    return {
      type: ErrorTypes.TIMEOUT_ERROR,
      code: ErrorCodes.NETWORK_TIMEOUT,
      message: '请求超时，请检查网络连接'
    }
  }

  // 网络连接错误
  if (error.code === 'NETWORK_ERROR' || (error.message && error.message.includes('Network Error'))) {
    return {
      type: ErrorTypes.NETWORK_ERROR,
      code: ErrorCodes.NETWORK_OFFLINE,
      message: '网络连接失败，请检查网络设置'
    }
  }

  // 业务逻辑错误（来自Mock API或自定义错误）
  if (error && error.message && typeof error.message === 'string') {
    // 常见业务错误模式匹配
    if (error.message.includes('学号') || error.message.includes('密码')) {
      return {
        type: ErrorTypes.VALIDATION_ERROR,
        code: ErrorCodes.INVALID_FORMAT,
        message: error.message
      }
    }
    
    if (error.message.includes('权限') || error.message.includes('登录')) {
      return {
        type: ErrorTypes.AUTH_ERROR,
        code: ErrorCodes.UNAUTHORIZED,
        message: error.message
      }
    }
    
    if (error.message.includes('不存在') || error.message.includes('未找到')) {
      return {
        type: ErrorTypes.NOT_FOUND_ERROR,
        code: ErrorCodes.NOT_FOUND,
        message: error.message
      }
    }

    // 其他自定义错误
    return {
      type: ErrorTypes.BUSINESS_LOGIC_ERROR,
      code: ErrorCodes.BUSINESS_LOGIC_ERROR,
      message: error.message
    }
  }

  // 未知错误
  return {
    type: ErrorTypes.UNKNOWN_ERROR,
    code: ErrorCodes.UNKNOWN_ERROR,
    message: '未知错误，请联系技术支持'
  }
}

/**
 * 获取用户友好的错误消息
 * @param {Object} errorInfo 错误信息
 * @returns {string} 用户友好的消息
 */
const getUserFriendlyMessage = (errorInfo) => {
  const friendlyMessages = {
    [ErrorTypes.NETWORK_ERROR]: '网络连接异常，请检查网络后重试',
    [ErrorTypes.VALIDATION_ERROR]: '输入信息有误，请检查后重新提交',
    [ErrorTypes.AUTH_ERROR]: '登录已过期，请重新登录',
    [ErrorTypes.PERMISSION_ERROR]: '您没有权限执行此操作',
    [ErrorTypes.NOT_FOUND_ERROR]: '请求的信息不存在',
    [ErrorTypes.SERVER_ERROR]: '服务器暂时繁忙，请稍后重试',
    [ErrorTypes.TIMEOUT_ERROR]: '请求超时，请检查网络连接',
    [ErrorTypes.BUSINESS_LOGIC_ERROR]: errorInfo.message,
    [ErrorTypes.UNKNOWN_ERROR]: '操作失败，请重试或联系技术支持'
  }

  return friendlyMessages[errorInfo.type] || errorInfo.message
}

/**
 * 创建特定类型的API错误
 * @param {string} type 错误类型
 * @param {string} code 错误代码
 * @param {string} message 错误消息
 * @returns {ApiError} API错误实例
 */
export const createApiError = (type, code, message) => {
  return new ApiError(message, code, type)
}

/**
 * 常用错误创建函数
 */
export const createValidationError = (message, field = null) => {
  return createApiError(
    ErrorTypes.VALIDATION_ERROR,
    ErrorCodes.INVALID_PARAMETERS,
    field ? `${field}: ${message}` : message
  )
}

export const createAuthError = (message = '身份验证失败') => {
  return createApiError(
    ErrorTypes.AUTH_ERROR,
    ErrorCodes.UNAUTHORIZED,
    message
  )
}

export const createPermissionError = (message = '权限不足') => {
  return createApiError(
    ErrorTypes.PERMISSION_ERROR,
    ErrorCodes.FORBIDDEN,
    message
  )
}

export const createNotFoundError = (message = '资源不存在') => {
  return createApiError(
    ErrorTypes.NOT_FOUND_ERROR,
    ErrorCodes.NOT_FOUND,
    message
  )
}

export const createServerError = (message = '服务器错误') => {
  return createApiError(
    ErrorTypes.SERVER_ERROR,
    ErrorCodes.INTERNAL_SERVER_ERROR,
    message
  )
}

export const createNetworkError = (message = '网络连接失败') => {
  return createApiError(
    ErrorTypes.NETWORK_ERROR,
    ErrorCodes.NETWORK_OFFLINE,
    message
  )
}