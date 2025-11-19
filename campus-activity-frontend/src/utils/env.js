// @/utils/env.js
// 环境配置工具函数

// 环境判断
export const isDevelopment = import.meta.env.MODE === 'development'
export const isProduction = import.meta.env.MODE === 'production'

// 是否使用模拟数据
export const useMock = () => {
  return import.meta.env.VITE_USE_MOCK === 'true'
}

// 获取API基础URL
export const getApiBaseUrl = () => {
  if (useMock()) {
    return '/'
  }
  return import.meta.env.VITE_API_BASE_URL || '/api'
}

// 获取高德地图key
export const getAmapKey = () => {
  return import.meta.env.VITE_AMAP_KEY || '30b170859f00b71edbd631aab944129a'
}

// 获取应用配置
export const getAppConfig = () => {
  return {
    appName: '校园活动平台',
    version: '1.0.0',
    apiBaseUrl: getApiBaseUrl(),
    amapKey: getAmapKey(),
    useMock: useMock(),
    isDevelopment: isDevelopment,
    isProduction: isProduction
  }
}

// 默认导出
export default {
  isDevelopment,
  isProduction,
  useMock,
  getApiBaseUrl,
  getAmapKey,
  getAppConfig
}