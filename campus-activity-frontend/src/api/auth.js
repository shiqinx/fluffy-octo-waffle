import request from '@/utils/request'

export const authAPI = {
  // 用户登录
  login(data) {
    return request.post('/auth/login', data)
  },
  
  // 用户注册
  register(data) {
    return request.post('/auth/register', data)
  },
  
  // 获取用户信息
  getUserInfo() {
    return request.get('/auth/user')
  },
  
  // 刷新token
  refreshToken() {
    return request.post('/auth/refresh')
  }
}