// 位置服务专用日志工具
// 提供详细的调试信息记录功能

// 日志级别
export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  TRACE: 'trace'
}

// 配置项
let config = {
  enabled: true,
  level: LOG_LEVELS.INFO,
  prefix: '[位置服务]',
  maxHistory: 50, // 最大历史记录数
  logToConsole: true,
  logToHistory: true,
  detailed: true // 是否记录详细信息
}

// 日志历史记录
const logHistory = []

// 日志级别权重
const levelWeights = {
  [LOG_LEVELS.TRACE]: 0,
  [LOG_LEVELS.DEBUG]: 1,
  [LOG_LEVELS.INFO]: 2,
  [LOG_LEVELS.WARN]: 3,
  [LOG_LEVELS.ERROR]: 4
}

// 判断是否应该记录该级别的日志
const shouldLog = (level) => {
  return levelWeights[level] <= levelWeights[config.level]
}

// 格式化时间
const formatTime = () => {
  return new Date().toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  })
}

// 格式化位置数据
const formatLocationData = (locationData) => {
  if (!locationData || typeof locationData !== 'object') return '无效位置数据'
  
  const { latitude, longitude, accuracy, timestamp, attempt, isHighAccuracy } = locationData
  let result = `纬度: ${latitude?.toFixed(6)}, 经度: ${longitude?.toFixed(6)}`
  
  if (config.detailed) {
    if (accuracy !== undefined) {
      result += `, 精度: ${accuracy.toFixed(1)}m`
      result += isHighAccuracy ? ' [高精度]' : ''
    }
    if (timestamp) {
      result += `, 时间: ${new Date(timestamp).toLocaleTimeString()}`
    }
    if (attempt) {
      result += `, 尝试: ${attempt}`
    }
    
    // 添加其他位置属性
    const otherProps = Object.keys(locationData)
      .filter(key => !['latitude', 'longitude', 'accuracy', 'timestamp', 'attempt', 'isHighAccuracy'].includes(key))
      .map(key => `${key}: ${locationData[key]}`)
      .join(', ')
    
    if (otherProps) {
      result += `, ${otherProps}`
    }
  }
  
  return result
}

// 格式化错误数据
const formatErrorData = (error) => {
  if (!error) return '未知错误'
  
  if (typeof error === 'string') return error
  
  let result = ''
  if (error.code) result += `[${error.code}] `
  if (error.message) result += error.message
  if (config.detailed && error.suggestion) result += ` (建议: ${error.suggestion})`
  if (config.detailed && error.originalError) result += ` [原始错误: ${error.originalError.message || error.originalError}]`
  
  return result || '未知错误对象'
}

// 记录日志的核心函数
const log = (level, message, data = null, context = null) => {
  if (!config.enabled || !shouldLog(level)) return
  
  const time = formatTime()
  let formattedMessage = `${time} ${config.prefix} ${level.toUpperCase()}: ${message}`
  
  // 添加数据信息
  if (data) {
    if (data.latitude !== undefined && data.longitude !== undefined) {
      formattedMessage += ' - ' + formatLocationData(data)
    } else if (data.code && (data.message || data.error)) {
      formattedMessage += ' - ' + formatErrorData(data)
    } else if (typeof data === 'object') {
      formattedMessage += ' - ' + JSON.stringify(data, null, 2)
    } else {
      formattedMessage += ' - ' + data
    }
  }
  
  // 添加上下文信息
  if (context) {
    formattedMessage += ` [上下文: ${context}]`
  }
  
  // 输出到控制台
  if (config.logToConsole) {
    switch (level) {
      case LOG_LEVELS.DEBUG:
      case LOG_LEVELS.TRACE:
        console.debug(formattedMessage)
        break
      case LOG_LEVELS.INFO:
        console.info(formattedMessage)
        break
      case LOG_LEVELS.WARN:
        console.warn(formattedMessage)
        break
      case LOG_LEVELS.ERROR:
        console.error(formattedMessage)
        break
    }
  }
  
  // 保存到历史记录
  if (config.logToHistory) {
    const logEntry = {
      time: new Date(),
      level,
      message,
      data: data ? { ...data } : null,
      context
    }
    
    logHistory.push(logEntry)
    // 限制历史记录数量
    if (logHistory.length > config.maxHistory) {
      logHistory.shift()
    }
  }
  
  return formattedMessage
}

// 位置服务日志工具对象
export const locationLogger = {
  // 设置配置
  setConfig: (newConfig) => {
    config = { ...config, ...newConfig }
    log(LOG_LEVELS.DEBUG, '日志配置已更新', config)
  },
  
  // 获取当前配置
  getConfig: () => ({ ...config }),
  
  // 获取日志历史
  getHistory: (filterLevel = null, limit = null) => {
    let filtered = [...logHistory]
    
    if (filterLevel) {
      filtered = filtered.filter(entry => entry.level === filterLevel)
    }
    
    if (limit) {
      filtered = filtered.slice(-limit)
    }
    
    return filtered
  },
  
  // 清空日志历史
  clearHistory: () => {
    logHistory.length = 0
    log(LOG_LEVELS.DEBUG, '日志历史已清空')
  },
  
  // 导出日志为文本
  exportLogs: (filterLevel = null) => {
    const logs = locationLogger.getHistory(filterLevel)
    return logs
      .map(entry => {
        let formatted = `${entry.time.toISOString()} [${entry.level.toUpperCase()}] ${entry.message}`
        if (entry.context) formatted += ` [${entry.context}]`
        return formatted
      })
      .join('\n')
  },
  
  // 日志级别方法
  trace: (message, data = null, context = null) => log(LOG_LEVELS.TRACE, message, data, context),
  debug: (message, data = null, context = null) => log(LOG_LEVELS.DEBUG, message, data, context),
  info: (message, data = null, context = null) => log(LOG_LEVELS.INFO, message, data, context),
  warn: (message, data = null, context = null) => log(LOG_LEVELS.WARN, message, data, context),
  error: (message, data = null, context = null) => log(LOG_LEVELS.ERROR, message, data, context),
  
  // 专用位置日志方法
  locationSuccess: (locationData, operation = '获取位置') => {
    log(LOG_LEVELS.INFO, `${operation}成功`, locationData)
  },
  
  locationError: (error, operation = '获取位置') => {
    log(LOG_LEVELS.ERROR, `${operation}失败`, error)
  },
  
  permissionCheck: (status) => {
    log(LOG_LEVELS.INFO, `位置权限检查: ${status}`, { permission: status })
  },
  
  cacheOperation: (operation, locationData = null) => {
    if (operation === 'hit') {
      log(LOG_LEVELS.DEBUG, '使用缓存位置', locationData)
    } else if (operation === 'miss') {
      log(LOG_LEVELS.DEBUG, '缓存未命中')
    } else if (operation === 'update') {
      log(LOG_LEVELS.DEBUG, '更新位置缓存', locationData)
    } else if (operation === 'clear') {
      log(LOG_LEVELS.DEBUG, '清除位置缓存')
    }
  },
  
  retryAttempt: (attempt, maxAttempts, delay) => {
    log(LOG_LEVELS.DEBUG, `位置获取重试`, {
      attempt,
      maxAttempts,
      delay
    })
  },
  
  watchStatus: (status, details = null) => {
    const statusMap = {
      start: '开始监听',
      update: '位置更新',
      pause: '暂停监听',
      resume: '恢复监听',
      stop: '停止监听',
      error: '监听错误'
    }
    log(LOG_LEVELS.INFO, `位置监听: ${statusMap[status] || status}`, details)
  },
  
  // 性能监控
  performanceMark: (operation, durationMs, success = true) => {
    log(LOG_LEVELS.DEBUG, `${operation}性能`, {
      durationMs,
      success,
      timestamp: Date.now()
    })
  }
}

export default locationLogger