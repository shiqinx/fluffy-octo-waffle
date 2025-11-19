import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMapStore = defineStore('map', () => {
  const currentLocation = ref(null)
  const mapCenter = ref([112.184488, 23.028501]) // 默认校园中心
  const mapZoom = ref(16)
  
  const setCurrentLocation = (location) => {
    currentLocation.value = location
    mapCenter.value = location
  }
  
  const setMapCenter = (center) => {
    mapCenter.value = center
  }
  
  const setMapZoom = (zoom) => {
    mapZoom.value = zoom
  }
  
  const getDistance = (coord1, coord2) => {
    const [lng1, lat1] = coord1
    const [lng2, lat2] = coord2
    
    const R = 6371 // 地球半径(km)
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c
    
    return distance
  }
  
  return {
    currentLocation,
    mapCenter,
    mapZoom,
    setCurrentLocation,
    setMapCenter,
    setMapZoom,
    getDistance
  }
})