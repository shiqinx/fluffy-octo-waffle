import request from '@/utils/request'

export const activityAPI = {
  // 搜索活动
  search(params) {
    return request.get('/activities', { params })
  },
  
  // 创建活动
  create(data) {
    return request.post('/activities', data)
  },
  
  // 加入活动
  join(activityId) {
    return request.post(`/activities/${activityId}/join`)
  },
  
  // 获取附近活动
  getNearby(location) {
    return request.get('/activities/nearby', { 
      params: location 
    })
  },
  
  // 活动签到
  checkIn(activityId) {
    return request.post(`/activities/${activityId}/checkin`)
  }
}