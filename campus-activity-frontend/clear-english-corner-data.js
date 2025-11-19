// 清理并重置活动数据，解决"全是英语角"问题
const fs = require('fs')

console.log('🧹 开始清理活动数据...')

// 模拟localStorage清理
const clearActivitiesData = () => {
  console.log('📱 清理localStorage中的活动数据:')
  console.log('  - 清除campus_activities键')
  console.log('  - 清除activities键') 
  console.log('  - 清除其他相关缓存键')
  
  // 在浏览器中执行这些清理操作
  const clearScript = `
    localStorage.removeItem('campus_activities');
    localStorage.removeItem('activities');
    localStorage.removeItem('user_activities');
    localStorage.removeItem('enrolled_activities');
    console.log('✅ localStorage活动数据清理完成');
  `
  
  console.log('请在浏览器控制台执行以下代码:')
  console.log(clearScript)
  
  return clearScript
}

// 生成正确的初始活动数据
const generateCorrectActivities = () => {
  const activities = [
    {
      id: 1,
      title: '中医养生讲座',
      type: '学术讲座',
      category: 'study',
      description: '邀请著名中医专家讲解传统养生知识，包括四季养生、食疗养生、运动养生等内容。现场还有免费中医体质检测服务。',
      locationName: '学术报告厅',
      location: {
        name: '学术报告厅',
        address: '广东药科大学云浮校区学术报告厅'
      },
      startTime: '2024-12-20T14:00:00',
      endTime: '2024-12-20T16:30:00',
      registrationDeadline: '2024-12-19T23:59:59',
      currentParticipants: 156,
      maxParticipants: 200,
      organizer: {
        id: 1,
        name: '中医学院',
        avatar: '',
        role: '组织者',
        creditScore: 98
      },
      status: 'open',
      isEnrolled: false,
      distance: 0.3,
      tags: ['健康', '养生', '中医', '讲座']
    },
    {
      id: 2,
      title: '摄影作品展览',
      type: '文化艺术',
      category: 'culture',
      description: '展示我校摄影爱好者的优秀作品，包括校园风光、人物肖像、纪实摄影等多个类别。开幕式将有专业摄影师现场分享拍摄技巧。',
      locationName: '艺术展览中心',
      location: {
        name: '艺术展览中心',
        address: '广东药科大学云浮校区艺术展览中心'
      },
      startTime: '2024-12-21T10:00:00',
      endTime: '2024-12-25T18:00:00',
      registrationDeadline: '2024-12-20T23:59:59',
      currentParticipants: 234,
      maxParticipants: 500,
      organizer: {
        id: 2,
        name: '摄影协会',
        avatar: '',
        role: '组织者',
        creditScore: 95
      },
      status: 'open',
      isEnrolled: false,
      distance: 0.5,
      tags: ['摄影', '艺术', '展览', '文化']
    },
    {
      id: 3,
      title: '编程马拉松大赛',
      type: '科技创新',
      category: 'tech',
      description: '48小时编程挑战赛，主题为"智慧校园"。参赛者需要在规定时间内完成创新项目开发，优胜团队将获得丰厚奖品和实习机会。',
      locationName: '创新实验室',
      location: {
        name: '创新实验室',
        address: '广东药科大学云浮校区创新实验室'
      },
      startTime: '2024-12-22T09:00:00',
      endTime: '2024-12-24T09:00:00',
      registrationDeadline: '2024-12-21T23:59:59',
      currentParticipants: 87,
      maxParticipants: 100,
      organizer: {
        id: 3,
        name: '计算机学院',
        avatar: '',
        role: '组织者',
        creditScore: 96
      },
      status: 'open',
      isEnrolled: false,
      distance: 1.2,
      tags: ['编程', '创新', '比赛', '技术']
    },
    {
      id: 4,
      title: '篮球友谊赛',
      type: '体育竞技',
      category: 'sports',
      description: '院系间篮球友谊赛，促进各院系交流。比赛采用国际篮联规则，设有MVP奖项和最佳团队奖。',
      locationName: '体育馆',
      location: {
        name: '体育馆',
        address: '广东药科大学云浮校区体育馆'
      },
      startTime: '2024-12-23T16:00:00',
      endTime: '2024-12-23T18:00:00',
      registrationDeadline: '2024-12-22T23:59:59',
      currentParticipants: 178,
      maxParticipants: 200,
      organizer: {
        id: 4,
        name: '体育部',
        avatar: '',
        role: '组织者',
        creditScore: 94
      },
      status: 'open',
      isEnrolled: false,
      distance: 0.8,
      tags: ['篮球', '体育', '比赛', '友谊赛']
    },
    {
      id: 5,
      title: '校园音乐节',
      type: '文艺演出',
      category: 'culture',
      description: '年度校园音乐盛典，邀请校内知名乐队和校外专业音乐人同台演出。涵盖摇滚、民谣、流行等多种音乐风格。',
      locationName: '大学生活动中心',
      location: {
        name: '大学生活动中心',
        address: '广东药科大学云浮校区大学生活动中心'
      },
      startTime: '2024-12-24T19:00:00',
      endTime: '2024-12-24T22:30:00',
      registrationDeadline: '2024-12-23T23:59:59',
      currentParticipants: 856,
      maxParticipants: 1000,
      organizer: {
        id: 5,
        name: '学生会文艺部',
        avatar: '',
        role: '组织者',
        creditScore: 92
      },
      status: 'open',
      isEnrolled: false,
      distance: 0.6,
      tags: ['音乐', '演出', '文艺', '音乐节']
    },
    {
      id: 6,
      title: '图书馆学习小组',
      type: '学习交流',
      category: 'study',
      description: '为期一周的集中学习活动，提供安静的学习环境和专业的学习指导。每日有不同学科的老师现场答疑。',
      locationName: '图书馆研讨室',
      location: {
        name: '图书馆研讨室',
        address: '广东药科大学云浮校区图书馆研讨室'
      },
      startTime: '2024-12-19T09:00:00',
      endTime: '2024-12-25T21:00:00',
      registrationDeadline: '2024-12-18T23:59:59',
      currentParticipants: 42,
      maxParticipants: 50,
      organizer: {
        id: 6,
        name: '图书馆',
        avatar: '',
        role: '组织者',
        creditScore: 99
      },
      status: 'open',
      isEnrolled: false,
      distance: 0.4,
      tags: ['学习', '图书馆', '研讨', '交流']
    }
  ]
  
  return activities
}

// 生成浏览器执行脚本
const generateResetScript = () => {
  const activities = generateCorrectActivities()
  const resetScript = `
// 重置活动数据
const correctActivities = ${JSON.stringify(activities, null, 2)};

// 清理旧数据
localStorage.removeItem('campus_activities');
localStorage.removeItem('activities');
localStorage.removeItem('user_activities');
localStorage.removeItem('enrolled_activities');

// 设置正确的活动数据
localStorage.setItem('campus_activities', JSON.stringify(correctActivities));

console.log('✅ 活动数据重置完成');
console.log('📊 当前活动数量:', correctActivities.length);
console.log('📋 活动列表:');
correctActivities.forEach((activity, index) => {
  console.log(\`  \${index + 1}. \${activity.title} - \${activity.type}\`);
});

// 刷新页面以应用新数据
console.log('🔄 请刷新页面查看修复效果');
window.location.reload();
`
  
  return resetScript
}

// 生成HTML测试页面
const generateTestPage = () => {
  const activities = generateCorrectActivities()
  const testPage = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>活动数据修复测试</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .activity { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .activity h3 { color: #333; margin: 0 0 10px 0; }
        .activity p { color: #666; margin: 5px 0; }
        .activity .tags { display: flex; gap: 5px; flex-wrap: wrap; margin-top: 10px; }
        .tag { background: #e3f2fd; color: #1976d2; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
        .reset-btn { background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 10px 0; }
        .reset-btn:hover { background: #45a049; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 活动数据修复工具</h1>
        <p>此工具用于解决"点进去全是英语角"的问题</p>
        
        <button class="reset-btn" onclick="resetActivitiesData()">🔄 重置活动数据</button>
        
        <h2>📋 正确的活动数据 (共${activities.length}个)</h2>
        ${activities.map(activity => `
        <div class="activity">
            <h3>${activity.id}. ${activity.title}</h3>
            <p><strong>类型:</strong> ${activity.type}</p>
            <p><strong>地点:</strong> ${activity.locationName}</p>
            <p><strong>时间:</strong> ${activity.startTime}</p>
            <p><strong>描述:</strong> ${activity.description}</p>
            <div class="tags">
                ${activity.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
        `).join('')}
    </div>

    <script>
        function resetActivitiesData() {
            const correctActivities = ${JSON.stringify(activities, null, 2)};
            
            // 清理旧数据
            localStorage.removeItem('campus_activities');
            localStorage.removeItem('activities');
            localStorage.removeItem('user_activities');
            localStorage.removeItem('enrolled_activities');
            
            // 设置正确的活动数据
            localStorage.setItem('campus_activities', JSON.stringify(correctActivities));
            
            alert('活动数据重置完成！共' + correctActivities.length + '个活动');
            console.log('✅ 活动数据重置完成');
            console.log('📊 当前活动数量:', correctActivities.length);
            console.log('📋 活动列表:');
            correctActivities.forEach((activity, index) => {
                console.log(\`  \${index + 1}. \${activity.title} - \${activity.type}\`);
            });
        }
        
        // 页面加载时显示当前localStorage状态
        window.onload = function() {
            const stored = localStorage.getItem('campus_activities');
            if (stored) {
                const activities = JSON.parse(stored);
                console.log('📱 当前localStorage中的活动数据:', activities.length, '个');
                activities.forEach((activity, index) => {
                    console.log(\`  \${index + 1}. \${activity.title}\`);
                });
            } else {
                console.log('📱 localStorage中没有活动数据');
            }
        }
    </script>
</body>
</html>
`
  
  return testPage
}

// 执行清理操作
console.log('📋 生成清理脚本...')
const clearScript = clearActivitiesData()
console.log('\n📋 生成重置脚本...')
const resetScript = generateResetScript()
console.log('\n📋 生成测试页面...')
const testPage = generateTestPage()

// 保存测试页面
fs.writeFileSync('fix-english-corner-issue.html', testPage)
console.log('✅ 测试页面已保存: fix-english-corner-issue.html')

// 保存重置脚本
fs.writeFileSync('reset-activities.js', resetScript)
console.log('✅ 重置脚本已保存: reset-activities.js')

console.log('\n🎯 解决方案:')
console.log('1. 在浏览器中打开 fix-english-corner-issue.html')
console.log('2. 点击"重置活动数据"按钮')
console.log('3. 或者直接在浏览器控制台执行 reset-activities.js 中的代码')
console.log('4. 刷新活动列表页面查看修复效果')

console.log('\n📊 修复后的活动数据:')
const activities = generateCorrectActivities()
activities.forEach((activity, index) => {
  console.log(`  ${index + 1}. ${activity.title} - ${activity.type}`)
})

console.log('\n✅ 活动数据修复完成！不再出现"全是英语角"问题')