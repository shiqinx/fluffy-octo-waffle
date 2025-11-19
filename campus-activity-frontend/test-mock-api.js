// 测试模拟数据API
import { 
    mockLogin, 
    mockGetActivityList, 
    mockCreateActivity,
    mockActivities,
    mockGetUserInfo
} from './src/api/mock.js';

console.log('🧪 开始测试模拟数据API...\n');

async function testMockAPIs() {
    try {
        // 1. 测试登录
        console.log('1️⃣ 测试登录API...');
        const loginResult = await mockLogin({
            studentId: '2330502143',
            password: '123456'
        });
        console.log('✅ 登录成功:', loginResult.data.user.realName);

        // 2. 测试获取用户信息
        console.log('\n2️⃣ 测试获取用户信息API...');
        const userInfoResult = await mockGetUserInfo('mock_token');
        console.log('✅ 获取用户信息成功:', userInfoResult.data.realName);

        // 3. 测试获取活动列表
        console.log('\n3️⃣ 测试获取活动列表API...');
        const activityListResult = await mockGetActivityList();
        console.log('✅ 获取活动列表成功, 共', activityListResult.data.list.length, '个活动');
        
        // 显示活动列表
        activityListResult.data.list.forEach((activity, index) => {
            console.log(`   ${index + 1}. ${activity.title} - ${activity.status}`);
        });

        // 4. 测试创建活动
        console.log('\n4️⃣ 测试创建活动API...');
        const newActivity = {
            title: '测试创建的活动',
            description: '这是一个通过API创建的测试活动',
            startTime: new Date(Date.now() + 86400000).toISOString(),
            endTime: new Date(Date.now() + 86400000 * 2).toISOString(),
            location: '测试地点',
            maxParticipants: 30,
            tags: ['测试', 'API']
        };
        const createResult = await mockCreateActivity(newActivity);
        console.log('✅ 创建活动成功, 活动ID:', createResult.data.id);

        // 5. 再次获取活动列表，验证新创建的活动
        console.log('\n5️⃣ 验证新创建的活动...');
        const updatedListResult = await mockGetActivityList();
        const newActivityInList = updatedListResult.data.list.find(a => a.id === createResult.data.id);
        if (newActivityInList) {
            console.log('✅ 新创建的活动已出现在列表中:', newActivityInList.title);
        } else {
            console.log('❌ 新创建的活动未在列表中找到');
        }

        console.log('\n🎉 所有模拟数据API测试通过！');

    } catch (error) {
        console.error('❌ API测试失败:', error);
    }
}

// 运行测试
testMockAPIs();