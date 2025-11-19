import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useMapStore } from '@/stores/map'

describe('Map Store', () => {
  let mapStore

  beforeEach(() => {
    setActivePinia(createPinia())
    mapStore = useMapStore()
  })

  describe('初始状态', () => {
    it('应该正确初始化地图状态', () => {
      expect(mapStore.currentLocation).toBeNull()
      expect(mapStore.mapCenter).toEqual([112.184488, 23.028501])
      expect(mapStore.mapZoom).toBe(16)
    })
  })

  describe('setCurrentLocation', () => {
    it('应该设置当前位置', () => {
      const location = [112.185, 23.029]
      mapStore.setCurrentLocation(location)
      
      expect(mapStore.currentLocation).toEqual(location)
      expect(mapStore.mapCenter).toEqual(location)
    })

    it('应该处理null位置', () => {
      mapStore.setCurrentLocation(null)
      
      expect(mapStore.currentLocation).toBeNull()
      expect(mapStore.mapCenter).toBeNull()
    })
  })

  describe('setMapCenter', () => {
    it('应该设置地图中心', () => {
      const center = [112.186, 23.030]
      mapStore.setMapCenter(center)
      
      expect(mapStore.mapCenter).toEqual(center)
    })

    it('应该不影响当前位置', () => {
      const location = [112.185, 23.029]
      mapStore.setCurrentLocation(location)
      
      const center = [112.186, 23.030]
      mapStore.setMapCenter(center)
      
      expect(mapStore.currentLocation).toEqual(location)
      expect(mapStore.mapCenter).toEqual(center)
    })
  })

  describe('setMapZoom', () => {
    it('应该设置地图缩放级别', () => {
      mapStore.setMapZoom(18)
      expect(mapStore.mapZoom).toBe(18)
    })

    it('应该处理边界值', () => {
      mapStore.setMapZoom(0)
      expect(mapStore.mapZoom).toBe(0)
      
      mapStore.setMapZoom(20)
      expect(mapStore.mapZoom).toBe(20)
    })
  })

  describe('getDistance', () => {
    it('应该计算两点之间的距离', () => {
      const coord1 = [112.184488, 23.028501]
      const coord2 = [112.185488, 23.029501]
      
      const distance = mapStore.getDistance(coord1, coord2)
      
      expect(distance).toBeGreaterThan(0)
      expect(typeof distance).toBe('number')
    })

    it('应该处理相同坐标', () => {
      const coord = [112.184488, 23.028501]
      
      const distance = mapStore.getDistance(coord, coord)
      
      expect(distance).toBe(0)
    })

    it('应该处理远距离坐标', () => {
      const coord1 = [112.184488, 23.028501] // 广州
      const coord2 = [116.407394, 39.904211] // 北京
      
      const distance = mapStore.getDistance(coord1, coord2)
      
      expect(distance).toBeGreaterThan(1000) // 应该大于1000公里
    })

    it('应该处理负坐标', () => {
      const coord1 = [-112.184488, -23.028501]
      const coord2 = [-112.185488, -23.029501]
      
      const distance = mapStore.getDistance(coord1, coord2)
      
      expect(distance).toBeGreaterThan(0)
      expect(typeof distance).toBe('number')
    })
  })

  describe('状态响应性', () => {
    it('应该保持状态的响应性', () => {
      const initialCenter = [...mapStore.mapCenter]
      const initialZoom = mapStore.mapZoom
      
      mapStore.setMapCenter([112.186, 23.030])
      mapStore.setMapZoom(18)
      
      expect(mapStore.mapCenter).not.toEqual(initialCenter)
      expect(mapStore.mapZoom).not.toBe(initialZoom)
    })
  })

  describe('数据完整性', () => {
    it('应该保持数据类型一致', () => {
      expect(Array.isArray(mapStore.mapCenter)).toBe(true)
      expect(typeof mapStore.mapZoom).toBe('number')
      expect(typeof mapStore.getDistance).toBe('function')
    })

    it('应该正确处理坐标数组', () => {
      const validCoord = [112.184488, 23.028501]
      const distance = mapStore.getDistance(validCoord, validCoord)
      
      expect(distance).toBe(0)
    })
  })
})