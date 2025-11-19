// 清理和重新初始化localStorage活动数据的脚本
// 在浏览器控制台中运行此脚本

console.log('🔧 开始清理和重新初始化活动数据...');

// 1. 清除现有的活动数据
localStorage.removeItem('campus_activities');
console.log('✅ 已清除现有的活动数据');

// 2. 重新初始化默认活动数据
const defaultActivities = [
  {
    id: 1,
    title: '周末篮球友谊赛',
    type: 'sports',
    category: 'sports',
    locationName: '篮球场1',
    location: {
      name: '篮球场1',
      address: '学校篮球场1'
    },
    description: '周末篮球比赛，欢迎所有篮球爱好者参加。活动将在学校篮球场举行，请自带运动装备。',
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
    registrationDeadline: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    enrollStartTime: new Date().toISOString(),
    enrollEndTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    currentParticipants: 4,
    maxParticipants: 8,
    organizerId: 1,
    organizer: {
      id: 1,
      name: '篮球社',
      avatar: 'https://via.placeholder.com/150',
      role: '组织者',
      creditScore: 95
    },
    distance: 0.5,
    isEnrolled: false,
    isApproved: false,
    status: 'open',
    participants: [],
    enrollments: []
  },
  {
    id: 2,
    title: '中医养生讲座',
    type: 'study',
    category: 'study',
    locationName: '学术报告厅',
    location: {
      name: '学术报告厅',
      address: '学校主楼201'
    },
    description: '邀请中医专家讲解中医养生知识，包括日常保健、食疗养生等内容。现场还有免费体检和咨询。',
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    registrationDeadline: new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000).toISOString(),
    enrollStartTime: new Date().toISOString(),
    enrollEndTime: new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000).toISOString(),
    currentParticipants: 25,
    maxParticipants: 100,
    organizerId: 2,
    organizer: {
      id: 2,
      name: '中医协会',
      avatar: 'https://via.placeholder.com/150',
      role: '组织者',
      creditScore: 98
    },
    distance: 0.3,
    isEnrolled: false,
    isApproved: false,
    status: 'open',
    participants: [],
    enrollments: []
  },
  {
    id: 3,
    title: '摄影作品展览',
    type: 'culture',
    category: 'culture',
    locationName: '艺术楼展厅',
    location: {
      name: '艺术楼展厅',
      address: '学校艺术楼二楼'
    },
    description: '展示校园摄影爱好者的优秀作品，包括风景、人物、纪实等多个类别。开幕式将有专业摄影师进行现场点评。',
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    registrationDeadline: new Date(Date.now() + 2.5 * 24 * 60 * 60 * 1000).toISOString(),
    enrollStartTime: new Date().toISOString(),
    enrollEndTime: new Date(Date.now() + 2.5 * 24 * 60 * 60 * 1000).toISOString(),
    currentParticipants: 15,
    maxParticipants: 50,
    organizerId: 3,
    organizer: {
      id: 3,
      name: '摄影协会',
      avatar: 'https://via.placeholder.com/150',
      role: '组织者',
      creditScore: 92
    },
    distance: 0.6,
    isEnrolled: false,
    isApproved: false,
    status: 'open',
    participants: [],
    enrollments: []
  },
  {
    id: 4,
    title: '编程马拉松大赛',
    type: 'tech',
    category: 'tech',
    locationName: '计算机实验室',
    location: {
      name: '计算机实验室',
      address: '信息学院楼302'
    },
    description: '24小时编程挑战赛，主题为"智慧校园"。提供餐饮和休息区，优胜团队将获得丰厚奖品和实习机会。',
    startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    enrollStartTime: new Date().toISOString(),
    enrollEndTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    currentParticipants: 8,
    maxParticipants: 20,
    organizerId: 4,
    organizer: {
      id: 4,
      name: '计算机协会',
      avatar: 'https://via.placeholder.com/150',
      role: '组织者',
      creditScore: 96
    },
    distance: 1.0,
    isEnrolled: false,
    isApproved: false,
    status: 'open',
    participants: [],
    enrollments: []
  },
  {
    id: 5,
    title: '音乐节',
    type: 'culture',
    category: 'culture',
    locationName: '露天音乐广场',
    location: {
      name: '露天音乐广场',
      address: '学生活动中心前广场'
    },
    description: '年度校园音乐节，邀请校内外乐队演出，包含摇滚、民谣、电子等多种音乐风格。现场还有美食摊位和互动游戏。',
    startTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
    registrationDeadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    enrollStartTime: new Date().toISOString(),
    enrollEndTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    currentParticipants: 120,
    maxParticipants: 500,
    organizerId: 5,
    organizer: {
      id: 5,
      name: '学生会文艺部',
      avatar: 'https://via.placeholder.com/150',
      role: '组织者',
      creditScore: 94
    },
    distance: 0.4,
    isEnrolled: false,
    isApproved: false,
    status: 'open',
    participants: [],
    enrollments: []
  }
];

// 3. 保存新的活动数据
localStorage.setItem('campus_activities', JSON.stringify(defaultActivities));
console.log('✅ 已重新初始化活动数据，活动数量:', defaultActivities.length);

// 4. 验证数据
const stored = localStorage.getItem('campus_activities');
const activities = JSON.parse(stored);
console.log('📋 当前存储的活动:');
activities.forEach(activity => {
  console.log(`  - ID: ${activity.id}, 标题: ${activity.title}, 类型: ${activity.type}`);
});

console.log('🎉 数据初始化完成！现在刷新页面，活动详情应该能正常显示了。');