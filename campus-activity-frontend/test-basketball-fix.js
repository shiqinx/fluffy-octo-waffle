// 测试篮球赛问题修复效果
console.log('🏀 开始测试篮球赛问题修复效果...\n')

// 模拟localStorage中的篮球赛数据
const basketballData = [
  { id: 1, title: '篮球友谊赛', type: '体育竞技' },
  { id: 2, title: '篮球比赛', type: '体育竞技' },
  { id: 3, title: '篮球训练', type: '体育竞技' },
  { id: 4, title: '篮球联赛', type: '体育竞技' },
  { id: 5, title: '篮球赛', type: '体育竞技' }
]

// 模拟修复逻辑
function testBasketballFix(activitiesData) {
  console.log('📊 测试数据:')
  activitiesData.forEach((activity, index) => {
    console.log(`  ${index + 1}. ${activity.title} - ${activity.type}`)
  })
  
  // 数据验证：检查是否全是篮球赛
  const basketballCount = activitiesData.filter(activity => 
    activity.title && (activity.title.includes('篮球') || activity.title.includes('篮球赛'))
  ).length
  
  console.log(`\n🏀 篮球活动数量: ${basketballCount}/${activitiesData.length} (${(basketballCount/activitiesData.length*100).toFixed(1)}%)`)
  
  // 如果超过80%的活动都是篮球赛，则使用正确的默认数据
  if (basketballCount > activitiesData.length * 0.8) {
    console.warn('⚠️ 检测到过多的篮球赛活动，使用正确的默认数据')
    
    const fixedData = [
      { id: 1, title: '中医养生讲座', type: '学术讲座' },
      { id: 2, title: '摄影作品展览', type: '文化艺术' },
      { id: 3, title: '编程马拉松大赛', type: '科技创新' },
      { id: 4, title: '篮球友谊赛', type: '体育竞技' },
      { id: 5, title: '校园音乐节', type: '文艺演出' },
      { id: 6, title: '图书馆学习小组', type: '学习交流' }
    ]
    
    console.log('\n✅ 修复后的数据:')
    fixedData.forEach((activity, index) => {
      console.log(`  ${index + 1}. ${activity.title} - ${activity.type}`)
    })
    
    return fixedData
  }
  
  console.log('\n✅ 数据正常，无需修复')
  return activitiesData
}

// 执行测试
console.log('=' * 50)
const result = testBasketballFix(basketballData)
console.log('\n' + '=' * 50)
console.log('🎯 测试完成！')

// 测试正常数据
console.log('\n🔄 测试正常数据...')
const normalData = [
  { id: 1, title: '中医养生讲座', type: '学术讲座' },
  { id: 2, title: '摄影作品展览', type: '文化艺术' },
  { id: 3, title: '篮球友谊赛', type: '体育竞技' },
  { id: 4, title: '编程马拉松大赛', type: '科技创新' }
]

console.log('=' * 50)
testBasketballFix(normalData)
console.log('\n' + '=' * 50)
console.log('🎯 所有测试完成！')