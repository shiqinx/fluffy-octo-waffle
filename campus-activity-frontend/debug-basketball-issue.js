// 调试当前活动数据状态
console.log('🔍 调试当前活动数据状态...')

// 检查localStorage中的数据
try {
  const stored = localStorage.getItem('campus_activities')
  if (stored) {
    const activities = JSON.parse(stored)
    console.log('📦 localStorage中的活动数据:')
    activities.forEach((activity, index) => {
      console.log(`  ${index + 1}. ${activity.title} - ${activity.type || activity.category || '无类型'}`)
    })
    
    // 检查是否全是篮球赛
    const basketballCount = activities.filter(activity => 
      activity.title && activity.title.includes('篮球')
    ).length
    console.log(`🏀 篮球活动数量: ${basketballCount}/${activities.length}`)
    
    if (basketballCount > activities.length * 0.8) {
      console.log('⚠️ 检测到过多的篮球活动，需要修复')
    }
  } else {
    console.log('📦 localStorage中没有活动数据')
  }
} catch (error) {
  console.error('❌ 读取localStorage失败:', error)
}

// 检查页面当前显示的活动数据
console.log('\n🖥️ 检查页面当前显示的活动数据...')
// 模拟访问activity store
try {
  // 尝试获取当前页面的活动数据
  const activitiesElements = document.querySelectorAll('.activity-card, .activity-item')
  console.log(`📄 页面找到 ${activitiesElements.length} 个活动元素`)
  
  activitiesElements.forEach((element, index) => {
    const titleElement = element.querySelector('.activity-title, .title, h3, h4')
    if (titleElement) {
      console.log(`  ${index + 1}. ${titleElement.textContent.trim()}`)
    }
  })
} catch (error) {
  console.error('❌ 检查页面元素失败:', error)
}

// 提供修复建议
console.log('\n🔧 修复建议:')
console.log('1. 打开 auto-fix-english-corner.html 页面')
console.log('2. 或者刷新页面让代码自动修复')
console.log('3. 或者清理浏览器localStorage')

// 自动修复函数
function autoFixActivities() {
  console.log('\n🚀 开始自动修复...')
  try {
    // 创建正确的活动数据
    const correctActivities = [
      {
        id: 1,
        title: '中医养生讲座',
        type: '学术讲座',
        category: 'study',
        description: '邀请中医专家讲解中医养生知识，分享传统保健方法。',
        locationName: '学术报告厅',
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        currentParticipants: 15,
        maxParticipants: 30,
        organizer: { name: '中医学院', role: '组织者' },
        isEnrolled: false,
        status: 'open'
      },
      {
        id: 2,
        title: '摄影作品展览',
        type: '文化艺术',
        category: 'culture',
        description: '展示学生摄影作品，分享摄影技巧，交流创作心得。',
        locationName: '艺术展厅',
        startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
        currentParticipants: 12,
        maxParticipants: 25,
        organizer: { name: '摄影协会', role: '组织者' },
        isEnrolled: false,
        status: 'open'
      },
      {
        id: 3,
        title: '编程马拉松大赛',
        type: '科技创新',
        category: 'tech',
        description: '24小时编程挑战赛，主题为智慧校园，展示编程技能。',
        locationName: '创新实验室',
        startTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        currentParticipants: 8,
        maxParticipants: 20,
        organizer: { name: '计算机学院', role: '组织者' },
        isEnrolled: false,
        status: 'open'
      },
      {
        id: 4,
        title: '篮球友谊赛',
        type: '体育竞技',
        category: 'sports',
        description: '院系间篮球友谊赛，促进各院系交流。',
        locationName: '体育馆',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
        currentParticipants: 16,
        maxParticipants: 20,
        organizer: { name: '体育部', role: '组织者' },
        isEnrolled: false,
        status: 'open'
      },
      {
        id: 5,
        title: '校园音乐节',
        type: '文艺演出',
        category: 'culture',
        description: '年度校园音乐盛典，邀请校内知名乐队和校外专业音乐人同台演出。',
        locationName: '大学生活动中心',
        startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
        currentParticipants: 85,
        maxParticipants: 100,
        organizer: { name: '学生会文艺部', role: '组织者' },
        isEnrolled: false,
        status: 'open'
      },
      {
        id: 6,
        title: '图书馆学习小组',
        type: '学习交流',
        category: 'study',
        description: '为期一周的集中学习活动，提供安静的学习环境和专业的学习指导。',
        locationName: '图书馆研讨室',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        currentParticipants: 42,
        maxParticipants: 50,
        organizer: { name: '图书馆', role: '组织者' },
        isEnrolled: false,
        status: 'open'
      }
    ]
    
    // 保存到localStorage
    localStorage.setItem('campus_activities', JSON.stringify(correctActivities))
    console.log('✅ 已修复localStorage中的活动数据')
    console.log('📋 修复后的活动列表:')
    correctActivities.forEach((activity, index) => {
      console.log(`  ${index + 1}. ${activity.title} - ${activity.type}`)
    })
    
    // 刷新页面
    setTimeout(() => {
      window.location.reload()
    }, 2000)
    
  } catch (error) {
    console.error('❌ 自动修复失败:', error)
  }
}

// 如果在浏览器环境中，提供自动修复选项
if (typeof window !== 'undefined') {
  console.log('\n💡 在浏览器控制台中运行 autoFixActivities() 来自动修复数据')
}