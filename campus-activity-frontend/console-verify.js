// 🔧 直接在浏览器控制台运行此脚本来验证修复效果
// 请在活动详情页面按F12打开控制台，然后粘贴并运行此脚本

console.log('🚀 开始验证活动详情修复效果...');

// 模拟正确的活动数据
const correctActivities = [
    {
        id: "1",
        title: "中医养生讲座",
        type: "lecture",
        description: "专业中医师讲解日常养生知识"
    },
    {
        id: "2", 
        title: "篮球友谊赛",
        type: "sports",
        description: "院系间篮球交流比赛"
    },
    {
        id: "3",
        title: "英语角活动",
        type: "academic",
        description: "英语口语练习交流活动"
    },
    {
        id: "4",
        title: "编程马拉松",
        type: "competition",
        description: "24小时编程挑战赛"
    },
    {
        id: "5",
        title: "志愿者招募",
        type: "volunteer",
        description: "社区服务志愿者招募活动"
    },
    {
        id: "6",
        title: "摄影展览",
        type: "cultural",
        description: "校园摄影作品展览"
    }
];

// 获取当前页面URL信息
const currentUrl = window.location.href;
const currentPath = window.location.pathname;

console.log('📍 当前URL:', currentUrl);
console.log('📍 当前路径:', currentPath);

// 检查是否在活动详情页
const activityMatch = currentPath.match(/\/activity\/(\d+)/);
if (activityMatch) {
    const activityId = activityMatch[1];
    console.log('🎯 检测到活动详情页，活动ID:', activityId);
    console.log('🔍 活动ID类型:', typeof activityId);
    
    // 使用修复后的查找逻辑
    const foundActivity = correctActivities.find(act => String(act.id) === String(activityId));
    
    if (foundActivity) {
        console.log('✅ 找到匹配的活动:', foundActivity.title);
        console.log('📝 活动详情:', foundActivity);
    } else {
        console.log('❌ 未找到匹配的活动');
    }
    
    // 检查页面显示的标题
    const titleElements = [
        document.querySelector('h1'),
        document.querySelector('.activity-title'),
        document.querySelector('.title'),
        document.querySelector('[class*="title"]'),
        document.querySelector('[class*="activity"]')
    ].filter(el => el);
    
    console.log('🏷️ 找到的标题元素数量:', titleElements.length);
    
    titleElements.forEach((element, index) => {
        const text = element.textContent.trim();
        console.log(`🏷️ 标题元素 ${index + 1}: "${text}"`);
        
        if (foundActivity && text.includes(foundActivity.title)) {
            console.log('✅ 标题匹配正确！修复生效！');
        } else if (text.includes('中医养生讲座') && foundActivity && foundActivity.title !== '中医养生讲座') {
            console.log('❌ 标题仍然显示"中医养生讲座"，修复未生效！');
            console.log('🔧 解决方案：');
            console.log('1. 按 Ctrl+F5 强制刷新页面');
            console.log('2. 清除浏览器缓存');
            console.log('3. 确认开发服务器已重启');
        }
    });
    
    // 测试所有活动的查找逻辑
    console.log('\n🧪 测试所有活动的查找逻辑...');
    correctActivities.forEach((activity, index) => {
        const testFound = correctActivities.find(act => String(act.id) === String(activity.id));
        const status = testFound && testFound.title === activity.title ? '✅' : '❌';
        console.log(`${status} 活动 ${index + 1}: ID=${activity.id}, 标题="${activity.title}"`);
    });
    
} else {
    console.log('ℹ️ 当前不在活动详情页');
    console.log('👉 请访问任意活动详情页，例如：');
    console.log('http://localhost:3000/activity/2');
    console.log('http://localhost:3000/activity/3');
    console.log('http://localhost:3000/activity/4');
}

// 手动测试函数
window.testActivityDetail = function(activityId) {
    console.log(`\n🔍 测试活动ID: ${activityId}`);
    const found = correctActivities.find(act => String(act.id) === String(activityId));
    if (found) {
        console.log('✅ 找到活动:', found.title);
        window.open(`/activity/${activityId}`, '_blank');
    } else {
        console.log('❌ 未找到活动');
    }
};

// 提供快速测试链接
console.log('\n🚀 快速测试命令：');
console.log('testActivityDetail(1); // 测试中医养生讲座');
console.log('testActivityDetail(2); // 测试篮球友谊赛');
console.log('testActivityDetail(3); // 测试英语角活动');
console.log('testActivityDetail(4); // 测试编程马拉松');
console.log('testActivityDetail(5); // 测试志愿者招募');
console.log('testActivityDetail(6); // 测试摄影展览');

console.log('\n✅ 验证脚本加载完成！');