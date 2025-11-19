import { defineStore } from 'pinia'
import { ref } from 'vue'
import { updateLocation } from '@/utils/api'
import { campusCenter, campusBuildings } from '@/config/map'
import {
  isGeolocationSupported,
  getCurrentLocation,
  watchPosition,
  clearPositionWatch,
  validateLocation as validateLocationUtil,
  calculateDistance,
  formatDistance,
  getCachedLocation,
  setCachedLocation,
  clearCachedLocation,
  getMockLocation,
  createLocationError,
  checkLocationPermission as checkPermissionUtil,
  mergeLocation,
  DEFAULT_LOCATION,
  MOCK_LOCATIONS,
  LOCATION_ERRORS,
  DEFAULT_VALIDATION_CONFIG
} from '@/utils/location'
import { locationLogger } from '@/utils/locationLogger'

export const useLocationStore = defineStore('location', () => {
  // 状态定义
  const currentLocation = ref(null)
  const locationPermission = ref(false)
  const locationWatcher = ref(null)
  const locationAccuracy = ref('low') // 'low', 'medium', 'high'
  const lastPositionTime = ref(null)
  const locationError = ref(null)
  const isLocating = ref(false)
  
  // 缓存相关
  const hasCachedLocation = ref(false)
  const cacheExpiryTime = ref(null)
  const cacheAge = ref(0)
  
  // 开发模式配置
  const isDevMode = import.meta.env.DEV
  const useMockLocation = ref(isDevMode && false) // 开发模式下默认不使用模拟位置
  const mockLocationList = ref([
    // 合并默认的模拟位置和校园特定位置
    ...MOCK_LOCATIONS,
    {
      name: '校园中心',
      latitude: campusCenter[1],
      longitude: campusCenter[0],
      accuracy: 5
    },
    {
      name: '教学楼',
      latitude: campusBuildings?.publicTeachingBuilding?.coords?.[1] || campusCenter[1] + 0.001,
      longitude: campusBuildings?.publicTeachingBuilding?.coords?.[0] || campusCenter[0] + 0.001,
      accuracy: 8
    },
    {
      name: '图书馆',
      latitude: campusCenter[1] - 0.001,
      longitude: campusCenter[0] - 0.001,
      accuracy: 10
    }
  ])
  const currentMockLocation = ref(mockLocationList.value[0])

  // 位置验证配置
  const locationValidationConfig = {
    ...DEFAULT_VALIDATION_CONFIG,
    maxLatDiff: 1.0,    // 放宽纬度差异限制
    maxLngDiff: 1.0,    // 放宽经度差异限制
    allowedRegions: [
      {
        name: '校园区域',
        latitude: campusCenter[1],
        longitude: campusCenter[0],
        radius: 10000   // 扩大允许范围到10公里
      }
    ]
  }

  // 位置验证函数
  const validateLocation = (coords) => {
    const basicValid = validateLocationUtil(coords, locationValidationConfig)
    
    if (!basicValid) {
      const distance = calculateDistance(
        coords.latitude,
        coords.longitude,
        campusCenter[1],
        campusCenter[0]
      )
      
      locationLogger.warn(`位置可能异常：与校园中心距离过大 (${formatDistance(distance)})`, {
        distance,
        coords,
        campusCenter
      })
      if (isDevMode) {
        locationLogger.debug('开发环境：允许非校园范围内的位置用于测试')
        return true
      }
      return false
    }
    
    return true
  }

  // 获取位置精度等级
  const getAccuracyLevel = (accuracy) => {
    if (accuracy < 10) return 'high'
    if (accuracy < 50) return 'medium'
    return 'low'
  }

  // 使用默认位置
  const useDefaultLocation = () => {
    try {
      let defaultLocation
      
      const hasDefaultBuilding = campusBuildings && campusBuildings.publicTeachingBuilding && 
                                campusBuildings.publicTeachingBuilding.coords;
      
      if (hasDefaultBuilding) {
        defaultLocation = {
          longitude: campusBuildings.publicTeachingBuilding.coords[0],
          latitude: campusBuildings.publicTeachingBuilding.coords[1],
          accuracy: 10,
          timestamp: Date.now(),
          isDefault: true,
          name: '教学楼',
          address: '校园教学楼'
        }
      } else {
        defaultLocation = {
          ...DEFAULT_LOCATION,
          accuracy: 10,
          timestamp: Date.now(),
          isDefault: true
        }
      }
      
      currentLocation.value = defaultLocation
      locationAccuracy.value = 'medium'
      locationLogger.locationSuccess(defaultLocation, '使用默认位置')
      
      locationError.value = null
      
      return defaultLocation
    } catch (error) {
      locationLogger.error('使用默认位置时出错', error)
      const fallbackLocation = {
        ...DEFAULT_LOCATION,
        accuracy: 10,
        timestamp: Date.now(),
        isDefault: true
      }
      currentLocation.value = fallbackLocation
      return fallbackLocation
    }
  }

  // 获取模拟位置
  const getMockPosition = () => {
    let mockLocation
    if (currentMockLocation.value) {
      mockLocation = {
        ...currentMockLocation.value,
        timestamp: Date.now(),
        isDefault: false,
        isMock: true
      }
    } else {
      mockLocation = {
        ...mockLocationList.value[0],
        timestamp: Date.now(),
        isDefault: false,
        isMock: true
      }
      currentMockLocation.value = mockLocation
    }
    
    locationLogger.locationSuccess(mockLocation, `使用模拟位置: ${mockLocation.name}`)
    return mockLocation
  }

  // 切换是否使用模拟位置
  const toggleMockLocation = (useMock = null) => {
    if (!isDevMode) {
      locationLogger.warn('模拟位置功能仅在开发环境可用')
      return false
    }
    
    if (useMock !== null) {
      useMockLocation.value = !!useMock
    } else {
      useMockLocation.value = !useMockLocation.value
    }
    
    locationLogger.debug(`模拟位置已${useMockLocation.value ? '启用' : '禁用'}`)
    return useMockLocation.value
  }

  // 设置模拟位置
  const setMockLocation = (locationIndex) => {
    if (!isDevMode || !useMockLocation.value) {
      locationLogger.warn('模拟位置功能未启用')
      return false
    }
    
    if (locationIndex >= 0 && locationIndex < mockLocationList.value.length) {
      currentMockLocation.value = mockLocationList.value[locationIndex]
      locationLogger.debug(`切换模拟位置为: ${currentMockLocation.value.name}`)
      return true
    }
    
    locationLogger.error('无效的模拟位置索引', { index: locationIndex })
    return false
  }

  // 添加模拟位置
  const addMockLocation = (name, latitude, longitude, accuracy = 10) => {
    if (!isDevMode) {
      locationLogger.warn('模拟位置功能仅在开发环境可用')
      return false
    }
    
    const newLocation = {
      name,
      latitude,
      longitude,
      accuracy
    }
    
    mockLocationList.value.push(newLocation)
    currentMockLocation.value = newLocation
    locationLogger.debug(`添加新的模拟位置: ${name}`, { latitude, longitude, accuracy })
    return true
  }

  // 获取当前位置
  const getCurrentPosition = async () => {
    try {
      isLocating.value = true
      locationError.value = null
      
      try {
        // 优先检查缓存
        const cachedLoc = getCachedLocation()
        if (cachedLoc && validateLocation(cachedLoc)) {
          hasCachedLocation.value = true
          currentLocation.value = cachedLoc
          locationAccuracy.value = getAccuracyLevel(cachedLoc.accuracy || 0)
          lastPositionTime.value = new Date(cachedLoc.timestamp || Date.now())
          locationLogger.cacheOperation('hit', cachedLoc)
          return cachedLoc
        }
        
        hasCachedLocation.value = false
        
        // 检查地理位置支持
        if (!isGeolocationSupported()) {
          throw createLocationError('GEOLOCATION_NOT_SUPPORTED')
        }
        
        // 检查权限
        const hasPermission = await checkPermissionUtil()
        if (!hasPermission) {
          throw createLocationError('PERMISSION_DENIED')
        }
        
        locationPermission.value = true
        
        let position
        
        // 开发模式且启用模拟位置
        if (isDevMode && useMockLocation.value) {
          position = getMockPosition()
        } else {
          // 实际获取位置
        try {
          // 使用更宽松的定位配置
          position = await getCurrentLocation({ 
            timeout: 20000,           // 增加超时时间到20秒
            enableHighAccuracy: false, // 不强制要求高精度
            maximumAge: 60000,        // 允许使用1分钟内的缓存位置
            maxRetries: 2,            // 减少重试次数
            requiredAccuracy: 200     // 放宽精度要求到200米
          })
            
            // 安全检查position对象
            if (!position) {
              throw createLocationError('POSITION_UNAVAILABLE', '位置数据为空')
            }
            
            // 验证位置
            if (!validateLocation(position.coords || position)) {
              throw createLocationError('INVALID_LOCATION')
            }
            
            position = {
              ...position,
              isDefault: false,
              isMock: false
            }
            
          } catch (error) {
            // 安全的错误记录
            try {
              locationLogger.locationError(error || '未知错误', '获取位置失败，使用默认位置')
            } catch (logError) {
              // 避免日志记录失败导致整个流程崩溃
              console.error('位置获取失败，使用默认位置', error)
            }
            
            // 正确设置错误状态，让前端能够显示具体的错误信息
            if (error && error.code && error.isUserFriendly) {
              // 如果是用户友好的错误对象，直接使用
              locationError.value = error
            } else {
              // 否则创建标准化的错误对象
              locationError.value = createLocationError('POSITION_ERROR', error?.message || String(error))
            }
            
            position = useDefaultLocation()
          }
        }
        
        // 更新状态
        currentLocation.value = position
        locationAccuracy.value = getAccuracyLevel(position.accuracy || 0)
        lastPositionTime.value = new Date(position.timestamp || Date.now())
        
        // 缓存有效位置
        if (!position.isDefault && !position.isMock) {
          setCachedLocation(position)
        }
        
        return position
      } catch (error) {
        // 安全的错误记录，避免日志函数本身抛出异常
        try {
          // 确保error对象是有效的
          const safeError = error || { message: '未知错误' }
          locationLogger.error('获取位置失败', safeError)
        } catch (logError) {
          // 最后的错误记录方式
          console.error('获取位置失败', error)
        }
        
        // 正确设置错误状态，让前端能够显示具体的错误信息
        if (error && error.code && error.isUserFriendly) {
          // 如果是用户友好的错误对象，直接使用
          locationError.value = error
        } else {
          // 否则创建标准化的错误对象
          try {
            locationError.value = createLocationError('POSITION_ERROR', error?.message || String(error))
          } catch (e) {
            // 简单的错误对象作为回退
            locationError.value = { 
              code: 'POSITION_ERROR', 
              message: '位置获取失败',
              isUserFriendly: true,
              suggestion: '请稍后重试'
            }
          }
        }
        
        // 使用默认位置作为最后的回退
        const defaultLoc = useDefaultLocation()
        return defaultLoc
      }
    } catch (unexpectedError) {
      // 捕获所有可能的异常，确保不会导致页面黑屏
      console.error('位置服务发生严重错误', unexpectedError)
      try {
        // 强制使用默认位置
        currentLocation.value = useDefaultLocation()
        locationError.value = { code: 'CRITICAL_ERROR', message: '位置服务错误' }
      } catch (e) {
        // 最后的安全保障
        currentLocation.value = { ...DEFAULT_LOCATION, timestamp: Date.now(), isDefault: true }
      }
      return currentLocation.value
    } finally {
      isLocating.value = false
    }
  }

  // 初始化位置服务
  const initLocationService = async () => {
    try {
      locationLogger.debug('初始化位置服务...')
      
      // 检查地理位置支持
      if (!isGeolocationSupported()) {
        locationLogger.warn('浏览器不支持地理位置功能')
        locationError.value = createLocationError('GEOLOCATION_NOT_SUPPORTED')
        // 使用默认位置作为回退
        useDefaultLocation()
        return false
      }
      
      // 检查权限
      const hasPermission = await checkPermissionUtil()
      locationPermission.value = hasPermission
      
      if (hasPermission) {
        locationLogger.debug('位置权限已授予')
        // 获取当前位置
        await getCurrentPosition()
        return true
      } else {
        locationLogger.warn('位置权限被拒绝或未授予')
        locationError.value = createLocationError('PERMISSION_DENIED')
        // 使用默认位置作为回退
        useDefaultLocation()
        return false
      }
    } catch (error) {
      locationLogger.error('初始化位置服务失败', error)
      
      // 正确设置错误状态，让前端能够显示具体的错误信息
      if (error && error.code && error.isUserFriendly) {
        // 如果是用户友好的错误对象，直接使用
        locationError.value = error
      } else {
        // 否则创建标准化的错误对象
        locationError.value = createLocationError('INITIALIZATION_ERROR', error.message || String(error))
      }
      
      // 使用默认位置作为最后的回退
      useDefaultLocation()
      return false
    }
  }

  // 请求位置权限
  const requestLocationPermission = async () => {
    try {
      locationLogger.debug('请求位置权限...')
      
      // 检查地理位置支持
      if (!isGeolocationSupported()) {
        locationLogger.warn('浏览器不支持地理位置功能')
        locationError.value = createLocationError('GEOLOCATION_NOT_SUPPORTED')
        return false
      }
      
      // 请求权限
      const hasPermission = await checkPermissionUtil()
      locationPermission.value = hasPermission
      
      if (hasPermission) {
        locationLogger.debug('位置权限已授予')
        // 清除错误状态
        locationError.value = null
        return true
      } else {
        locationLogger.warn('位置权限被拒绝')
        locationError.value = createLocationError('PERMISSION_DENIED')
        return false
      }
    } catch (error) {
      locationLogger.error('请求位置权限失败', error)
      
      // 正确设置错误状态，让前端能够显示具体的错误信息
      if (error && error.code && error.isUserFriendly) {
        // 如果是用户友好的错误对象，直接使用
        locationError.value = error
      } else {
        // 否则创建标准化的错误对象
        locationError.value = createLocationError('PERMISSION_ERROR', error?.message || String(error))
      }
      
      return false
    }
  }

  // 优化位置精度
  const optimizeLocationAccuracy = async () => {
    try {
      isLocating.value = true
      locationLogger.debug('优化位置精度...')
      
      // 检查权限
      if (!locationPermission.value) {
        const hasPermission = await requestLocationPermission()
        if (!hasPermission) {
          return false
        }
      }
      
      // 使用高精度选项重新获取位置
      const position = await getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      })
      
      // 验证位置
      if (!validateLocation(position.coords)) {
        locationLogger.warn('优化后的位置验证失败')
        return false
      }
      
      // 更新状态
      currentLocation.value = {
        ...position,
        isDefault: false,
        isMock: false
      }
      locationAccuracy.value = getAccuracyLevel(position.accuracy)
      lastPositionTime.value = new Date(position.timestamp)
      
      locationLogger.debug(`位置精度优化完成: ${locationAccuracy.value}`)
      return true
    } catch (error) {
      locationLogger.error('优化位置精度失败', error)
      
      // 正确设置错误状态，让前端能够显示具体的错误信息
      if (error && error.code && error.isUserFriendly) {
        // 如果是用户友好的错误对象，直接使用
        locationError.value = error
      } else {
        // 否则创建标准化的错误对象
        locationError.value = createLocationError('OPTIMIZATION_ERROR', error?.message || String(error))
      }
      
      return false
    } finally {
      isLocating.value = false
    }
  }

  // 开始位置监听
  const startLocationWatch = (options = {}, callback = null) => {
    try {
      // 停止之前的监听
      if (locationWatcher.value) {
        stopLocationWatch()
      }
      
      locationLogger.debug('开始位置监听...')
      
      // 合并默认选项
      const watchOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options
      }
      
      // 检查权限
      if (!locationPermission.value) {
        throw createLocationError('PERMISSION_DENIED')
      }
      
      // 开发模式且启用模拟位置
      if (isDevMode && useMockLocation.value) {
        locationLogger.debug('在模拟模式下监听位置')
        return true
      }
      
      // 实际开始监听
      const watchId = watchPosition(
        (position) => {
          try {
            // 验证位置
            if (validateLocation(position.coords)) {
              // 更新状态
              currentLocation.value = {
                ...position,
                isDefault: false,
                isMock: false
              }
              locationAccuracy.value = getAccuracyLevel(position.accuracy)
              lastPositionTime.value = new Date(position.timestamp)
              
              // 清除错误状态
              locationError.value = null
              
              // 调用回调
              if (typeof callback === 'function') {
                callback(position)
              }
            }
          } catch (error) {
            locationLogger.error('处理位置更新失败', error)
            locationError.value = error
          }
        },
        (error) => {
          locationLogger.error('位置监听错误', error)
          locationError.value = createLocationError(error.code || 'UNKNOWN_ERROR')
        },
        watchOptions
      )
      
      locationWatcher.value = watchId
      locationLogger.debug('位置监听已启动')
      return true
    } catch (error) {
      locationLogger.error('启动位置监听失败', error)
      locationError.value = error
      return false
    }
  }

  // 停止位置监听
  const stopLocationWatch = () => {
    try {
      if (locationWatcher.value) {
        clearPositionWatch(locationWatcher.value)
        locationWatcher.value = null
        locationLogger.debug('位置监听已停止')
        return true
      }
      return false
    } catch (error) {
      locationLogger.error('停止位置监听失败', error)
      return false
    }
  }

  // 上传位置到服务器
  const uploadLocationToServer = async (location) => {
    try {
      const uploadLocationData = location || currentLocation.value
      
      if (!uploadLocationData) {
        locationLogger.warn('没有可用的位置数据上传')
        return false
      }
      
      locationLogger.debug('上传位置到服务器...')
      
      const response = await updateLocation({
        latitude: uploadLocationData.latitude,
        longitude: uploadLocationData.longitude,
        accuracy: uploadLocationData.accuracy,
        timestamp: uploadLocationData.timestamp
      })
      
      locationLogger.debug('位置上传成功')
      return response
    } catch (error) {
      locationLogger.error('上传位置到服务器失败', error)
      return false
    }
  }

  // 刷新位置
  const refreshLocation = async () => {
    try {
      locationLogger.debug('刷新位置...')
      
      // 清除缓存
      clearCachedLocation()
      hasCachedLocation.value = false
      
      // 重新获取位置
      const newPosition = await getCurrentPosition()
      
      locationLogger.debug('位置刷新成功')
      return newPosition
    } catch (error) {
      locationLogger.error('刷新位置失败', error)
      locationError.value = error
      return null
    }
  }

  // 检查位置权限
  const checkLocationPermission = async () => {
    try {
      const hasPermission = await checkPermissionUtil()
      locationPermission.value = hasPermission
      return hasPermission
    } catch (error) {
      locationLogger.error('检查位置权限失败', error)
      return false
    }
  }

  // 清除位置信息
  const clearLocation = () => {
    try {
      currentLocation.value = null
      locationError.value = null
      lastPositionTime.value = null
      locationAccuracy.value = 'low'
      hasCachedLocation.value = false
      cacheExpiryTime.value = null
      cacheAge.value = 0
      
      // 清除缓存
      clearCachedLocation()
      
      locationLogger.debug('位置信息已清除')
      return true
    } catch (error) {
      locationLogger.error('清除位置信息失败', error)
      return false
    }
  }

  // 获取位置状态
  const getLocationStatus = () => {
    return {
      hasLocation: !!currentLocation.value,
      hasError: !!locationError.value,
      isLocating: isLocating.value,
      hasPermission: locationPermission.value,
      accuracy: locationAccuracy.value,
      isDefaultLocation: currentLocation.value?.isDefault || false,
      isMockLocation: currentLocation.value?.isMock || false,
      isCachedLocation: hasCachedLocation.value,
      lastUpdateTime: lastPositionTime.value,
      errorCode: locationError.value?.code,
      errorMessage: locationError.value?.message
    }
  }

  // 导出状态和方法
  return {
    // 状态
    currentLocation,
    locationPermission,
    locationAccuracy,
    lastPositionTime,
    locationError,
    isLocating,
    hasCachedLocation,
    cacheAge,
    cacheExpiryTime,
    locationWatcher,
    
    // 方法
    getCurrentPosition,
    initLocationService,
    requestLocationPermission,
    startLocationWatch,
    stopLocationWatch,
    refreshLocation,
    checkLocationPermission,
    useDefaultLocation,
    clearLocation,
    getLocationStatus,
    uploadLocationToServer,
    optimizeLocationAccuracy,
    
    // 开发模式功能
    isDevMode,
    useMockLocation,
    mockLocationList,
    currentMockLocation,
    toggleMockLocation,
    setMockLocation,
    addMockLocation,
    getMockPosition,
    
    // 工具函数
    locationValidationConfig,
    getAccuracyLevel,
    calculateDistance,
    formatDistance,
    validateLocation
  }
})