// 路由跳转修复验证脚本
// 在浏览器控制台中运行此脚本来验证修复效果

console.log('🔧 开始验证路由跳转修复...');

// 模拟活动数据
const correctActivities = [
    { id: "1", title: "中医养生讲座" },
    { id: "2", title: "摄影作品展览" },
    { id: "3", title: "编程马拉松大赛" },
    { id: "4", title: "篮球友谊赛" },
    { id: "5", title: "校园音乐节" },
    { id: "6", title: "图书馆学习小组" }
];

// 测试不同的activityId值
const testIds = ["1", "2", "3", "4", "5", "6", 1, 2, 3, 4, 5, 6];

console.log('\n📋 测试结果:');

testIds.forEach(activityId => {
    // 修复前的逻辑（有问题的）
    const oldLogic = correctActivities.find(act => act.id == activityId);
    
    // 修复后的逻辑（正确的）
    const newLogic = correctActivities.find(act => String(act.id) === String(activityId));
    
    console.log(`ID: ${activityId} (类型: ${typeof activityId})`);
    console.log(`  修复前: ${oldLogic ? oldLogic.title : '未找到'}`);
    console.log(`  修复后: ${newLogic ? newLogic.title : '未找到'}`);
    console.log(`  结果一致: ${oldLogic?.id === newLogic?.id ? '✅' : '❌'}`);
    console.log('');
});

// 测试路由跳转
console.log('🧪 测试路由跳转逻辑:');
console.log('如果修复成功，点击不同活动应该跳转到对应的详情页');
console.log('请手动测试以下操作:');
console.log('1. 打开活动列表页面');
console.log('2. 点击不同的活动');
console.log('3. 检查详情页显示的活动信息是否正确');

// 检查当前页面URL
if (window.location.pathname.includes('/activities/')) {
    const currentId = window.location.pathname.split('/').pop();
    console.log(`\n📍 当前活动详情页ID: ${currentId}`);
    console.log('请检查页面显示的活动信息是否与ID匹配');
}

console.log('\n✅ 验证脚本执行完成');