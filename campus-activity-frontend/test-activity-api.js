// 测试活动创建和列表获取
import { createActivity, getActivityList } from '../src/api/activity.js';

async function testActivityFlow() {
    console.log('=== 开始测试活动创建和列表获取流程 ===');
    
    try {
        // 1. 获取当前活动列表
        console.log('\n1. 获取当前活动列表...');
        const initialList = await getActivityList();
        console.log('初始活动数量:', initialList.data?.list?.length || 0);
        
        // 2. 创建新活动
        console.log('\n2. 创建新活动...');
        const newActivityData = {
            title: '测试活动_' + Date.now(),
            description: '这是一个测试活动，用于验证创建功能',
            startTime: '2024-12-25T10:00',
            endTime: '2024-12-25T12:00',
            locationName: '测试地点',
            maxParticipants: 10,
            tags: ['测试', '活动'],
            coverImage: '',
            status: 'recruiting'
        };
        
        console.log('活动数据:', newActivityData);
        const createResult = await createActivity(newActivityData);
        console.log('创建结果:', createResult);
        
        // 3. 再次获取活动列表
        console.log('\n3. 再次获取活动列表...');
        const updatedList = await getActivityList();
        console.log('更新后活动数量:', updatedList.data?.list?.length || 0);
        
        // 4. 验证新活动是否在列表中
        const newActivity = updatedList.data?.list?.find(a => a.title === newActivityData.title);
        if (newActivity) {
            console.log('✅ 成功！新创建的活动已出现在列表中');
            console.log('新活动详情:', newActivity);
        } else {
            console.log('❌ 失败！新创建的活动未在列表中找到');
        }
        
        // 5. 显示所有活动
        console.log('\n4. 当前所有活动:');
        updatedList.data?.list?.forEach((activity, index) => {
            console.log(`${index + 1}. ${activity.title} (ID: ${activity.id}) - ${activity.locationName || activity.location || '无地点'}`);
        });
        
    } catch (error) {
        console.error('测试过程中出现错误:', error);
    }
    
    console.log('\n=== 测试完成 ===');
}

// 如果在Node.js环境中运行
if (typeof module !== 'undefined' && module.exports) {
    module.exports = testActivityFlow;
}

// 如果在浏览器环境中运行
if (typeof window !== 'undefined') {
    window.testActivityFlow = testActivityFlow;
    console.log('测试函数已加载，请在控制台中运行: testActivityFlow()');
}