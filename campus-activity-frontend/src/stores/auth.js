import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref('')
  const user = ref(null)
  const isAuthenticated = ref(false)

  const initUser = () => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken) {
      token.value = savedToken
      isAuthenticated.value = true
    }
    
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
      } catch (error) {
        console.error('解析用户信息失败:', error)
        user.value = null
      }
    }
  }

  const login = async (loginData) => {
    try {
      // 模拟登录API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟成功响应
      const mockToken = 'mock-token-' + Date.now()
      const mockUser = {
        id: 1,
        studentId: loginData.studentId,
        name: '测试用户'
      }
      
      token.value = mockToken
      user.value = mockUser
      isAuthenticated.value = true
      
      // 保存到localStorage
      localStorage.setItem('token', mockToken)
      localStorage.setItem('user', JSON.stringify(mockUser))
      
      console.log('✅ 登录成功:', mockUser)
      return { success: true, user: mockUser }
      
    } catch (error) {
      console.error('登录失败:', error)
      return { success: false, message: '登录失败' }
    }
  }

  const register = async (registerData) => {
    try {
      // 模拟注册API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return { success: true, message: '注册成功' }
      
    } catch (error) {
      console.error('注册失败:', error)
      return { success: false, message: '注册失败' }
    }
  }

  const logout = () => {
    token.value = ''
    user.value = null
    isAuthenticated.value = false
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    console.log('👋 用户已登出')
  }

  return {
    token,
    user,
    isAuthenticated,
    initUser,
    login,
    register,
    logout
  }
})