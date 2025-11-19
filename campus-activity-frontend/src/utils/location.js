// 位置工具函数库
// 解决位置获取失败的核心问题

import { locationLogger } from './locationLogger.js';

// 默认位置配置 - 设置为校园中心位置，避免偏向特定建筑
export const DEFAULT_LOCATION = {
  latitude: 23.028501, // 广东药科大学云浮校区中心坐标
  longitude: 112.184488,
  accuracy: 100,
  name: '校园中心',
  address: '广东药科大学云浮校区'
}

// 模拟位置数据
export const MOCK_LOCATIONS = [
  {
    name: '模拟位置1',
    latitude: 30.53965,
    longitude: 114.34177,
    accuracy: 5
  },
  {
    name: '模拟位置2',
    latitude: 30.54065,
    longitude: 114.34277,
    accuracy: 8
  }
]

// 位置错误定义
export const LOCATION_ERRORS = {
  PERMISSION_DENIED: {
    code: 'PERMISSION_DENIED',
    message: '位置权限被拒绝',
    suggestion: '请在浏览器设置中允许位置访问',
    isWarning: false
  },
  POSITION_UNAVAILABLE: {
    code: 'POSITION_UNAVAILABLE',
    message: '位置信息不可用',
    suggestion: '请检查设备定位服务是否开启',
    isWarning: false
  },
  TIMEOUT: {
    code: 'TIMEOUT',
    message: '位置获取超时',
    suggestion: '请检查网络连接和定位权限',
    isWarning: false
  },
  GEOLOCATION_NOT_SUPPORTED: {
    code: 'GEOLOCATION_NOT_SUPPORTED',
    message: '浏览器不支持地理位置服务',
    suggestion: '请更新浏览器或使用支持定位的浏览器',
    isWarning: true
  },
  LOCATION_VALIDATION_FAILED: {
    code: 'LOCATION_VALIDATION_FAILED',
    message: '位置验证失败',
    suggestion: '您的位置可能超出服务范围',
    isWarning: false
  },
  INITIALIZATION_FAILED: {
    code: 'INITIALIZATION_FAILED',
    message: '位置服务初始化失败',
    suggestion: '请检查设备定位服务并稍后重试',
    isWarning: false
  },
  UPLOAD_FAILED: {
    code: 'UPLOAD_FAILED',
    message: '位置同步失败',
    suggestion: '网络连接可能不稳定',
    isWarning: true
  },
  UNKNOWN_ERROR: {
    code: 'UNKNOWN_ERROR',
    message: '位置获取未知错误',
    suggestion: '请稍后重试',
    isWarning: false
  }
}

// 用户友好的错误消息映射
const ERROR_MESSAGES = {
  'PERMISSION_DENIED': '位置权限被拒绝，请在设备设置中允许应用访问您的位置',
  'POSITION_UNAVAILABLE': '无法获取您的位置，请尝试开启GPS或移动到信号更好的区域',
  'TIMEOUT': '获取位置超时，请稍后再试',
  'GEOLOCATION_NOT_SUPPORTED': '您的浏览器不支持定位功能，请更新浏览器后重试',
  'LOCATION_VALIDATION_FAILED': '您的位置可能超出服务范围，请移动到允许的区域',
  'INITIALIZATION_FAILED': '位置服务初始化失败，请检查您的设备定位设置',
  'UPLOAD_FAILED': '位置同步失败，请检查网络连接后重试',
  'UNKNOWN_ERROR': '获取位置时发生未知错误，请稍后再试'
}

// 错误转换工具函数
export const formatUserFriendlyError = (error) => {
  try {
    // 处理浏览器原生地理定位错误 (GeolocationPositionError)
    if (error && typeof error === 'object' && 'code' in error) {
      let errorType
      
      // 处理标准的 GeolocationPositionError 错误码
      switch (error.code) {
        case 1: // PERMISSION_DENIED
          errorType = 'PERMISSION_DENIED'
          break
        case 2: // POSITION_UNAVAILABLE
          errorType = 'POSITION_UNAVAILABLE'
          break
        case 3: // TIMEOUT
          errorType = 'TIMEOUT'
          break
        default:
          errorType = 'UNKNOWN_ERROR'
      }
      
      return {
        code: errorType,
        message: ERROR_MESSAGES[errorType],
        suggestion: LOCATION_ERRORS[errorType]?.suggestion,
        originalError: error,
        isUserFriendly: true,
        isWarning: LOCATION_ERRORS[errorType]?.isWarning || false,
        // 添加更多调试信息
        debugInfo: {
          errorCode: error.code,
          errorMessage: error.message,
          errorName: error.name || 'GeolocationPositionError'
        }
      }
    }
    
    // 处理自定义错误
    if (error && error.code && ERROR_MESSAGES[error.code]) {
      return {
        ...error,
        message: error.message || ERROR_MESSAGES[error.code],
        isUserFriendly: true
      }
    }
    
    // 处理其他类型的错误
    return {
      code: 'UNKNOWN_ERROR',
      message: ERROR_MESSAGES['UNKNOWN_ERROR'],
      suggestion: LOCATION_ERRORS.UNKNOWN_ERROR.suggestion,
      originalError: error,
      isUserFriendly: true,
      isWarning: false
    }
  } catch (err) {
    // 最后的安全保障
    locationLogger.error('格式化错误时出错', { error: err })
    return {
      code: 'UNKNOWN_ERROR',
      message: '处理位置服务时发生错误',
      suggestion: '请稍后重试',
      isUserFriendly: true,
      isWarning: false
    }
  }
}

// 云浮校区坐标范围
  const CAMPUS_BOUNDS = {
    minLat: 23.025,
    maxLat: 23.035,
    minLng: 112.178,
    maxLng: 112.190
  }
  
  // 智能位置校准算法
export const smartLocationCalibration = (rawLocation) => {
  if (!rawLocation || !rawLocation.latitude || !rawLocation.longitude) {
    return rawLocation
  }

  // 校园建筑物参考点 - 使用云浮校区坐标和智能权重
  const CAMPUS_REFERENCE_POINTS = [
    {
      name: '图书馆',
      coords: [23.029221, 112.184995], // 云浮校区图书馆坐标 [lat, lng]
      radius: 200, // 大幅扩大图书馆校准半径（米）
      priority: 1, // 最高优先级
      weight: 0.9, // 提高图书馆权重，增强识别能力
      buildingType: 'library' // 建筑类型
    },
    {
      name: '教学楼A栋',
      coords: [23.028801, 112.184688], // 教学楼A栋坐标
      radius: 120,
      priority: 2,
      weight: 0.7, // 略微降低教学楼权重
      buildingType: 'academic'
    },
    {
      name: '3栋宿舍',
      coords: [23.031784, 112.181769], // 3栋宿舍坐标
      radius: 100,
      priority: 2,
      weight: 0.2, // 进一步降低宿舍权重，避免误识别
      buildingType: 'dormitory'
    },
    {
      name: '4栋宿舍',
      coords: [23.031484, 112.181969], // 4栋宿舍坐标
      radius: 100,
      priority: 2,
      weight: 0.2, // 进一步降低宿舍权重，避免误识别
      buildingType: 'dormitory'
    },
    {
      name: '体育馆',
      coords: [23.027901, 112.183688], // 体育馆坐标
      radius: 150,
      priority: 2,
      weight: 0.5, // 降低体育馆权重
      buildingType: 'sports'
    },
    {
      name: '食堂',
      coords: [23.028501, 112.184488], // 食堂坐标
      radius: 120,
      priority: 3,
      weight: 0.4, // 降低食堂权重
      buildingType: 'dining'
    }
  ]

  try {
    // 计算到各参考点的距离和权重得分
    const distances = CAMPUS_REFERENCE_POINTS.map(point => {
      const distance = calculateDistance(
        rawLocation.latitude,
        rawLocation.longitude,
        point.coords[0],
        point.coords[1]
      )
      
      // 计算权重得分：距离越近得分越高，结合建筑权重
      const distanceScore = Math.max(0, 1 - distance / point.radius)
      const weightedScore = distanceScore * point.weight
      
      return {
        ...point,
        distance: distance,
        isInRange: distance <= point.radius,
        distanceScore: distanceScore,
        weightedScore: weightedScore
      }
    })

    // 室内定位补偿机制
    // 如果GPS精度较差（>30米），应用室内定位补偿
    if (rawLocation.accuracy > 30) {
      locationLogger.info('🏢 检测到室内定位环境，应用补偿算法', {
        gpsAccuracy: rawLocation.accuracy,
        compensation: 'indoor_mode'
      })
      
      // 室内定位：智能扩大所有建筑物的识别范围
    const indoorCompensationPoints = distances.map(point => ({
      ...point,
      // 室内环境下，统一扩大有效识别范围，不再特殊对待图书馆
      effectiveRadius: point.radius * 2.0, // 所有建筑统一扩大2倍
      isInRange: point.distance <= point.radius * 2.0
    }))
    
    // 重新计算室内补偿后的得分
    const indoorScores = indoorCompensationPoints.map(point => {
      const distanceScore = Math.max(0, 1 - point.distance / point.effectiveRadius)
      const weightedScore = distanceScore * point.weight
      return {
        ...point,
        distanceScore,
        weightedScore
      }
    })
    
    // 室内环境下，智能选择最优建筑（不再盲目优先图书馆）
    const bestIndoorPoint = indoorScores
      .filter(p => p.isInRange && p.weightedScore > 0.15) // 降低阈值，增加识别机会
      .sort((a, b) => {
        // 移除图书馆特殊优先权，按实际得分排序
        // 首先按权重得分排序
        if (Math.abs(b.weightedScore - a.weightedScore) > 0.05) {
          return b.weightedScore - a.weightedScore
        }
        // 得分相近时按建筑优先级排序
        if (a.priority !== b.priority) {
          return a.priority - b.priority
        }
        // 最后按实际距离排序
        return a.distance - b.distance
      })[0]
      
      if (bestIndoorPoint && bestIndoorPoint.buildingType === 'library') {
        const indoorCalibratedLocation = {
          ...rawLocation,
          latitude: bestIndoorPoint.coords[0],
          longitude: bestIndoorPoint.coords[1],
          accuracy: Math.min(rawLocation.accuracy, 60), // 室内定位精度上限60米
          calibrated: true,
          calibrationSource: '图书馆',
          originalDistance: bestIndoorPoint.distance,
          weightedScore: bestIndoorPoint.weightedScore,
          confidence: 'indoor_compensated',
          specialRule: 'indoor_library_priority',
          indoorMode: true
        }
        
        locationLogger.info('🏠 室内定位补偿：识别为图书馆', {
          originalAccuracy: rawLocation.accuracy,
          distance: bestIndoorPoint.distance,
          weightedScore: bestIndoorPoint.weightedScore,
          compensationType: 'GPS_accuracy_' + rawLocation.accuracy + 'm'
        })
        
        return indoorCalibratedLocation
      }
    }

    // 额外的室内定位优化：如果GPS精度很差（>50米），智能识别最近建筑
    if (rawLocation.accuracy > 50) {
      // 找到距离最近的建筑物
      const nearestBuilding = distances.reduce((nearest, current) => {
        return current.distance < nearest.distance ? current : nearest;
      });
      
      // 如果用户确实离某个建筑很近，优先识别该建筑
      if (nearestBuilding && nearestBuilding.distance <= 300) { // 300米内认为有明确建筑归属
        locationLogger.info('📶 低精度GPS环境：识别为最近建筑', {
          gpsAccuracy: rawLocation.accuracy,
          nearestBuilding: nearestBuilding.name,
          nearestDistance: nearestBuilding.distance,
          reason: 'low_accuracy_nearest_building'
        })
        
        const lowAccuracyCalibratedLocation = {
          ...rawLocation,
          latitude: nearestBuilding.coords[0],
          longitude: nearestBuilding.coords[1],
          accuracy: Math.min(rawLocation.accuracy, 100), // 低精度环境下的合理精度
          calibrated: true,
          calibrationSource: nearestBuilding.name,
          originalDistance: nearestBuilding.distance,
          weightedScore: nearestBuilding.weightedScore,
          confidence: 'low_accuracy_compensated',
          specialRule: 'low_accuracy_nearest_building',
          lowAccuracyMode: true
        }
        
        return lowAccuracyCalibratedLocation
      }
    }

    // 特殊规则：图书馆优先识别
    // 如果用户距离图书馆350米以内，优先识别为图书馆
    const libraryPoint = distances.find(d => d.buildingType === 'library')
    if (libraryPoint && libraryPoint.distance <= 350) {
      // 图书馆特殊校准：即使权重得分不高，也优先识别为图书馆
      const libraryCalibratedLocation = {
        ...rawLocation,
        latitude: libraryPoint.coords[0],
        longitude: libraryPoint.coords[1],
        accuracy: Math.min(rawLocation.accuracy, 50),
        calibrated: true,
        calibrationSource: '图书馆',
        originalDistance: libraryPoint.distance,
        weightedScore: libraryPoint.weightedScore,
        confidence: libraryPoint.distance <= 150 ? 'high' : 'medium',
        specialRule: 'library_priority'
      }
      
      locationLogger.info('📚 图书馆特殊规则生效：优先识别为图书馆', {
        distance: libraryPoint.distance,
        weightedScore: libraryPoint.weightedScore,
        confidence: libraryCalibratedLocation.confidence
      })
      
      return libraryCalibratedLocation
    }

    // 智能筛选：找到在范围内且得分较高的参考点
    // 降低阈值，让图书馆更容易被识别
    const inRangePoints = distances.filter(d => d.isInRange && d.weightedScore > 0.3)
    
    if (inRangePoints.length > 0) {
      // 按权重得分、优先级和距离综合排序
      inRangePoints.sort((a, b) => {
        // 图书馆特殊优先：如果是图书馆，给予额外优势
        const aLibraryBonus = a.buildingType === 'library' ? 0.3 : 0; // 大幅增加图书馆优势
        const bLibraryBonus = b.buildingType === 'library' ? 0.3 : 0;
        
        const aFinalScore = a.weightedScore + aLibraryBonus;
        const bFinalScore = b.weightedScore + bLibraryBonus;
        
        // 首先按最终得分排序
        if (Math.abs(aFinalScore - bFinalScore) > 0.05) {
          return bFinalScore - aFinalScore
        }
        // 得分相近时按优先级排序
        if (a.priority !== b.priority) {
          return a.priority - b.priority
        }
        // 最后按实际距离排序
        return a.distance - b.distance
      })

      const bestPoint = inRangePoints[0]
      const secondBest = inRangePoints[1]
      
      // 图书馆特殊处理：降低图书馆的校准门槛
      const isLibrary = bestPoint.buildingType === 'library'
      const libraryThreshold = isLibrary ? 0.4 : 0.7
      const libraryDistance = isLibrary ? 150 : 50
      
      // 验证：确保最佳选择明显优于其他选择，并且距离合理
      if (bestPoint.weightedScore > libraryThreshold && 
          bestPoint.distance <= libraryDistance &&
          (!secondBest || bestPoint.weightedScore - secondBest.weightedScore > 0.1)) {
        
        // 使用参考点坐标作为校准后的位置
        const calibratedLocation = {
          ...rawLocation,
          latitude: bestPoint.coords[0],
          longitude: bestPoint.coords[1],
          accuracy: Math.min(rawLocation.accuracy, 20), // 提高精度
          calibrated: true,
          calibrationSource: bestPoint.name,
          originalDistance: bestPoint.distance,
          weightedScore: bestPoint.weightedScore,
          confidence: 'high'
        }
        
        locationLogger.info('位置已智能校准（高置信度）', {
          calibrationSource: bestPoint.name,
          originalDistance: bestPoint.distance,
          weightedScore: bestPoint.weightedScore,
          originalAccuracy: rawLocation.accuracy,
          newAccuracy: calibratedLocation.accuracy
        })
        
        return calibratedLocation
      } else if (bestPoint.distance <= 80) {
        // 距离很近但权重得分一般，中等置信度校准
        const calibratedLocation = {
          ...rawLocation,
          latitude: bestPoint.coords[0],
          longitude: bestPoint.coords[1],
          accuracy: Math.min(rawLocation.accuracy, 30),
          calibrated: true,
          calibrationSource: bestPoint.name,
          originalDistance: bestPoint.distance,
          weightedScore: bestPoint.weightedScore,
          confidence: 'medium'
        }
        
        locationLogger.info('位置已智能校准（中等置信度）', {
          calibrationSource: bestPoint.name,
          originalDistance: bestPoint.distance,
          weightedScore: bestPoint.weightedScore
        })
        
        return calibratedLocation
      }
    }

    // 如果没有找到合适的校准点，返回原始位置
    return {
      ...rawLocation,
      calibrated: false,
      calibrationReason: 'no_nearby_reference',
      debugInfo: distances.map(d => ({
        name: d.name,
        distance: d.distance.toFixed(0),
        isInRange: d.isInRange,
        weightedScore: d.weightedScore.toFixed(2)
      }))
    }
  } catch (error) {
    locationLogger.error('智能位置校准失败', error)
    return rawLocation
  }
}

// 计算两点间距离（米）
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371e3 // 地球半径（米）
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lng2 - lng1) * Math.PI / 180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c
}

// 默认验证配置
export const DEFAULT_VALIDATION_CONFIG = {
  maxLatDiff: 2.0,      // 放宽经纬度差异限制
  maxLngDiff: 2.0,      // 放宽经纬度差异限制
  allowedRegions: [],   // 不限制特定区域
  minAccuracy: 0,       // 不设置最小精度要求
  maxAccuracy: 1000     // 放宽精度要求到1000米内
}

// 检查浏览器是否支持地理位置
export const isGeolocationSupported = () => {
  try {
    return typeof navigator !== 'undefined' && 'geolocation' in navigator
  } catch (error) {
    return false
  }
}

// 获取当前位置（稳定版，带增强错误处理和防黑屏机制）
export const getCurrentLocation = (options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      // 安全检查：确保navigator存在
      if (!navigator || !isGeolocationSupported()) {
        locationLogger.warn('浏览器不支持地理位置功能')
        // 不再直接拒绝，而是返回默认位置，防止黑屏
        const isDev = typeof import.meta !== 'undefined' && 
                     typeof import.meta.env !== 'undefined' ? 
                     import.meta.env.DEV : false
        const fallbackLocation = isDev ? getMockLocation() : DEFAULT_LOCATION
        fallbackLocation.isDefault = true
        fallbackLocation.fallbackReason = 'BROWSER_NOT_SUPPORTED'
        locationLogger.info('使用默认位置作为后备', fallbackLocation)
        resolve(fallbackLocation)
        return
      }

      // 优化默认选项：使用更宽松的定位策略
      const defaultOptions = {
        enableHighAccuracy: false, // 不强制要求高精度，提高成功率
        timeout: 20000, // 增加超时时间到20秒
        maximumAge: 60000, // 允许使用1分钟内的缓存位置
        retryCount: 2,    // 减少重试次数，避免用户等待
        retryDelay: 1000, // 减少重试间隔
        useCache: true,    // 启用缓存，提高响应速度
        validateLocation: true,
        validationConfig: {
          ...DEFAULT_VALIDATION_CONFIG,
          maxAccuracy: 1000 // 放宽到1000米内，提高成功率
        }
      }

      const finalOptions = { ...defaultOptions, ...options }
      let attempt = 0
      
      // 优化缓存使用策略：优先获取新鲜位置
      if (finalOptions.useCache) {
        const cachedLocation = getCachedLocation()
        if (cachedLocation) {
          locationLogger.cacheOperation('hit', cachedLocation)
          // 放宽缓存位置验证，允许使用精度较低的缓存位置
          if (!finalOptions.validateLocation || validateLocation(cachedLocation, finalOptions.validationConfig)) {
            // 放宽精度要求到1000米，提高缓存使用率
            if (cachedLocation.accuracy <= 1000) { 
              resolve(cachedLocation)
              return
            }
          }
          locationLogger.warn('缓存位置精度不足或验证失败，重新获取')
        } else {
          locationLogger.cacheOperation('miss')
        }
      }

      // 重试逻辑
      const attemptToGetLocation = () => {
        attempt++
        locationLogger.retryAttempt(attempt, finalOptions.retryCount, finalOptions.retryDelay)
        
        // 创建带超时的Promise
        const timeoutPromise = new Promise((_, timeoutReject) => {
          setTimeout(() => {
            timeoutReject(LOCATION_ERRORS.TIMEOUT)
          }, finalOptions.timeout)
        })

        const geolocationPromise = new Promise((geoResolve, geoReject) => {
          try {
            navigator.geolocation.getCurrentPosition(
              geoResolve,
              geoReject,
              finalOptions
            )
          } catch (geolocationError) {
            // 捕获navigator.geolocation调用可能抛出的同步错误
            geoReject(geolocationError)
          }
        })

        // 竞赛Promise处理超时
        Promise.race([geolocationPromise, timeoutPromise])
          .then((position) => {
            try {
              // 安全检查：确保position和coords存在
              if (!position || !position.coords) {
                throw new Error('无效的位置数据')
              }
              
              const { latitude, longitude, accuracy, altitude, heading, speed, altitudeAccuracy } = position.coords
              const locationData = {
                latitude,
                longitude,
                accuracy,
                altitude,
                heading,
                speed,
                altitudeAccuracy,
                timestamp: position.timestamp,
                attempt: attempt,
                isHighAccuracy: accuracy < 100,
                isValidated: true // 标记验证状态
              }
              
              // 严格验证逻辑：只有验证通过的位置才会被返回
              let isValid = true
              if (finalOptions.validateLocation) {
                isValid = validateLocation(locationData, finalOptions.validationConfig)
                if (!isValid) {
                  locationLogger.warn('位置验证未通过，拒绝使用该位置', locationData)
                  // 不再返回验证失败的位置，而是继续重试或使用后备位置
                  throw new Error(`位置精度不足: ${locationData.accuracy}米 > ${finalOptions.validationConfig.maxAccuracy}米`)
                }
              }
              
              // 暂时禁用智能位置校准，直接使用原始GPS位置
              let finalLocation = locationData
              // if (locationData.accuracy <= 300) { // 扩大校准范围，让更多位置得到优化
              //   finalLocation = smartLocationCalibration(locationData)
              // }
              
              // 设置缓存，即使位置未通过严格验证
              if (finalOptions.useCache) {
                setCachedLocation(finalLocation)
                locationLogger.cacheOperation('update', finalLocation)
              }
              
              locationLogger.locationSuccess({
                ...finalLocation,
                validationStatus: isValid ? 'valid' : 'warning'
              })
              resolve(finalLocation)
            } catch (positionProcessingError) {
              // 处理位置数据时的错误
              locationLogger.error('处理位置数据时出错', positionProcessingError)
              // 使用默认位置作为后备
              handleFinalFallback()
            }
          })
          .catch((error) => {
            try {
              // 改进的错误处理，专门针对 GeolocationPositionError
              let errorObj
              
              if (error && typeof error === 'object' && 'code' in error) {
                // 处理标准的 GeolocationPositionError
                switch (error.code) {
                  case 1: // PERMISSION_DENIED
                    errorObj = LOCATION_ERRORS.PERMISSION_DENIED
                    break
                  case 2: // POSITION_UNAVAILABLE
                    errorObj = LOCATION_ERRORS.POSITION_UNAVAILABLE
                    break
                  case 3: // TIMEOUT
                    errorObj = LOCATION_ERRORS.TIMEOUT
                    break
                  default:
                    errorObj = { 
                      ...LOCATION_ERRORS.UNKNOWN_ERROR, 
                      originalError: error,
                      message: `未知地理位置错误 (错误码: ${error.code})`
                    }
                }
                
                // 添加详细的调试信息
                errorObj.debugInfo = {
                  errorCode: error.code,
                  errorMessage: error.message,
                  errorName: error.name || 'GeolocationPositionError',
                  attempt: attempt
                }
              } else if (error && error.code) {
                // 处理自定义错误对象
                errorObj = error.code === 'PERMISSION_DENIED' ? LOCATION_ERRORS.PERMISSION_DENIED :
                          error.code === 'POSITION_UNAVAILABLE' ? LOCATION_ERRORS.POSITION_UNAVAILABLE :
                          error.code === 'TIMEOUT' ? LOCATION_ERRORS.TIMEOUT :
                          { ...LOCATION_ERRORS.UNKNOWN_ERROR, originalError: error }
              } else {
                // 处理其他类型的错误
                errorObj = error || LOCATION_ERRORS.UNKNOWN_ERROR
              }
              
              // 记录详细错误信息
              locationLogger.locationError(errorObj, `位置获取(${attempt}/${finalOptions.retryCount})`)
              
              // 判断是否需要重试
              const shouldRetry = attempt < finalOptions.retryCount && 
                                errorObj.code !== 'PERMISSION_DENIED' // 只对权限错误不重试
              
              if (shouldRetry) {
                // 重试前先尝试降低精度要求
                if (attempt === 1) {
                  // 第一次重试：降低精度要求到1000米
                  finalOptions.validationConfig.maxAccuracy = 1000
                  finalOptions.enableHighAccuracy = false
                  finalOptions.maximumAge = 120000 // 增加到2分钟缓存
                  locationLogger.info('第一次重试：降低精度要求到1000米，增加缓存时间')
                } else {
                  // 第二次重试：使用最宽松的要求
                  finalOptions.validationConfig.maxAccuracy = 2000
                  finalOptions.maximumAge = 300000 // 5分钟缓存
                  locationLogger.info('第二次重试：使用最宽松的精度要求2000米')
                }
                
                setTimeout(attemptToGetLocation, finalOptions.retryDelay)
              } else {
                // 最后一次尝试失败，使用所有可用的后备机制
                handleFinalFallback(errorObj)
              }
            } catch (errorHandlingError) {
              // 捕获错误处理过程中可能发生的错误
              locationLogger.error('处理位置错误时出错', errorHandlingError)
              // 最后的安全网：返回默认位置
              console.warn('使用最后的默认位置，防止应用黑屏')
              resolve(DEFAULT_LOCATION)
            }
          })
      }

      // 处理最终的后备位置逻辑
  const handleFinalFallback = (error = null) => {
    // 1. 首先尝试获取正常缓存位置作为后备
    let cachedLocation = getCachedLocation()
    if (cachedLocation) {
      locationLogger.info('使用有效缓存位置作为后备', cachedLocation)
      cachedLocation.isFromCache = true
      resolve(cachedLocation)
      return
    }
    
    // 2. 如果没有正常缓存，尝试使用任何可用的缓存位置（包括过期的）
    locationLogger.warn('尝试使用任何可用的缓存位置作为最后后备')
    cachedLocation = getCachedLocation(true) // 使用宽松模式
    
    if (cachedLocation) {
      locationLogger.info('已使用宽松模式的缓存位置作为后备', cachedLocation)
      cachedLocation.isFromCache = true
      resolve(cachedLocation)
      return
    }
    
    // 3. 如果没有任何缓存，优先使用默认位置而不是返回错误
    if (error) {
      locationLogger.error('无法获取位置：浏览器API失败且无任何缓存', { error })
      const userFriendlyError = formatUserFriendlyError(error)
      
      // 在开发环境中提供更详细的信息
      const isDev = typeof import.meta !== 'undefined' ? import.meta.env.DEV : false
      if (isDev) {
        userFriendlyError.debugInfo = {
          errorCode: error.code,
          errorMessage: error.message,
          attempts: attempt
        }
      }
      
      // 在生产环境中，使用默认位置而不是抛出错误
      const isProduction = typeof import.meta !== 'undefined' && 
                          typeof import.meta.env !== 'undefined' ? 
                          import.meta.env.PROD : false
      if (isProduction) {
        locationLogger.warn('生产环境：使用默认位置作为后备，避免定位失败')
        const fallbackLocation = { ...DEFAULT_LOCATION, isDefault: true, fallbackReason: userFriendlyError.code }
        resolve(fallbackLocation)
        return
      }
      
      // 开发环境中可以选择性返回错误用于调试
      if (finalOptions.allowError === true) {
        reject(userFriendlyError)
        return
      }
      
      // 默认情况下仍然返回默认位置
      const fallbackLocation = { ...DEFAULT_LOCATION, isDefault: true, fallbackReason: userFriendlyError.code }
      resolve(fallbackLocation)
      return
    }
    
    // 4. 如果没有错误且没有缓存，根据环境返回合适的默认位置
    const isDev = typeof import.meta !== 'undefined' ? import.meta.env.DEV : false
    const fallbackLocation = isDev ? 
      { ...getMockLocation(), isMock: true, isDefault: true, fallbackReason: 'BROWSER_NOT_SUPPORTED' } : 
      { ...DEFAULT_LOCATION, isDefault: true, fallbackReason: 'BROWSER_NOT_SUPPORTED' }
      
    locationLogger.warn('使用默认位置作为最终后备', fallbackLocation)
    resolve(fallbackLocation)
  }

      // 开始获取位置
      attemptToGetLocation()
    } catch (fatalError) {
      // 捕获整个过程中可能发生的致命错误
      locationLogger.error('获取位置过程中发生严重错误', fatalError)
      // 使用用户友好的错误处理
      const userFriendlyError = formatUserFriendlyError(fatalError)
      
      const isProduction = typeof import.meta !== 'undefined' && 
                          typeof import.meta.env !== 'undefined' ? 
                          import.meta.env.PROD : false
      const isDev = typeof import.meta !== 'undefined' && 
                   typeof import.meta.env !== 'undefined' ? 
                   import.meta.env.DEV : false
      
      if (isDev) {
        userFriendlyError.debugInfo = {
          errorType: 'fatal',
          originalError: String(fatalError)
        }
      }
      // 在生产环境中仍然返回默认位置以防止黑屏
      if (isProduction) {
        console.warn('使用安全默认位置避免应用崩溃')
        resolve(DEFAULT_LOCATION)
      } else {
        reject(userFriendlyError)
      }
    }
  })
}

// 监听位置变化（增强版，带错误恢复机制）
export const watchPosition = (successCallback, errorCallback, options = {}) => {
  if (!isGeolocationSupported()) {
    const error = LOCATION_ERRORS.GEOLOCATION_NOT_SUPPORTED
    if (errorCallback) errorCallback(error)
    return null
  }

  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 3000,
    distanceFilter: 0,
    errorThreshold: 3,      // 连续错误阈值
    recoveryDelay: 10000,   // 错误恢复延迟
    validateLocation: true, // 是否验证位置
    validationConfig: DEFAULT_VALIDATION_CONFIG
  }

  const finalOptions = { ...defaultOptions, ...options }
  let watchId = null
  let errorCount = 0
  let isPaused = false
  let lastSuccessfulPosition = null
  
  // 错误恢复机制
  const handleWatchError = (error) => {
    errorCount++
    
    // 格式化错误对象
    let errorObj
    if (error.code) {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorObj = LOCATION_ERRORS.PERMISSION_DENIED
          break
        case error.POSITION_UNAVAILABLE:
          errorObj = LOCATION_ERRORS.POSITION_UNAVAILABLE
          break
        case error.TIMEOUT:
          errorObj = LOCATION_ERRORS.TIMEOUT
          break
        default:
          errorObj = { ...LOCATION_ERRORS.UNKNOWN_ERROR, originalError: error }
      }
    } else {
      errorObj = error || LOCATION_ERRORS.UNKNOWN_ERROR
    }
    
    locationLogger.watchStatus('error', {
      errorCount,
      errorThreshold: finalOptions.errorThreshold,
      error: errorObj
    })
    
    // 调用用户提供的错误回调
    if (errorCallback) {
      errorCallback(errorObj)
    }
    
    // 如果连续错误达到阈值，暂停监听并尝试恢复
      if (errorCount >= finalOptions.errorThreshold && !isPaused) {
        isPaused = true
        locationLogger.warn(`位置监听已暂停，将在${finalOptions.recoveryDelay}ms后尝试恢复...`)
      
      // 清除当前监听
      if (watchId) {
        navigator.geolocation.clearWatch(watchId)
        watchId = null
      }
      
      // 延迟后尝试恢复监听
      setTimeout(() => {
        errorCount = 0
        isPaused = false
        locationLogger.watchStatus('resume')
        startWatching()
      }, finalOptions.recoveryDelay)
    }
  }
  
  // 处理成功位置更新
  const handlePositionUpdate = (position) => {
    try {
      // 重置错误计数
      errorCount = 0
      
      // 添加空值检查，确保position和position.coords存在
      if (!position || !position.coords) {
        handleWatchError(createLocationError(
          'POSITION_UNAVAILABLE',
          '获取到无效的位置对象',
          '请检查您的位置服务'
        ))
        locationLogger.error('无效的位置对象', { hasPosition: !!position, hasCoords: !!position?.coords })
        return
      }
      
      const { latitude, longitude, accuracy, altitude, heading, speed, altitudeAccuracy } = position.coords
      const locationData = {
        latitude,
        longitude,
        accuracy,
        altitude,
        heading,
        speed,
        altitudeAccuracy,
        timestamp: position.timestamp,
        isHighAccuracy: accuracy < 100,
        watchUpdate: true
      }
      
      // 验证位置前先检查locationData是否有效
      if (finalOptions.validateLocation) {
        // 确保locationData是有效的对象且包含必要的经纬度属性
        if (!locationData || typeof locationData !== 'object' || 
            typeof locationData.latitude !== 'number' || typeof locationData.longitude !== 'number') {
          handleWatchError(createLocationError(
            'POSITION_UNAVAILABLE',
            '获取到无效的位置数据',
            '请检查您的位置服务'
          ))
          locationLogger.error('无效的位置数据', {
            hasLocationData: !!locationData,
            locationDataType: typeof locationData,
            hasLatitude: typeof locationData?.latitude === 'number',
            hasLongitude: typeof locationData?.longitude === 'number'
          })
          return
        }
        
        // 在调用validateLocation前，确保传入的是有效的coords对象
        const coordsToValidate = {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          accuracy: locationData.accuracy
        }
        
        if (!validateLocation(coordsToValidate, finalOptions.validationConfig)) {
          handleWatchError(createLocationError(
            'LOCATION_VALIDATION_FAILED',
            `位置验证失败: 精度 ${accuracy || '未知'}m`,
            '请检查您的位置服务'
          ))
          return
        }
      }
      
      // 更新缓存和最后成功位置
      setCachedLocation(locationData)
      lastSuccessfulPosition = locationData
      
      // 位置质量评估
      if (locationData.accuracy > 1000) {
        locationLogger.warn('低精度位置信息', { accuracy: locationData.accuracy })
      }
      
      locationLogger.watchStatus('update', locationData)
      successCallback(locationData)
    } catch (error) {
      handleWatchError(createLocationError(
        'UNKNOWN_ERROR',
        `处理位置数据时发生错误: ${error.message}`,
        '请稍后再试'
      ))
      locationLogger.error('位置数据处理失败', { error: error.message })
    }
  }
  
  // 开始监听
  const startWatching = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId)
    }
    
    try {
      watchId = navigator.geolocation.watchPosition(
        handlePositionUpdate,
        handleWatchError,
        finalOptions
      )
      locationLogger.watchStatus('start', { options: { ...finalOptions, timeout: '...' } }) // 避免记录敏感信息
    } catch (error) {
      locationLogger.error('启动位置监听失败', error)
      if (errorCallback) {
        errorCallback({
          ...LOCATION_ERRORS.INITIALIZATION_FAILED,
          originalError: error
        })
      }
    }
  }
  
  // 启动监听
  startWatching()
  
  // 返回增强的停止函数
  return () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId)
      watchId = null
      locationLogger.watchStatus('stop')
    }
    
    // 返回最后成功的位置
    return lastSuccessfulPosition
  }
}

// 清除位置监听（增强版）
export const clearPositionWatch = (watchId) => {
  if (isGeolocationSupported()) {
    if (typeof watchId === 'function') {
      // 对于增强版watchPosition返回的函数
      return watchId()
    } else if (watchId) {
      navigator.geolocation.clearWatch(watchId)
    }
  }
  return null
}

// 验证位置合理性（带详细日志和容错处理）
export const validateLocation = (coords, config = DEFAULT_VALIDATION_CONFIG) => {
  try {
    // 安全获取配置，防止配置错误导致验证失败
    const safeConfig = {
      minAccuracy: config?.minAccuracy || 0,
      maxAccuracy: config?.maxAccuracy || 5000,
      allowedRegions: config?.allowedRegions || [],
      maxLatDiff: config?.maxLatDiff || 1,
      maxLngDiff: config?.maxLngDiff || 1
    }
    
    // 增强的空值检查
    if (!coords || typeof coords !== 'object') {
      locationLogger.debug('位置验证失败: 无效的坐标对象', { hasCoords: !!coords, coordsType: typeof coords })
      return false
    }
    
    // 安全获取经纬度 - 确保不会访问undefined的属性
    const latitude = coords && typeof coords.latitude === 'number' ? coords.latitude : null
    const longitude = coords && typeof coords.longitude === 'number' ? coords.longitude : null
    const accuracy = coords && typeof coords.accuracy === 'number' ? coords.accuracy : null
    
    if (latitude === null || longitude === null) {
      locationLogger.debug('位置验证失败: 缺少有效的经纬度', { 
        hasLatitude: latitude !== null, 
        hasLongitude: longitude !== null 
      })
      return false
    }

    // 检查经纬度是否在地球范围内
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      locationLogger.debug('位置验证失败: 经纬度超出地球范围', {
        latitude: latitude,
        longitude: longitude
      })
      return false
    }
    
    // 智能精度检查 - 严格控制精度范围
    if (accuracy && accuracy > safeConfig.maxAccuracy) {
      locationLogger.warn('位置精度超出允许范围，拒绝使用', {
        accuracy: accuracy,
        maxAllowed: safeConfig.maxAccuracy
      })
      return false // 严格拒绝低精度位置
    }

    // 检查是否在允许的区域内 - 添加更智能的区域检查
    if (Array.isArray(safeConfig.allowedRegions) && safeConfig.allowedRegions.length > 0) {
      const isInAllowedRegion = safeConfig.allowedRegions.some(region => {
        // 安全检查区域配置
        if (!region || typeof region.latitude !== 'number' || typeof region.longitude !== 'number' || typeof region.radius !== 'number') {
          return false
        }
        
        const distance = calculateDistance(
          latitude,
          longitude,
          region.latitude,
          region.longitude
        )
        
        // 如果有精度信息，可以考虑将精度纳入区域判断
        const effectiveRadius = region.radius + (accuracy || 0)
        return distance <= effectiveRadius
      })
      
      if (!isInAllowedRegion) {
        locationLogger.debug('位置验证失败: 不在允许的区域内', {
          latitude: latitude,
          longitude: longitude,
          allowedRegions: safeConfig.allowedRegions.length
        })
        // 开发环境下可以放宽区域限制
        const isDev = typeof import.meta !== 'undefined' ? import.meta.env.DEV : false
        if (isDev) {
          locationLogger.warn('开发环境: 允许使用区域外位置进行测试')
          return true
        }
        return false
      }
    }

    // 添加合理性检查 - 防止极端异常值
    const isReasonableLocation = () => {
      // 检查是否为明显的异常值
      const isExtremeLatitude = Math.abs(latitude) > 85 // 避开极地
      const isExtremeAccuracy = accuracy && accuracy > 10000 // 精度太差
      
      return !isExtremeLatitude && !isExtremeAccuracy
    }
    
    if (!isReasonableLocation()) {
      locationLogger.warn('位置数据可能异常', {
        latitude: latitude,
        longitude: longitude,
        accuracy: accuracy
      })
      return false
    }

    // 验证通过
    locationLogger.debug('位置验证通过', {
      latitude: latitude,
      longitude: longitude,
      accuracy: accuracy,
      accuracyLevel: accuracy ? (accuracy < 100 ? 'high' : accuracy < 500 ? 'medium' : 'low') : 'unknown'
    })
    return true
  } catch (error) {
    // 捕获验证过程中的任何异常
    locationLogger.error('位置验证过程中发生错误', error)
    // 验证出错时返回false，但确保不会影响应用运行
    return false
  }
}

// 计算两点之间的距离（米）- 已在第242行定义，此处删除重复定义

// 格式化距离显示
export const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)}米`
  } else {
    return `${(meters / 1000).toFixed(1)}公里`
  }
}

// 缓存相关函数
const CACHE_KEY = 'user_location_cache'
const CACHE_EXPIRY = 1 * 60 * 1000 // 1分钟缓存 - 减少缓存时间以提高定位准确性

// 获取缓存的位置
export const getCachedLocation = (allowAnyCache = false) => {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) {
      locationLogger.debug('缓存中无位置数据')
      return null
    }

    const parsed = JSON.parse(cached)
    const now = Date.now()
    const age = now - parsed.timestamp
    
    // 是否过期检查
    const isExpired = age > CACHE_EXPIRY
    
    // 精度检查
    const hasPoorAccuracy = parsed.location && parsed.location.accuracy && parsed.location.accuracy > 300
    
    // 标准模式：严格检查
    if (!allowAnyCache) {
      if (isExpired) {
        locationLogger.debug('位置缓存已过期', { age: Math.floor(age / 1000) })
        clearCachedLocation()
        return null
      }
      
      if (hasPoorAccuracy) {
        locationLogger.debug('缓存位置精度较差，不使用缓存', { accuracy: parsed.location.accuracy })
        // 不再清除缓存，只是不返回
        return null
      }
    } else {
      // 宽松模式：返回任何缓存，即使过期或精度差
      if (isExpired) {
        locationLogger.warn('使用过期的缓存位置', { age: Math.floor(age / 1000) })
      }
      
      if (hasPoorAccuracy) {
        locationLogger.warn('使用精度较差的缓存位置', { accuracy: parsed.location.accuracy })
      }
    }

    locationLogger.debug('成功获取缓存位置', { 
      age: Math.floor(age / 1000),
      allowAnyCache: allowAnyCache,
      location: { latitude: parsed.location.latitude?.toFixed(4), longitude: parsed.location.longitude?.toFixed(4) },
      accuracy: parsed.location.accuracy
    })
    return parsed.location
  } catch (error) {
    locationLogger.error('获取位置缓存失败', error)
    // 错误时清除可能损坏的缓存
    try {
      clearCachedLocation()
    } catch (e) {
      // 忽略清除缓存时的错误
    }
    return null
  }
}

// 设置位置缓存
export const setCachedLocation = (location) => {
  try {
    const cacheData = {
      location,
      timestamp: Date.now()
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
    locationLogger.debug('成功设置位置缓存', { 
      location: { latitude: location.latitude?.toFixed(4), longitude: location.longitude?.toFixed(4) }
    })
  } catch (error) {
    locationLogger.error('设置位置缓存失败', error)
  }
}

// 清除位置缓存
export const clearCachedLocation = () => {
  try {
    localStorage.removeItem(CACHE_KEY)
    locationLogger.cacheOperation('clear')
  } catch (error) {
    locationLogger.error('清除位置缓存失败', error)
  }
}

// 获取模拟位置
export const getMockLocation = (index = 0) => {
  return MOCK_LOCATIONS[index] || MOCK_LOCATIONS[0]
}

// 创建标准化的位置错误对象
export const createLocationError = (code, message, suggestion, details = '') => {
  const baseError = LOCATION_ERRORS[code] || LOCATION_ERRORS.UNKNOWN_ERROR
  
  return {
    code: code || baseError.code,
    message: message || baseError.message,
    suggestion: suggestion || baseError.suggestion,
    details,
    isWarning: baseError.isWarning || false,
    timestamp: Date.now()
  }
}

// 检查位置权限状态
export const checkLocationPermission = async () => {
  if (!isGeolocationSupported()) {
    locationLogger.permissionCheck('unsupported')
    return 'unsupported'
  }

  try {
    if ('permissions' in navigator) {
      const permission = await navigator.permissions.query({ name: 'geolocation' })
      locationLogger.permissionCheck(permission.state)
      return permission.state // 'granted', 'denied', 'prompt'
    }
    // 如果不支持permissions API，尝试获取一次位置来检查权限
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => {
          locationLogger.permissionCheck('granted')
          resolve('granted')
        },
        (error) => {
          let status = 'prompt'
          if (error.code === error.PERMISSION_DENIED) {
            status = 'denied'
          }
          locationLogger.permissionCheck(status)
          resolve(status)
        },
        {
          timeout: 100,
          enableHighAccuracy: false,
          maximumAge: Infinity
        }
      )
    })
  } catch (error) {
    locationLogger.error('检查位置权限失败', error)
    return 'error'
  }
}

// 合并多个位置数据
export const mergeLocation = (baseLocation, newLocation) => {
  return {
    ...baseLocation,
    ...newLocation,
    // 保留原始位置信息以便调试
    originalLatitude: baseLocation.latitude,
    originalLongitude: baseLocation.longitude,
    mergedAt: Date.now()
  }
}