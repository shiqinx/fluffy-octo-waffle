// localStorage数据清理脚本
// 用于清理污染的活动数据，确保数据一致性

console.log('🧹 开始清理localStorage数据...')

// 清理所有可能污染的活动相关数据
const keysToClean = [
  'campus_activities',
  'activities',
  'activity_participants',
  'activity_enrollments',
  'user_activities',
  'teams',
  'user_teams',
  'messages',
  'chat_messages'
]

// 清理函数
function cleanLocalStorage() {
  let cleanedCount = 0
  
  keysToClean.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`🗑️ 清理数据: ${key}`)
      localStorage.removeItem(key)
      cleanedCount++
    }
  })
  
  // 清理所有以activity_开头的键
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (key.startsWith('activity_') || key.startsWith('team_') || key.startsWith('message_'))) {
      console.log(`🗑️ 清理数据: ${key}`)
      localStorage.removeItem(key)
      cleanedCount++
    }
  }
  
  console.log(`✅ 清理完成，共清理了 ${cleanedCount} 个数据项`)
  
  // 重新初始化正确的活动数据
  initializeCorrectData()
}

// 初始化正确的活动数据
function initializeCorrectData() {
  console.log('🔄 初始化正确的活动数据...')
  
  const correctActivities = [
    {
      id: "1",
      title: "中医养生讲座",
      type: "学术讲座",
      category: "study",
      description: "邀请中医专家讲解中医养生知识，分享传统保健方法",
      location: "学术报告厅",
      startTime: "2024-01-15T14:00:00",
      endTime: "2024-01-15T16:00:00",
      maxParticipants: 30,
      organizerId: "2",
      organizerName: "中医学院",
      status: "ongoing",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "2",
      title: "摄影作品展览",
      type: "文化艺术",
      category: "culture",
      description: "展示学生摄影作品，分享摄影技巧，交流创作心得",
      location: "艺术展厅",
      startTime: "2024-01-16T10:00:00",
      endTime: "2024-01-18T18:00:00",
      maxParticipants: 25,
      organizerId: "3",
      organizerName: "摄影协会",
      status: "ongoing",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "3",
      title: "编程马拉松大赛",
      type: "科技创新",
      category: "tech",
      description: "24小时编程挑战赛，主题为智慧校园，展示编程技能",
      location: "创新实验室",
      startTime: "2024-01-20T09:00:00",
      endTime: "2024-01-22T09:00:00",
      maxParticipants: 20,
      organizerId: "4",
      organizerName: "计算机学院",
      status: "recruiting",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "4",
      title: "音乐节",
      type: "文艺演出",
      category: "culture",
      description: "年度校园音乐节，邀请校内外乐队演出，享受音乐盛宴",
      location: "露天剧场",
      startTime: "2024-01-25T19:00:00",
      endTime: "2024-01-25T23:00:00",
      maxParticipants: 40,
      organizerId: "5",
      organizerName: "学生会",
      status: "recruiting",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "5",
      title: "篮球友谊赛",
      type: "体育竞技",
      category: "sports",
      description: "周末篮球比赛，欢迎所有篮球爱好者参加，一起享受运动的快乐",
      location: "篮球场1",
      startTime: "2024-01-17T15:00:00",
      endTime: "2024-01-17T17:00:00",
      maxParticipants: 8,
      organizerId: "1",
      organizerName: "篮球社",
      status: "recruiting",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "6",
      title: "图书馆学习小组",
      type: "学习交流",
      category: "study",
      description: "图书馆学习小组，共同学习，互相进步",
      location: "图书馆三楼研讨室",
      startTime: "2024-01-18T14:00:00",
      endTime: "2024-01-18T16:00:00",
      maxParticipants: 20,
      organizerId: "6",
      organizerName: "刘老师",
      status: "recruiting",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
  
  // 保存正确的活动数据
  localStorage.setItem('campus_activities', JSON.stringify(correctActivities))
  
  console.log(`✅ 已初始化 ${correctActivities.length} 个正确的活动数据`)
  console.log('📋 活动列表:')
  correctActivities.forEach(activity => {
    console.log(`  - ${activity.id}: ${activity.title}`)
  })
}

// 验证清理结果
function verifyCleanup() {
  console.log('🔍 验证清理结果...')
  
  const activities = localStorage.getItem('campus_activities')
  if (activities) {
    try {
      const parsed = JSON.parse(activities)
      console.log(`✅ 活动数据验证通过，共 ${parsed.length} 个活动`)
      return true
    } catch (error) {
      console.error('❌ 活动数据格式错误:', error)
      return false
    }
  } else {
    console.error('❌ 活动数据不存在')
    return false
  }
}

// 执行清理
if (typeof window !== 'undefined') {
  // 浏览器环境
  cleanLocalStorage()
  verifyCleanup()
} else {
  // Node.js环境，导出函数
  module.exports = {
    cleanLocalStorage,
    initializeCorrectData,
    verifyCleanup
  }
}