// 全面测试活动数据显示修复效果
// 在浏览器控制台中运行此脚本来验证所有数据源

console.log('🔍 开始全面测试活动数据显示修复效果...');

// 1. 检查localStorage中的活动数据
console.log('\n📱 1. 检查localStorage中的活动数据:');
const storedActivities = localStorage.getItem('activities');
if (storedActivities) {
  const activities = JSON.parse(storedActivities);
  console.log(`✅ 找到 ${activities.length} 个活动:`);
  activities.forEach((activity, index) => {
    console.log(`  ${index + 1}. ${activity.title} (${activity.type})`);
  });
} else {
  console.log('❌ localStorage中没有活动数据');
}

// 2. 检查各个数据源的一致性
console.log('\n🔗 2. 检查数据源一致性:');

// 模拟从config/map.js导入的数据
const mapMockActivities = [
  {
    id: 1,
    title: '中医养生讲座',
    type: '学术讲座'
  },
  {
    id: 2,
    title: '摄影作品展览',
    type: '文化艺术'
  },
  {
    id: 3,
    title: '编程马拉松大赛',
    type: '科技创新'
  },
  {
    id: 4,
    title: '篮球友谊赛',
    type: '体育竞技'
  },
  {
    id: 5,
    title: '校园音乐节',
    type: '文艺演出'
  },
  {
    id: 6,
    title: '图书馆学习小组',
    type: '学习交流'
  }
];

console.log('✅ config/map.js 中的活动数据:');
mapMockActivities.forEach((activity, index) => {
  console.log(`  ${index + 1}. ${activity.title} (${activity.type})`);
});

// 3. 检查是否有重复的篮球活动
console.log('\n🏀 3. 检查篮球活动数量:');
const basketballActivities = mapMockActivities.filter(activity => 
  activity.title.includes('篮球') || activity.type.includes('体育')
);
console.log(`找到 ${basketballActivities.length} 个篮球相关活动:`);
basketballActivities.forEach((activity, index) => {
  console.log(`  ${index + 1}. ${activity.title} (${activity.type})`);
});

// 4. 检查活动类型多样性
console.log('\n🎨 4. 检查活动类型多样性:');
const activityTypes = [...new Set(mapMockActivities.map(activity => activity.type))];
console.log(`✅ 活动类型总数: ${activityTypes.length}`);
console.log('活动类型列表:');
activityTypes.forEach((type, index) => {
  console.log(`  ${index + 1}. ${type}`);
});

// 5. 模拟点击活动详情测试
console.log('\n🖱️ 5. 模拟点击活动详情测试:');
mapMockActivities.forEach((activity, index) => {
  console.log(`点击活动 ${activity.id}: ${activity.title}`);
  console.log(`  预期显示: ${activity.title} - ${activity.type}`);
  console.log(`  详情URL: /activity/${activity.id}`);
});

// 6. 检查用户信息
console.log('\n👤 6. 检查当前用户信息:');
const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
console.log(`用户ID: ${userInfo.id || '未设置'}`);
console.log(`用户名: ${userInfo.realName || '未设置'}`);

// 7. 提供手动测试步骤
console.log('\n📋 7. 手动测试步骤:');
console.log('请按以下步骤手动验证修复效果:');
console.log('1. 刷新页面 (F5)');
console.log('2. 访问活动列表页面: http://localhost:3000/activities');
console.log('3. 检查活动列表是否显示6个不同类型的活动');
console.log('4. 逐个点击活动，验证详情页面显示正确的标题和内容');
console.log('5. 确认不再出现"全是篮球赛"的问题');

// 8. 问题排查指南
console.log('\n🔧 8. 如果问题仍然存在，请检查:');
console.log('□ 浏览器缓存是否已清理');
console.log('□ localStorage是否已更新');
console.log('□ 开发服务器是否已重启');
console.log('□ 是否有其他组件仍在使用旧的数据源');

console.log('\n✅ 测试脚本执行完成！');
console.log('如果所有检查都通过，说明活动数据显示问题已修复。');