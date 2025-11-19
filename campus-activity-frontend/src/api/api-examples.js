/**
 * API调用示例文件
 * 展示如何使用校园活动平台的各种API接口
 * 包含用户认证、团队管理、活动管理、消息系统和位置服务等功能
 */

// 导入所有需要的API模块
import * as authApi from './auth'
import * as userApi from './user'
import * as teamApi from './team'
import * as belongApi from './belong'
import * as activityApi from './activity'
import * as participateApi from './participate'
import * as messageApi from './message'
import * as locationApi from './location'

/**
 * 用户相关API调用示例
 */
export const userApiExamples = {
  /**
   * 用户登录示例
   */
  async loginExample() {
    try {
      // 使用studentId和password登录
      const response = await authApi.login({
        studentId: '20200001',
        password: '123456'
      })
      
      if (response.success) {
        console.log('登录成功:', response.data)
        // 保存token到本地存储
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('userInfo', JSON.stringify(response.data.userInfo))
      } else {
        console.error('登录失败:', response.message)
      }
    } catch (error) {
      console.error('登录异常:', error)
    }
  },

  /**
   * 用户注册示例
   */
  async registerExample() {
    try {
      const response = await authApi.register({
        studentId: '20200002',
        password: '123456',
        name: '新用户',
        email: 'newuser@example.com',
        phone: '13800138000',
        avatar: ''
      })
      
      if (response.success) {
        console.log('注册成功:', response.data)
      } else {
        console.error('注册失败:', response.message)
      }
    } catch (error) {
      console.error('注册异常:', error)
    }
  },

  /**
   * 获取用户信息示例
   */
  async getUserInfoExample() {
    try {
      const response = await authApi.getUserInfo()
      
      if (response.success) {
        console.log('获取用户信息成功:', response.data)
      } else {
        console.error('获取用户信息失败:', response.message)
      }
    } catch (error) {
      console.error('获取用户信息异常:', error)
    }
  },

  /**
   * 修改密码示例
   */
  async changePasswordExample() {
    try {
      const response = await authApi.changePassword({
        oldPassword: '123456',
        newPassword: '654321'
      })
      
      if (response.success) {
        console.log('修改密码成功:', response.message)
      } else {
        console.error('修改密码失败:', response.message)
      }
    } catch (error) {
      console.error('修改密码异常:', error)
    }
  }
}

/**
 * 团队相关API调用示例
 */
export const teamApiExamples = {
  /**
   * 创建团队示例
   */
  async createTeamExample() {
    try {
      const response = await teamApi.createTeam({
        teamName: '前端开发学习小组',
        description: '一起学习前端开发技术',
        avatar: '',
        tags: ['技术', '学习'],
        isPublic: true,
        joinType: 'application' // free: 自由加入, application: 申请加入
      })
      
      if (response.success) {
        console.log('创建团队成功:', response.data)
      } else {
        console.error('创建团队失败:', response.message)
      }
    } catch (error) {
      console.error('创建团队异常:', error)
    }
  },

  /**
   * 申请加入团队示例
   */
  async applyJoinTeamExample() {
    try {
      const response = await teamApi.applyJoinTeam({
        teamId: 201,
        applicationReason: '我想学习前端开发技术'
      })
      
      if (response.success) {
        console.log('申请加入团队成功:', response.message)
      } else {
        console.error('申请加入团队失败:', response.message)
      }
    } catch (error) {
      console.error('申请加入团队异常:', error)
    }
  },

  /**
   * 搜索团队示例
   */
  async searchTeamsExample() {
    try {
      const response = await teamApi.searchTeams({
        keyword: '前端',
        page: 1,
        pageSize: 10,
        tags: ['技术']
      })
      
      if (response.success) {
        console.log('搜索团队成功:', response.data)
      } else {
        console.error('搜索团队失败:', response.message)
      }
    } catch (error) {
      console.error('搜索团队异常:', error)
    }
  },

  /**
   * 获取我的团队示例
   */
  async getMyTeamsExample() {
    try {
      const response = await belongApi.getMyTeams({
        page: 1,
        pageSize: 10
      })
      
      if (response.success) {
        console.log('获取我的团队成功:', response.data)
      } else {
        console.error('获取我的团队失败:', response.message)
      }
    } catch (error) {
      console.error('获取我的团队异常:', error)
    }
  },

  /**
   * 获取团队成员示例
   */
  async getTeamMembersExample() {
    try {
      const response = await belongApi.getTeamMembers(201, {
        page: 1,
        pageSize: 10
      })
      
      if (response.success) {
        console.log('获取团队成员成功:', response.data)
      } else {
        console.error('获取团队成员失败:', response.message)
      }
    } catch (error) {
      console.error('获取团队成员异常:', error)
    }
  }
}

/**
 * 活动相关API调用示例
 */
export const activityApiExamples = {
  /**
   * 创建活动示例
   */
  async createActivityExample() {
    try {
      const response = await activityApi.createActivity({
        title: '篮球友谊赛',
        description: '周末篮球友谊赛，欢迎大家参加',
        startTime: new Date(Date.now() + 86400000).toISOString(), // 明天
        endTime: new Date(Date.now() + 93600000).toISOString(), // 明天+2小时
        location: '学校篮球场',
        latitude: 22.9388,
        longitude: 112.0353,
        maxParticipants: 20,
        tags: ['运动', '篮球'],
        joinType: 'free', // free: 自由参加, application: 申请参加
        teamId: 201
      })
      
      if (response.success) {
        console.log('创建活动成功:', response.data)
      } else {
        console.error('创建活动失败:', response.message)
      }
    } catch (error) {
      console.error('创建活动异常:', error)
    }
  },

  /**
   * 加入活动示例
   */
  async joinActivityExample() {
    try {
      const response = await activityApi.joinActivity(101, {
        participationReason: '我喜欢打篮球'
      })
      
      if (response.success) {
        console.log('加入活动成功:', response.message)
      } else {
        console.error('加入活动失败:', response.message)
      }
    } catch (error) {
      console.error('加入活动异常:', error)
    }
  },

  /**
   * 获取活动列表示例
   */
  async getActivityListExample() {
    try {
      const response = await activityApi.getActivityList({
        page: 1,
        pageSize: 10,
        keyword: '篮球',
        tags: ['运动'],
        status: 'upcoming' // upcoming: 即将开始, ongoing: 进行中, ended: 已结束
      })
      
      if (response.success) {
        console.log('获取活动列表成功:', response.data)
      } else {
        console.error('获取活动列表失败:', response.message)
      }
    } catch (error) {
      console.error('获取活动列表异常:', error)
    }
  },

  /**
   * 获取活动详情示例
   */
  async getActivityDetailExample() {
    try {
      const response = await activityApi.getActivityDetail(101)
      
      if (response.success) {
        console.log('获取活动详情成功:', response.data)
      } else {
        console.error('获取活动详情失败:', response.message)
      }
    } catch (error) {
      console.error('获取活动详情异常:', error)
    }
  },

  /**
   * 活动签到示例
   */
  async checkInActivityExample() {
    try {
      const response = await activityApi.checkInActivity(101)
      
      if (response.success) {
        console.log('活动签到成功:', response.message)
      } else {
        console.error('活动签到失败:', response.message)
      }
    } catch (error) {
      console.error('活动签到异常:', error)
    }
  },

  /**
   * 获取活动参与者示例
   */
  async getActivityParticipantsExample() {
    try {
      const response = await participateApi.getActivityParticipants(101, {
        page: 1,
        pageSize: 10
      })
      
      if (response.success) {
        console.log('获取活动参与者成功:', response.data)
      } else {
        console.error('获取活动参与者失败:', response.message)
      }
    } catch (error) {
      console.error('获取活动参与者异常:', error)
    }
  }
}

/**
 * 消息相关API调用示例
 */
export const messageApiExamples = {
  /**
   * 发送消息示例
   */
  async sendMessageExample() {
    try {
      const response = await messageApi.sendMessage({
        senderId: 1001,
        senderName: '张三',
        receiverId: 1002,
        receiverType: 'user', // user: 用户, team: 团队, activity: 活动
        content: '你好，最近怎么样？',
        type: 'text' // text: 文本, image: 图片, file: 文件
      })
      
      if (response.success) {
        console.log('发送消息成功:', response.data)
      } else {
        console.error('发送消息失败:', response.message)
      }
    } catch (error) {
      console.error('发送消息异常:', error)
    }
  },

  /**
   * 获取消息历史示例
   */
  async getMessageHistoryExample() {
    try {
      const response = await messageApi.getMessageHistory({
        senderId: 1001,
        receiverId: 1002,
        receiverType: 'user',
        page: 1,
        pageSize: 20
      })
      
      if (response.success) {
        console.log('获取消息历史成功:', response.data)
      } else {
        console.error('获取消息历史失败:', response.message)
      }
    } catch (error) {
      console.error('获取消息历史异常:', error)
    }
  },

  /**
   * 撤回消息示例
   */
  async recallMessageExample() {
    try {
      const response = await messageApi.recallMessage(1) // 消息ID
      
      if (response.success) {
        console.log('撤回消息成功:', response.message)
      } else {
        console.error('撤回消息失败:', response.message)
      }
    } catch (error) {
      console.error('撤回消息异常:', error)
    }
  }
}

/**
 * 位置相关API调用示例
 */
export const locationApiExamples = {
  /**
   * 保存位置信息示例
   */
  async saveLocationExample() {
    try {
      const response = await locationApi.saveLocation({
        latitude: 22.9388,
        longitude: 112.0353,
        address: '广东药科大学云浮校区'
      })
      
      if (response.success) {
        console.log('保存位置成功:', response.message)
      } else {
        console.error('保存位置失败:', response.message)
      }
    } catch (error) {
      console.error('保存位置异常:', error)
    }
  }
}

/**
 * 完整使用流程示例
 * 展示从登录到创建活动、加入团队的完整流程
 */
export async function completeFlowExample() {
  console.log('=== 开始完整流程示例 ===')
  
  // 1. 用户登录
  await userApiExamples.loginExample()
  
  // 2. 获取用户信息
  await userApiExamples.getUserInfoExample()
  
  // 3. 创建团队
  await teamApiExamples.createTeamExample()
  
  // 4. 获取我的团队
  await teamApiExamples.getMyTeamsExample()
  
  // 5. 创建活动
  await activityApiExamples.createActivityExample()
  
  // 6. 获取活动列表
  await activityApiExamples.getActivityListExample()
  
  console.log('=== 完整流程示例结束 ===')
}

/**
 * 使用方法说明
 * 
 * 1. 导入示例模块:
 *    import { completeFlowExample, userApiExamples, teamApiExamples, activityApiExamples, messageApiExamples, locationApiExamples } from '@/api/api-examples'
 * 
 * 2. 执行完整流程:
 *    completeFlowExample()
 * 
 * 3. 执行单个API示例:
 *    userApiExamples.loginExample() - 用户登录
 *    userApiExamples.registerExample() - 用户注册
 *    teamApiExamples.createTeamExample() - 创建团队
 *    activityApiExamples.createActivityExample() - 创建活动
 *    participateApi.getActivityParticipants() - 获取活动参与者
 *    participateApi.cancelParticipation() - 取消参与活动
 *    messageApiExamples.sendMessageExample() - 发送消息
 *    locationApiExamples.saveLocationExample() - 保存位置信息
 * 
 * 4. 注意事项:
 *    - 确保已设置正确的环境变量(VITE_USE_MOCK, VITE_API_BASE_URL)
 *    - 模拟环境下可以直接运行，真实环境需要后端API支持
 *    - 调用顺序可能会影响结果，请确保先登录再进行其他操作
 *    - 所有API接口都已包含模拟数据支持，可以直接在前端开发和测试中使用
 */