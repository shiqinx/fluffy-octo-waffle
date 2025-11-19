// 全局数据存储管理器
class GlobalDataManager {
  constructor() {
    if (typeof globalThis !== 'undefined' && !globalThis.__campusActivityData) {
      globalThis.__campusActivityData = {
        initialized: false
      };
    }
    
    this.initData();
  }
  
  initData() {
    const data = this.getData();
    
    if (!data.initialized) {
      // 初始化用户数据
      data.users = [
        {
          id: 1,
          studentId: '2330502143',
          realName: '孙金瑶',
          password: 'abc123456',
          department: '计算机科学与技术',
          avatar: '/default-avatar.png',
          creditScore: 95,
          bio: '热爱编程的学生',
          interests: ['编程', '音乐', '电影'],
          tags: ['积极', '靠谱'],
          contact: {
            email: '',
            phone: ''
          }
        },
        {
          id: 2,
          studentId: '2330502134', 
          realName: '卢敏婷',
          password: 'test123456',
          department: '计算机科学与技术',
          avatar: '/default-avatar.png',
          creditScore: 92,
          bio: '喜欢参加各种活动',
          interests: ['摄影', '旅行', '阅读'],
          tags: ['细心', '创意'],
          contact: {
            email: '',
            phone: ''
          }
        }
      ];
      
      // 初始化活动数据 - 修复为多样化的活动列表
      data.mockActivities = [
        {
          id: 1,
          title: '中医养生讲座',
          type: '学术讲座',
          category: 'study',
          description: '邀请著名中医专家讲解传统养生知识，包括四季养生、食疗养生、运动养生等内容。现场还有免费中医体质检测服务。',
          organizerId: 1,
          organizerName: '中医学院',
          startTime: new Date(Date.now() + 86400000 * 2).toISOString(),
          endTime: new Date(Date.now() + 86400000 * 2 + 10800000).toISOString(),
          location: '学术报告厅',
          locationName: '学术报告厅',
          maxParticipants: 200,
          currentParticipants: 156,
          status: 'recruiting',
          tags: ['健康', '养生', '中医', '讲座'],
          coverImage: '/activity-cover-1.png',
          createdAt: new Date().toISOString(),
          distance: 0.3
        },
        {
          id: 2,
          title: '摄影作品展览',
          type: '文化艺术',
          category: 'culture',
          description: '展示我校摄影爱好者的优秀作品，包括校园风光、人物肖像、纪实摄影等多类别。开幕式将有专业摄影师现场分享拍摄技巧。',
          organizerId: 2,
          organizerName: '摄影协会',
          startTime: new Date(Date.now() + 86400000 * 3).toISOString(),
          endTime: new Date(Date.now() + 86400000 * 3 + 28800000).toISOString(),
          location: '艺术展览中心',
          locationName: '艺术展览中心',
          maxParticipants: 500,
          currentParticipants: 234,
          status: 'recruiting',
          tags: ['摄影', '艺术', '展览', '文化'],
          coverImage: '/activity-cover-2.png',
          createdAt: new Date().toISOString(),
          distance: 0.5
        },
        {
          id: 3,
          title: '编程马拉松大赛',
          type: '科技创新',
          category: 'tech',
          description: '48小时编程挑战赛，主题为"智慧校园"。参赛者需要在规定时间内完成创新项目开发，优胜团队将获得丰厚奖品和实习机会。',
          organizerId: 3,
          organizerName: '计算机学院',
          startTime: new Date(Date.now() + 86400000 * 4).toISOString(),
          endTime: new Date(Date.now() + 86400000 * 6).toISOString(),
          location: '创新实验室',
          locationName: '创新实验室',
          maxParticipants: 100,
          currentParticipants: 87,
          status: 'recruiting',
          tags: ['编程', '创新', '比赛', '技术'],
          coverImage: '/activity-cover-3.png',
          createdAt: new Date().toISOString(),
          distance: 1.2
        },
        {
          id: 4,
          title: '校园音乐节',
          type: '文艺演出',
          category: 'culture',
          description: '年度校园音乐盛典，邀请校内知名乐队和校外专业音乐人同台演出。涵盖摇滚、民谣、流行等多种音乐风格。',
          organizerId: 5,
          organizerName: '学生会文艺部',
          startTime: new Date(Date.now() + 86400000 * 6).toISOString(),
          endTime: new Date(Date.now() + 86400000 * 6 + 14400000).toISOString(),
          location: '大学生活动中心',
          locationName: '大学生活动中心',
          maxParticipants: 1000,
          currentParticipants: 856,
          status: 'recruiting',
          tags: ['音乐', '演出', '文艺', '音乐节'],
          coverImage: '/activity-cover-5.png',
          createdAt: new Date().toISOString(),
          distance: 0.6
        },
        {
          id: 5,
          title: '篮球友谊赛',
          type: '体育竞技',
          category: 'sports',
          description: '院系间篮球友谊赛，促进各院系交流。比赛采用国际篮联规则，设有MVP奖项和最佳团队奖。',
          organizerId: 4,
          organizerName: '体育部',
          startTime: new Date(Date.now() + 86400000 * 5).toISOString(),
          endTime: new Date(Date.now() + 86400000 * 5 + 7200000).toISOString(),
          location: '体育馆',
          locationName: '体育馆',
          maxParticipants: 200,
          currentParticipants: 178,
          status: 'recruiting',
          tags: ['篮球', '体育', '比赛', '友谊赛'],
          coverImage: '/activity-cover-4.png',
          createdAt: new Date().toISOString(),
          distance: 0.8
        },
        {
          id: 6,
          title: '图书馆学习小组',
          type: '学习交流',
          category: 'study',
          description: '为期一周的集中学习活动，提供安静的学习环境和专业的学习指导。每日有不同学科的老师现场答疑。',
          organizerId: 6,
          organizerName: '图书馆',
          startTime: new Date(Date.now() + 86400000 * 1).toISOString(),
          endTime: new Date(Date.now() + 86400000 * 7).toISOString(),
          location: '图书馆研讨室',
          locationName: '图书馆研讨室',
          maxParticipants: 50,
          currentParticipants: 42,
          status: 'recruiting',
          tags: ['学习', '图书馆', '研讨', '交流'],
          coverImage: '/activity-cover-6.png',
          createdAt: new Date().toISOString(),
          distance: 0.4
        }
      ];
      
      // 初始化活动参与者数据
      data.activityParticipants = {
        1: [
          { userId: 1, userName: '孙金瑶', status: 'approved', joinTime: new Date().toISOString() },
          { userId: 2, userName: '卢敏婷', status: 'approved', joinTime: new Date().toISOString() }
        ],
        2: [
          { userId: 1, userName: '孙金瑶', status: 'approved', joinTime: new Date().toISOString() }
        ],
        3: [],
        4: [
          { userId: 1, userName: '孙金瑶', status: 'approved', joinTime: new Date().toISOString() },
          { userId: 2, userName: '卢敏婷', status: 'approved', joinTime: new Date().toISOString() }
        ],
        5: [
          { userId: 1, userName: '孙金瑶', status: 'approved', joinTime: new Date().toISOString() }
        ],
        6: [
          { userId: 1, userName: '孙金瑶', status: 'approved', joinTime: new Date().toISOString() },
          { userId: 2, userName: '卢敏婷', status: 'approved', joinTime: new Date().toISOString() }
        ]
      };
      
      // 初始化活动聊天记录
      data.activityChats = {
        1: [
          { id: 1, userId: 1, userName: '孙金瑶', content: '大家好，期待中医养生讲座！', time: new Date().toISOString() },
          { id: 2, userId: 2, userName: '卢敏婷', content: '我也很期待，想学习养生知识', time: new Date(Date.now() + 60000).toISOString() },
          { id: 3, userId: 1, userName: '孙金瑶', content: '听说还有免费体质检测，太好了！', time: new Date(Date.now() + 120000).toISOString() }
        ],
        2: [
          { id: 1, userId: 1, userName: '孙金瑶', content: '摄影展的作品真的很棒！', time: new Date().toISOString() },
          { id: 2, userId: 2, userName: '卢敏婷', content: '是啊，那张校园风景拍得特别美', time: new Date(Date.now() + 30000).toISOString() },
          { id: 3, userId: 1, userName: '孙金瑶', content: '开幕式一定要去参加', time: new Date(Date.now() + 90000).toISOString() }
        ],
        3: [
          { id: 1, userId: 1, userName: '孙金瑶', content: '编程马拉松大家准备好了吗？', time: new Date().toISOString() },
          { id: 2, userId: 2, userName: '卢敏婷', content: '我组好队了，主题是智慧校园', time: new Date(Date.now() + 45000).toISOString() }
        ],
        4: [
          { id: 1, userId: 1, userName: '孙金瑶', content: '音乐节的阵容太强大了！', time: new Date().toISOString() },
          { id: 2, userId: 2, userName: '卢敏婷', content: '最喜欢摇滚乐队，现场一定很燃', time: new Date(Date.now() + 30000).toISOString() },
          { id: 3, userId: 1, userName: '孙金瑶', content: '我们一起去吧！', time: new Date(Date.now() + 75000).toISOString() }
        ],
        5: [
          { id: 1, userId: 1, userName: '孙金瑶', content: '篮球友谊赛加油！', time: new Date().toISOString() },
          { id: 2, userId: 2, userName: '卢敏婷', content: '我们院系一定能赢', time: new Date(Date.now() + 60000).toISOString() },
          { id: 3, userId: 1, userName: '孙金瑶', content: '大家都要去加油助威啊', time: new Date(Date.now() + 120000).toISOString() }
        ],
        6: [
          { id: 1, userId: 1, userName: '孙金瑶', content: '学习小组的氛围真好', time: new Date().toISOString() },
          { id: 2, userId: 2, userName: '卢敏婷', content: '是啊，老师答疑很专业', time: new Date(Date.now() + 30000).toISOString() },
          { id: 3, userId: 1, userName: '孙金瑶', content: '这周的学习计划完成得怎么样？', time: new Date(Date.now() + 90000).toISOString() }
        ]
      };
      
      data.currentToken = null;
      data.participatedActivities = []; // 用户参与活动的记录，包含签到状态
      data.initialized = true;
      
      // 初始化参与记录数据
      const initialParticipations = [
        // 用户1参与的活动
        { activityId: 1, userId: 1, userName: '孙金瑶', status: 'approved', joinTime: new Date().toISOString() },
        { activityId: 2, userId: 1, userName: '孙金瑶', status: 'approved', joinTime: new Date().toISOString() },
        { activityId: 4, userId: 1, userName: '孙金瑶', status: 'approved', joinTime: new Date().toISOString() },
        { activityId: 5, userId: 1, userName: '孙金瑶', status: 'approved', joinTime: new Date().toISOString() },
        { activityId: 6, userId: 1, userName: '孙金瑶', status: 'approved', joinTime: new Date().toISOString() },
        // 用户2参与的活动
        { activityId: 1, userId: 2, userName: '卢敏婷', status: 'approved', joinTime: new Date().toISOString() },
        { activityId: 4, userId: 2, userName: '卢敏婷', status: 'approved', joinTime: new Date().toISOString() },
        { activityId: 6, userId: 2, userName: '卢敏婷', status: 'approved', joinTime: new Date().toISOString() }
      ];
      
      data.participatedActivities = initialParticipations;
      
      console.log('全局数据管理器初始化完成');
    }
  }
  
  getData() {
    if (typeof globalThis !== 'undefined' && globalThis.__campusActivityData) {
      return globalThis.__campusActivityData;
    }
    throw new Error('全局数据存储不可用');
  }
  
  // 获取用户列表
  getUsers() {
    return this.getData().users;
  }
  
  // 获取活动列表
  getActivities() {
    return this.getData().mockActivities;
  }
  
  // 添加活动
  addActivity(activity) {
    this.getData().mockActivities.push(activity);
  }
  
  // 获取活动参与者
  getActivityParticipants(activityId) {
    return this.getData().activityParticipants[activityId] || [];
  }
  
  // 获取活动报名信息（别名方法，与getActivityParticipants功能相同）
  getActivityEnrollments(activityId) {
    return this.getActivityParticipants(activityId);
  }
  
  // 设置活动参与者
  setActivityParticipants(activityId, participants) {
    this.getData().activityParticipants[activityId] = participants;
  }
  
  // 获取活动聊天记录
  getActivityChats(activityId) {
    return this.getData().activityChats[activityId] || [];
  }
  
  // 设置活动聊天记录
  setActivityChats(activityId, chats) {
    this.getData().activityChats[activityId] = chats;
  }
  
  // 获取当前token
  getCurrentToken() {
    return this.getData().currentToken;
  }
  
  // 设置当前token
  setCurrentToken(token) {
    this.getData().currentToken = token;
  }
  
  // 获取当前用户ID
  getCurrentUserId() {
    const data = this.getData();
    return data.currentUserId || this.getUsers()[0]?.id || 1;
  }
  
  // 设置当前用户ID
  setCurrentUserId(userId) {
    this.getData().currentUserId = userId;
  }
  
  // 确保用户参与活动（用于测试）
  ensureUserParticipation(activityId) {
    const currentUserId = this.getCurrentUserId();
    let participants = this.getActivityParticipants(activityId);
    
    if (participants.length === 0) {
      this.setActivityParticipants(activityId, participants);
    }
    
    // 检查当前用户是否已参与该活动
    const existingParticipant = participants.find(p => p.userId === currentUserId);
    if (!existingParticipant) {
      // 自动添加当前用户为已批准的参与者（用于测试聊天功能）
      participants.push({
        userId: currentUserId,
        userName: this.getUsers()[0]?.realName || '测试用户',
        status: 'approved',
        joinTime: new Date().toISOString()
      });
      this.setActivityParticipants(activityId, participants);
      
      // 同时添加到参与记录中
      this.addParticipatedActivity({
        activityId: parseInt(activityId),
        userId: currentUserId,
        status: 'approved',
        joinTime: new Date().toISOString()
      });
    }
  }
  
  // 获取用户参与活动记录
  getParticipatedActivities() {
    return this.getData().participatedActivities || [];
  }
  
  // 添加用户参与活动记录
  addParticipatedActivity(participation) {
    const participatedActivities = this.getParticipatedActivities();
    const existingIndex = participatedActivities.findIndex(
      p => p.activityId === participation.activityId && p.userId === participation.userId
    );
    
    if (existingIndex >= 0) {
      participatedActivities[existingIndex] = participation;
    } else {
      participatedActivities.push(participation);
    }
    
    this.getData().participatedActivities = participatedActivities;
  }
  
  // 更新用户参与活动记录
  updateParticipatedActivity(activityId, userId, updates) {
    const participatedActivities = this.getParticipatedActivities();
    const participation = participatedActivities.find(
      p => p.activityId === parseInt(activityId) && p.userId === userId
    );
    
    if (participation) {
      Object.assign(participation, updates);
    }
  }
}

// 导出单例实例
export const globalDataManager = new GlobalDataManager();

// 为了向后兼容，导出获取数据的函数
export const getUsers = () => globalDataManager.getUsers();
export const getActivities = () => globalDataManager.getActivities();
export const getActivityParticipants = (activityId) => globalDataManager.getActivityParticipants(activityId);
export const getActivityChats = (activityId) => globalDataManager.getActivityChats(activityId);
export const getCurrentUserId = () => globalDataManager.getCurrentUserId();
export const ensureUserParticipation = (activityId) => globalDataManager.ensureUserParticipation(activityId);