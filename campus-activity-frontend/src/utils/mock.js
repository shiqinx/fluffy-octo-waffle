import { mockActivities } from '@/config/map'

// 模拟用户数据
const mockUsers = [
  {
    id: 1,
    studentId: '2330502143',
    realName: '孙金瑶',
    password: 'abc123456',
    avatar: '',
    role: 'student'
  },
  {
    id: 2, 
    studentId: '2330502134',
    realName: '卢敏婷',
    password: 'test123456',
    avatar: '',
    role: 'student'
  }
]

// 模拟团队数据
const mockTeams = [
  {
    id: 1,
    name: '篮球社',
    description: '热爱篮球运动的同学们',
    creatorId: 1,
    memberCount: 15,
    maxMembers: 30,
    activityId: 1,
    createTime: new Date().toISOString()
  },
  {
    id: 2,
    name: '学习小组',
    description: '共同学习进步',
    creatorId: 2,
    memberCount: 8,
    maxMembers: 20,
    activityId: 2,
    createTime: new Date().toISOString()
  }
]

// 模拟消息数据
const mockMessages = [
  {
    id: 1,
    activityId: 1,
    userId: 1,
    content: '欢迎大家参加篮球比赛！',
    sendTime: new Date(Date.now() - 3600000).toISOString(),
    user: {
      id: 1,
      realName: '孙金瑶',
      avatar: ''
    }
  },
  {
    id: 2,
    activityId: 1,
    userId: 2,
    content: '请问在哪里集合？',
    sendTime: new Date(Date.now() - 1800000).toISOString(),
    user: {
      id: 2,
      realName: '卢敏婷',
      avatar: ''
    }
  }
]

// 模拟 API 响应
export const mockApi = {
  // 模拟登录
  login: (data) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('模拟登录: 检查凭据', data)
        
        // 支持对象参数格式
        const studentId = data.studentId || data.username
        const password = data.password
        
        // 简单的验证逻辑
        if (!studentId || !password) {
          reject(new Error('学号和密码不能为空'))
          return
        }
        
        // 查找用户
        const user = mockUsers.find(u => u.studentId === studentId && u.password === password)
        
        if (user) {
          // 模拟成功登录
          resolve({
            success: true,
            message: '登录成功',
            data: {
              token: 'mock-jwt-token-' + Date.now(),
              user: {
                id: user.id,
                studentId: user.studentId,
                realName: user.realName,
                avatar: user.avatar,
                role: user.role
              }
            }
          })
        } else {
          reject(new Error('学号或密码错误'))
        }
      }, 1000)
    })
  },
  
  // 模拟注册
  register: (userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('模拟注册: 用户数据', userData)
        
        // 验证必填字段
        if (!userData.realName || !userData.studentId || !userData.password) {
          reject(new Error('请填写完整信息'))
          return
        }
        
        // 验证中文姓名
        if (!/^[\u4e00-\u9fa5]{2,10}$/.test(userData.realName)) {
          reject(new Error('请输入2-10位中文姓名'))
          return
        }
        
        // 验证学号格式 (6-12位数字)
        if (!/^\d{6,12}$/.test(userData.studentId)) {
          reject(new Error('学号必须是6-12位数字'))
          return
        }
        
        // 验证密码格式
        if (userData.password.length < 6) {
          reject(new Error('密码长度至少6位'))
          return
        }
        
        if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(userData.password)) {
          reject(new Error('密码需包含字母和数字'))
          return
        }
        
        // 检查学号是否已存在
        const existingUser = mockUsers.find(u => u.studentId === userData.studentId)
        if (existingUser) {
          reject(new Error('该学号已被注册'))
          return
        }
        
        // 模拟成功注册
        const newUser = {
          id: mockUsers.length + 1,
          studentId: userData.studentId,
          realName: userData.realName,
          password: userData.password,
          avatar: '',
          role: 'student'
        }
        
        mockUsers.push(newUser)
        
        resolve({
          code: 200,
          message: '注册成功',
          data: {
            user: {
              id: newUser.id,
              studentId: newUser.studentId,
              realName: newUser.realName
            }
          }
        })
      }, 1000)
    })
  },
  
  // 模拟获取活动
  getActivities: (params = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredActivities = [...mockActivities]
        
        // 关键词搜索
        if (params.keyword) {
          filteredActivities = filteredActivities.filter(activity => 
            activity.title.includes(params.keyword) || 
            activity.description.includes(params.keyword)
          )
        }
        
        // 类型筛选
        if (params.type && params.type !== 'all') {
          filteredActivities = filteredActivities.filter(activity => 
            activity.type === params.type
          )
        }
        
        resolve({
          code: 200,
          message: '获取成功',
          data: filteredActivities
        })
      }, 500)
    })
  },
  
  // 模拟获取附近活动
  getNearbyActivities: (location, radius) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: '获取成功', 
          data: mockActivities
        })
      }, 500)
    })
  },
  
  // 模拟获取活动详情
  getActivityDetail: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const activity = mockActivities.find(a => a.id === parseInt(id))
        if (activity) {
          resolve({
            code: 200,
            message: '获取成功',
            data: activity
          })
        } else {
          reject(new Error('活动不存在'))
        }
      }, 300)
    })
  },
  
  // 模拟创建活动
  createActivity: (activityData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newActivity = {
          id: mockActivities.length + 1,
          ...activityData,
          participants: 0,
          isEnrolled: false,
          createTime: new Date().toISOString(),
          organizer: {
            id: 1,
            name: '当前用户',
            avatar: ''
          }
        }
        mockActivities.push(newActivity)
        resolve({
          code: 200,
          message: '创建成功',
          data: newActivity
        })
      }, 800)
    })
  },
  
  // 模拟报名活动
  enrollActivity: (activityId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const activity = mockActivities.find(a => a.id === parseInt(activityId))
        if (activity) {
          activity.participants += 1
          activity.isEnrolled = true
        }
        resolve({
          code: 200,
          message: '报名成功，等待组织者审核',
          data: { activityId }
        })
      }, 500)
    })
  },
  
  // 模拟获取用户信息
  getUserProfile: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: '获取成功',
          data: {
            id: 1,
            studentId: '2330502143',
            realName: '孙金瑶',
            avatar: '',
            role: 'student',
            joinTime: '2024-01-01',
            activityCount: 5,
            teamCount: 2
          }
        })
      }, 300)
    })
  },
  
  // 模拟获取团队列表
  getTeams: (params = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredTeams = [...mockTeams]
        
        if (params.keyword) {
          filteredTeams = filteredTeams.filter(team => 
            team.name.includes(params.keyword) || 
            team.description.includes(params.keyword)
          )
        }
        
        resolve({
          code: 200,
          message: '获取成功',
          data: filteredTeams
        })
      }, 500)
    })
  },
  
  // 模拟创建团队
  createTeam: (teamData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTeam = {
          id: mockTeams.length + 1,
          ...teamData,
          memberCount: 1,
          createTime: new Date().toISOString()
        }
        mockTeams.push(newTeam)
        resolve({
          code: 200,
          message: '团队创建成功',
          data: newTeam
        })
      }, 800)
    })
  },
  
  // 模拟快速匹配
  quickMatch: (preferences) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: '匹配成功',
          data: {
            matchedTeams: mockTeams.slice(0, 2),
            suggestedActivities: mockActivities.slice(0, 2)
          }
        })
      }, 1000)
    })
  },
  
  // 模拟获取聊天消息
  getMessages: (activityId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const activityMessages = mockMessages.filter(msg => msg.activityId === parseInt(activityId))
        resolve({
          code: 200,
          message: '获取成功',
          data: activityMessages
        })
      }, 300)
    })
  },
  
  // 模拟发送消息
  sendMessage: (activityId, content) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 获取当前用户ID
        let currentUserId = 1
        let currentUserName = '当前用户'
        try {
          const storedUser = localStorage.getItem('auth_user')
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser)
            currentUserId = parsedUser.id || 1
            currentUserName = parsedUser.realName || '当前用户'
          }
        } catch (error) {
          console.error('读取用户信息失败:', error)
        }
        
        const newMessage = {
          id: mockMessages.length + 1,
          activityId: parseInt(activityId),
          userId: currentUserId, // 使用当前用户ID
          content,
          sendTime: new Date().toISOString(),
          user: {
            id: currentUserId,
            realName: currentUserName,
            avatar: ''
          }
        }
        mockMessages.push(newMessage)
        resolve({
          code: 200,
          message: '发送成功',
          data: newMessage
        })
      }, 200)
    })
  },
  
  // 模拟获取我的活动
  getMyActivities: (type = 'all') => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let myActivities = []
        
        // 获取当前登录用户ID（从localStorage读取）
        let currentUserId = 1 // 默认值
        try {
          const userData = localStorage.getItem('user')
          if (userData) {
            const parsedUser = JSON.parse(userData)
            currentUserId = parsedUser.id || 1
          }
        } catch (error) {
          console.error('获取当前用户ID失败:', error)
        }
        
        console.log('当前用户ID:', currentUserId)
        
        if (type === 'all' || type === 'created') {
          myActivities = myActivities.concat(mockActivities.filter(a => a.organizer.id === currentUserId))
        }
        
        if (type === 'all' || type === 'joined') {
          myActivities = myActivities.concat(mockActivities.filter(a => a.isEnrolled))
        }
        
        resolve({
          code: 200,
          message: '获取成功',
          data: myActivities
        })
      }, 400)
    })
  },
  
  // 模拟修改密码
  changePassword: (passwordData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('模拟修改密码: 密码数据', passwordData)
        
        // 验证必填字段
        if (!passwordData.currentPassword || !passwordData.newPassword) {
          reject(new Error('请填写完整信息'))
          return
        }
        
        // 验证新密码格式
        if (passwordData.newPassword.length < 6) {
          reject(new Error('新密码长度至少6位'))
          return
        }
        
        if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(passwordData.newPassword)) {
          reject(new Error('新密码需包含字母和数字'))
          return
        }
        
        // 模拟验证当前密码（这里简化处理，实际应该验证用户当前密码）
        if (passwordData.currentPassword === passwordData.newPassword) {
          reject(new Error('新密码不能与当前密码相同'))
          return
        }
        
        // 模拟成功修改密码
        resolve({
          code: 200,
          message: '密码修改成功',
          data: {
            userId: 1,
            timestamp: new Date().toISOString()
          }
        })
      }, 1000)
    })
  },
  
  // 模拟获取我的团队
  getMyTeams: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: '获取成功',
          data: mockTeams.filter(team => team.creatorId === 1)
        })
      }, 400)
    })
  }
}