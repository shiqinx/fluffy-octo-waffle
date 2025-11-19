// 直接复制此代码到浏览器控制台运行
console.log('🔧 开始验证活动详情修复...');

// 检查当前页面URL
console.log('📍 当前页面URL:', window.location.href);

// 检查路由参数
const pathParts = window.location.pathname.split('/');
const activityId = pathParts[pathParts.length - 1];
console.log('🔍 提取的活动ID:', activityId, '(类型:', typeof activityId, ')');

// 模拟修复后的活动数据
const activities = [
    { id: "1", title: "中医养生讲座" },
    { id: "2", title: "摄影作品展览" },
    { id: "3", title: "编程马拉松大赛" },
    { id: "4", title: "篮球友谊赛" },
    { id: "5", title: "校园音乐节" },
    { id: "6", title: "图书馆学习小组" }
];

// 修复后的查找逻辑
function findActivity(id) {
    console.log('🔍 查找活动ID:', id, '(类型:', typeof id, ')');
    const activity = activities.find(act => String(act.id) === String(id));
    console.log('✅ 找到活动:', activity ? activity.title : '未找到');
    return activity;
}

// 测试当前活动
if (activityId && activityId !== 'activities') {
    const currentActivity = findActivity(activityId);
    if (currentActivity) {
        console.log('🎉 当前活动应该显示:', currentActivity.title);
    } else {
        console.log('❌ 未找到对应的活动');
    }
} else {
    console.log('⚠️ 当前页面不是活动详情页');
}

// 测试所有活动ID
console.log('\n🧪 测试所有活动ID...');
activities.forEach(activity => {
    const found = findActivity(activity.id);
    const status = found && found.title === activity.title ? '✅' : '❌';
    console.log(status, `ID ${activity.id}: ${activity.title}`);
});

// 检查页面上的活动标题
const titleElement = document.querySelector('h1, .activity-title, [class*="title"]');
if (titleElement) {
    console.log('\n📄 页面上显示的标题:', titleElement.textContent.trim());
} else {
    console.log('\n⚠️ 未找到页面标题元素');
}

// 提供手动测试建议
console.log('\n📝 手动测试步骤:');
console.log('1. 前往活动列表页面');
console.log('2. 点击不同的活动项');
console.log('3. 检查详情页显示的活动标题是否正确');
console.log('4. 按F12打开开发者工具查看控制台输出');
console.log('5. 如果仍然显示"中医养生讲座"，请按Ctrl+F5强制刷新');

// 检查是否有缓存问题
console.log('\n🔍 缓存检查:');
console.log('如果修复未生效，可能的原因:');
console.log('1. 浏览器缓存了旧版本的JavaScript文件');
console.log('2. 开发服务器未正确重新加载修改的文件');
console.log('3. 有其他地方覆盖了修复的逻辑');

// 强制刷新建议
console.log('\n🔄 强制刷新建议:');
console.log('请按 Ctrl + F5 或 Cmd + Shift + R 强制刷新页面');
console.log('或者在开发者工具的Network标签中勾选"Disable cache"');