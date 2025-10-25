// 简单的 API 封装，用于模拟数据
const api = {
  async get(url, config = {}) {
    console.log('GET:', url, config)
    
    // 模拟 API 响应
    const mockResponses = {
      '/auth/user': {
        code: 200,
        data: {
          id: 1,
          username: 'demo',
          email: 'demo@example.com',
          permissions: ['activity:read', 'activity:create']
        },
        message: 'success'
      },
      '/activities': {
        code: 200,
        data: [
          {
            id: 1,
            title: '篮球比赛',
            description: '校园篮球友谊赛',
            location: '体育馆',
            time: '2024-01-15 15:00',
            participants: 12
          },
          {
            id: 2,
            title: '读书会',
            description: '每周读书分享活动',
            location: '图书馆',
            time: '2024-01-16 19:00',
            participants: 8
          },
          {
            id: 3,
            title: '编程学习小组',
            description: '前端开发技术交流',
            location: '计算机楼',
            time: '2024-01-17 14:00',
            participants: 15
          }
        ],
        message: 'success'
      }
    }

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    // 返回模拟数据或空数据
    return mockResponses[url] || { code: 200, data: null, message: 'success' }
  },
  
  async post(url, data, config = {}) {
    console.log('POST:', url, data, config)
    
    // 模拟 API 响应
    const mockResponses = {
      '/auth/login': {
        code: 200,
        data: {
          token: 'mock-jwt-token-' + Date.now(),
          userInfo: {
            id: 1,
            username: data.username,
            email: data.username + '@example.com'
          },
          permissions: ['activity:read', 'activity:create']
        },
        message: '登录成功'
      },
      '/auth/register': {
        code: 200,
        data: {
          token: 'mock-jwt-token-' + Date.now(),
          userInfo: {
            id: Date.now(),
            username: data.username,
            email: data.email
          },
          permissions: ['activity:read']
        },
        message: '注册成功'
      },
      '/activities': {
        code: 200,
        data: {
          id: Date.now(),
          ...data,
          participants: 1,
          creator: { id: 1, username: 'current-user' }
        },
        message: '活动创建成功'
      }
    }

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 800))

    // 返回模拟数据
    return mockResponses[url] || { code: 200, data: null, message: 'success' }
  },

  async put(url, data, config = {}) {
    console.log('PUT:', url, data, config)
    await new Promise(resolve => setTimeout(resolve, 500))
    return { code: 200, data: null, message: 'success' }
  },

  async delete(url, config = {}) {
    console.log('DELETE:', url, config)
    await new Promise(resolve => setTimeout(resolve, 500))
    return { code: 200, data: null, message: 'success' }
  }
}

export default api