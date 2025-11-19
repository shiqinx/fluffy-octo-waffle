// 用于开发和测试的位置缓存清理脚本
export const clearLocationCache = () => {
  try {
    // 清除所有位置相关的localStorage标记
    localStorage.removeItem('locationPermissionRequested')
    localStorage.removeItem('locationPermissionGranted')
    localStorage.removeItem('lastUserLocation')
    console.log('✅ 已清理所有位置权限相关缓存')
    return true
  } catch (error) {
    console.error('❌ 清理位置缓存失败:', error)
    return false
  }
}

// 如果需要在开发环境自动清理，可以在main.js中引入并调用
export const setupDevLocationCacheCleaner = () => {
  if (import.meta.env.DEV) {
    // 提供一个全局方法用于手动清理
    window.clearLocationCache = clearLocationCache
    console.log('🔧 开发模式：位置缓存清理工具已加载，可通过 window.clearLocationCache() 手动清理')
  }
}