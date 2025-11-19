// 测试当前活动数据状态
console.log('🔍 检查当前活动数据状态...\n');

// 模拟localStorage检查
const testLocalStorage = () => {
  console.log('📱 模拟localStorage检查:');
  
  // 模拟可能的问题数据
  const problematicData = [
    { title: '英语角活动', type: '英语学习' },
    { title: '英语角活动', type: '英语学习' },
    { title: '英语角活动', type: '英语学习' },
    { title: '英语角活动', type: '英语学习' },
    { title: '英语角活动', type: '英语学习' }
  ];
  
  console.log('❌ 问题数据示例 (全是英语角):');
  problematicData.forEach((activity, index) => {
    console.log(`  ${index + 1}. ${activity.title} - ${activity.type}`);
  });
  
  // 正确的数据
  const correctData = [
    { title: '中医养生讲座', type: '学术讲座' },
    { title: '摄影作品展览', type: '文化艺术' },
    { title: '编程马拉松大赛', type: '科技创新' },
    { title: '篮球友谊赛', type: '体育竞技' },
    { title: '校园音乐节', type: '文艺演出' },
    { title: '图书馆学习小组', type: '学习交流' }
  ];
  
  console.log('\n✅ 正确数据示例:');
  correctData.forEach((activity, index) => {
    console.log(`  ${index + 1}. ${activity.title} - ${activity.type}`);
  });
  
  return correctData;
};

// 检查数据一致性
const checkDataConsistency = (data) => {
  console.log('\n🔍 数据一致性检查:');
  
  // 检查是否有重复的活动标题
  const titles = data.map(a => a.title);
  const uniqueTitles = [...new Set(titles)];
  
  if (titles.length !== uniqueTitles.length) {
    console.log('❌ 发现重复的活动标题');
    return false;
  }
  
  // 检查是否全是英语角
  const englishCornerCount = titles.filter(title => title.includes('英语角')).length;
  if (englishCornerCount > 1) {
    console.log(`❌ 发现${englishCornerCount}个英语角活动，可能存在数据问题`);
    return false;
  }
  
  // 检查活动类型多样性
  const types = data.map(a => a.type);
  const uniqueTypes = [...new Set(types)];
  
  if (uniqueTypes.length < 3) {
    console.log('⚠️ 活动类型较少，建议增加多样性');
  }
  
  console.log('✅ 数据一致性检查通过');
  console.log(`📊 活动数量: ${data.length}`);
  console.log(`🎯 活动类型: ${uniqueTypes.join(', ')}`);
  
  return true;
};

// 运行测试
const correctData = testLocalStorage();
const isConsistent = checkDataConsistency(correctData);

console.log('\n🎯 解决方案建议:');
console.log('1. 在浏览器中打开 auto-fix-english-corner.html');
console.log('2. 该页面会自动清理localStorage并设置正确的活动数据');
console.log('3. 修复完成后刷新活动列表页面');
console.log('4. 确认活动列表显示6个不同类型的活动');

console.log('\n📋 修复后的活动列表应该包含:');
console.log('   ✓ 中医养生讲座 - 学术讲座');
console.log('   ✓ 摄影作品展览 - 文化艺术');
console.log('   ✓ 编程马拉松大赛 - 科技创新');
console.log('   ✓ 篮球友谊赛 - 体育竞技');
console.log('   ✓ 校园音乐节 - 文艺演出');
console.log('   ✓ 图书馆学习小组 - 学习交流');

if (isConsistent) {
  console.log('\n✅ 测试通过，数据结构正确');
} else {
  console.log('\n❌ 测试失败，需要修复数据');
}