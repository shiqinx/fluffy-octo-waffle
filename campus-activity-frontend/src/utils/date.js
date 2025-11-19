// @/utils/date.js
/**
 * 格式化时间
 * @param {string|Date} date - 日期字符串或Date对象
 * @param {string} format - 格式类型：'date' | 'time' | 'datetime'
 * @returns {string} 格式化后的时间字符串
 */
export const formatTime = (date, format = 'datetime') => {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  
  switch (format) {
    case 'date':
      return `${year}-${month}-${day}`
    case 'time':
      return `${hours}:${minutes}`
    case 'datetime':
    default:
      return `${year}-${month}-${day} ${hours}:${minutes}`
  }
}

/**
 * 格式化相对时间
 * @param {string|Date} date - 日期字符串或Date对象
 * @returns {string} 相对时间字符串
 */
export const formatRelativeTime = (date) => {
  if (!date) return ''
  
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < week) {
    return `${Math.floor(diff / day)}天前`
  } else {
    return formatTime(date, 'date')
  }
}

/**
 * 检查日期是否在今天
 * @param {string|Date} date - 日期字符串或Date对象
 * @returns {boolean}
 */
export const isToday = (date) => {
  if (!date) return false
  
  const d = new Date(date)
  const today = new Date()
  
  return d.toDateString() === today.toDateString()
}

/**
 * 检查日期是否在本周
 * @param {string|Date} date - 日期字符串或Date对象
 * @returns {boolean}
 */
export const isThisWeek = (date) => {
  if (!date) return false
  
  const d = new Date(date)
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)
  
  return d >= startOfWeek && d <= endOfWeek
}

export default {
  formatTime,
  formatRelativeTime,
  isToday,
  isThisWeek
}