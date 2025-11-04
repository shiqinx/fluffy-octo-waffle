import axios from 'axios'
import { Toast } from 'vant'

const request = axios.create({
  baseURL: 'http://localhost:8080/api', // 根据后端调整
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const { data } = response
    if (data.code === 200) {
      return data.data
    } else {
      Toast.fail(data.message || '请求失败')
      return Promise.reject(new Error(data.message))
    }
  },
  error => {
    Toast.fail('网络错误，请稍后重试')
    return Promise.reject(error)
  }
)

export default request