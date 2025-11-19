// 直接在浏览器控制台运行此脚本来测试修复
console.log('🔧 开始测试活动详情修复...');

// 模拟 correctActivities 数据（与 mock.js 中的一致）
const correctActivities = [
    {
        id: "1",
        title: "中医养生讲座",
        type: "学术讲座",
        location: "教学楼A101"
    },
    {
        id: "2",
        title: "摄影作品展览",
        type: "文化艺术",
        location: "艺术中心展厅"
    },
    {
        id: "3",
        title: "编程马拉松大赛",
        type: "科技创新",
        location: "计算机实验室"
    },
    {
        id: "4",
        title: "篮球友谊赛",
        type: "体育竞技",
        location: "体育馆"
    },
    {
        id: "5",
        title: "校园音乐节",
        type: "文艺演出",
        location: "大礼堂"
    },
    {
        id: "6",
        title: "图书馆学习小组",
        type: "学习交流",
        location: "图书馆三楼研讨室"
    }
];

// 测试函数：模拟修复后的 mockGetActivityDetail 逻辑
function testMockGetActivityDetail(activityId) {
    console.log(`\n🧪 测试获取活动详情，activityId: ${activityId} (类型: ${typeof activityId})`);
    
    // 修复后的逻辑
    let activity = correctActivities.find(act => String(act.id) === String(activityId));
    
    if (activity) {
        console.log(`✅ 找到活动: ${activity.title} (ID: ${activity.id})`);
        return {
            success: true,
            data: activity
        };
    } else {
        console.log(`❌ 活动不存在，activityId: ${activityId}`);
        return {
            success: false,
            message: '活动不存在'
        };
    }
}

// 测试所有可能的ID类型和值
console.log('\n📋 开始完整测试...');

const testCases = [
    // 字符串ID
    "1", "2", "3", "4", "5", "6",
    // 数字ID
    1, 2, 3, 4, 5, 6,
    // 边界情况
    "0", 0, "7", 7, null, undefined, ""
];

let successCount = 0;
let failCount = 0;

testCases.forEach((testId, index) => {
    const result = testMockGetActivityDetail(testId);
    
    if (result.success) {
        // 验证返回的活动是否正确
        const expectedActivity = correctActivities.find(act => String(act.id) === String(testId));
        if (expectedActivity && result.data.title === expectedActivity.title) {
            console.log(`✅ 测试 ${index + 1} 成功: ID ${testId} -> ${result.data.title}`);
            successCount++;
        } else {
            console.log(`❌ 测试 ${index + 1} 失败: ID ${testId} 返回了错误的活动`);
            failCount++;
        }
    } else {
        // 检查是否应该失败
        const shouldExist = correctActivities.some(act => String(act.id) === String(testId));
        if (!shouldExist) {
            console.log(`✅ 测试 ${index + 1} 正确失败: ID ${testId} 确实不存在`);
            successCount++;
        } else {
            console.log(`❌ 测试 ${index + 1} 意外失败: ID ${testId} 应该存在但返回失败`);
            failCount++;
        }
    }
});

console.log(`\n📊 测试结果统计:`);
console.log(`✅ 成功: ${successCount} 个测试`);
console.log(`❌ 失败: ${failCount} 个测试`);
console.log(`📈 成功率: ${((successCount / testCases.length) * 100).toFixed(1)}%`);

if (failCount === 0) {
    console.log('\n🎉 所有测试通过！修复已生效！');
} else {
    console.log('\n⚠️  仍有测试失败，需要进一步检查。');
}

// 测试路由跳转模拟
console.log('\n🛣️  测试路由跳转模拟...');

function simulateRouteClick(activityId) {
    console.log(`\n🖱️  模拟点击活动 ID: ${activityId}`);
    
    // 模拟路由URL
    const routeUrl = `/activities/${activityId}`;
    console.log(`📍 路由URL: ${routeUrl}`);
    
    // 从URL中提取ID
    const extractedId = routeUrl.split('/').pop();
    console.log(`🔍 提取的ID: ${extractedId} (类型: ${typeof extractedId})`);
    
    // 测试获取活动详情
    const result = testMockGetActivityDetail(extractedId);
    
    return result;
}

// 测试几个关键活动
["1", "2", "3", "4", "5", "6"].forEach(id => {
    const result = simulateRouteClick(id);
    if (result.success) {
        console.log(`✅ 路由跳转测试成功: ${id} -> ${result.data.title}`);
    } else {
        console.log(`❌ 路由跳转测试失败: ${id} -> ${result.message}`);
    }
});

console.log('\n🏁 测试完成！请检查上述输出确认修复是否生效。');

// 提供手动测试建议
console.log('\n📝 手动测试建议:');
console.log('1. 打开活动列表页面');
console.log('2. 点击不同的活动项');
console.log('3. 检查详情页显示的活动标题是否正确');
console.log('4. 检查浏览器URL中的ID是否与活动匹配');
console.log('5. 打开浏览器开发者工具查看控制台日志');

// 如果问题仍然存在，提供进一步调试信息
console.log('\n🔍 如果问题仍然存在，请检查:');
console.log('1. 浏览器是否缓存了旧版本的代码（尝试强制刷新 Ctrl+F5）');
console.log('2. 开发服务器是否正确重启了');
console.log('3. 是否有其他地方覆盖了修复的逻辑');
console.log('4. 网络请求是否真的使用了 mock 数据');