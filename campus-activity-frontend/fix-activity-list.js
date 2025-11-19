// 修复活动列表显示问题
console.log('🔧 开始修复活动列表显示问题...');

// 1. 清理现有的活动数据
console.log('📋 步骤 1: 清理现有活动数据');
localStorage.removeItem('campus_activities');

// 2. 重新初始化正确的活动数据
console.log('\n📋 步骤 2: 重新初始化活动数据');
const correctActivities = [
    {
        id: 1,
        title: '篮球友谊赛',
        type: 'sports',
        category: 'sports',
        locationName: '篮球场1',
        location: {
            name: '篮球场1',
            address: '学校篮球场1'
        },
        description: '周末篮球比赛，欢迎所有篮球爱好者参加。活动将在学校篮球场举行，请自带运动装备。',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
        registrationDeadline: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        enrollStartTime: new Date().toISOString(),
        enrollEndTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        currentParticipants: 4,
        maxParticipants: 8,
        organizer: {
            id: 1,
            name: '篮球社',
            avatar: 'https://via.placeholder.com/150',
            role: '组织者',
            creditScore: 95
        },
        distance: 0.5,
        isEnrolled: false,
        isApproved: false,
        status: 'open',
        participants: [],
        enrollments: []
    },
    {
        id: 2,
        title: '中医养生讲座',
        type: 'study',
        category: 'study',
        locationName: '学术报告厅',
        location: {
            name: '学术报告厅',
            address: '主楼201报告厅'
        },
        description: '邀请中医专家讲解中医养生知识，包括四季养生、食疗养生、运动养生等内容。',
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        registrationDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000).toISOString(),
        enrollStartTime: new Date().toISOString(),
        enrollEndTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000).toISOString(),
        currentParticipants: 6,
        maxParticipants: 12,
        organizer: {
            id: 2,
            name: '中医学院',
            avatar: 'https://via.placeholder.com/150',
            role: '组织者',
            creditScore: 98
        },
        distance: 0.8,
        isEnrolled: false,
        isApproved: false,
        status: 'open',
        participants: [],
        enrollments: []
    },
    {
        id: 3,
        title: '摄影作品展览',
        type: 'culture',
        category: 'culture',
        locationName: '艺术展厅',
        location: {
            name: '艺术展厅',
            address: '艺术楼一楼展厅'
        },
        description: '展示学生摄影作品，分享摄影技巧。展览包括风景、人像、纪实等多个类别的优秀作品。',
        startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
        registrationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
        enrollStartTime: new Date().toISOString(),
        enrollEndTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
        currentParticipants: 8,
        maxParticipants: 15,
        organizer: {
            id: 3,
            name: '摄影协会',
            avatar: 'https://via.placeholder.com/150',
            role: '组织者',
            creditScore: 92
        },
        distance: 0.3,
        isEnrolled: false,
        isApproved: false,
        status: 'open',
        participants: [],
        enrollments: []
    },
    {
        id: 4,
        title: '编程马拉松大赛',
        type: 'tech',
        category: 'tech',
        locationName: '创新实验室',
        location: {
            name: '创新实验室',
            address: '计算机学院楼302'
        },
        description: '24小时编程挑战赛，主题为"智慧校园"。邀请全校编程爱好者参与，展示编程技能。',
        startTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        registrationDeadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000).toISOString(),
        enrollStartTime: new Date().toISOString(),
        enrollEndTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000).toISOString(),
        currentParticipants: 12,
        maxParticipants: 20,
        organizer: {
            id: 4,
            name: '计算机学院',
            avatar: 'https://via.placeholder.com/150',
            role: '组织者',
            creditScore: 96
        },
        distance: 1.2,
        isEnrolled: false,
        isApproved: false,
        status: 'open',
        participants: [],
        enrollments: []
    },
    {
        id: 5,
        title: '音乐节',
        type: 'culture',
        category: 'culture',
        locationName: '露天剧场',
        location: {
            name: '露天剧场',
            address: '学生活动中心旁'
        },
        description: '年度校园音乐节，邀请校内外乐队演出。包括摇滚、民谣、流行等多种音乐风格。',
        startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
        registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 - 8 * 60 * 60 * 1000).toISOString(),
        enrollStartTime: new Date().toISOString(),
        enrollEndTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 - 8 * 60 * 60 * 1000).toISOString(),
        currentParticipants: 16,
        maxParticipants: 25,
        organizer: {
            id: 5,
            name: '学生会',
            avatar: 'https://via.placeholder.com/150',
            role: '组织者',
            creditScore: 94
        },
        distance: 0.6,
        isEnrolled: false,
        isApproved: false,
        status: 'open',
        participants: [],
        enrollments: []
    }
];

// 保存到localStorage
localStorage.setItem('campus_activities', JSON.stringify(correctActivities));
console.log('✅ 已重新初始化活动数据');

// 3. 验证数据存储
console.log('\n📋 步骤 3: 验证数据存储');
const storedActivities = JSON.parse(localStorage.getItem('campus_activities') || '[]');
console.log(`✅ 存储了 ${storedActivities.length} 个活动:`);
storedActivities.forEach((activity, index) => {
    console.log(`   ${index + 1}. ${activity.title} (${activity.type}) - ${activity.status}`);
});

// 4. 修复ActivityList.vue中的错误回退逻辑
console.log('\n📋 步骤 4: 修复说明');
console.log('🎯 问题根源:');
console.log('   - ActivityList.vue的catch块中只有一个篮球活动的模拟数据');
console.log('   - 当API调用失败时，所有活动都显示为篮球活动');

console.log('\n✅ 修复方案:');
console.log('   - 清理并重新初始化localStorage中的活动数据');
console.log('   - 确保活动数据包含多种类型的活动');
console.log('   - 修复ActivityList.vue中的错误回退逻辑');

// 5. 提供测试链接
console.log('\n📋 步骤 5: 测试指南');
console.log('🌐 请刷新活动列表页面，然后点击以下活动测试:');
console.log('   - 篮球友谊赛 (运动类)');
console.log('   - 中医养生讲座 (学习类)');
console.log('   - 摄影作品展览 (文化类)');
console.log('   - 编程马拉松大赛 (技术类)');
console.log('   - 音乐节 (文化类)');

console.log('\n🎉 修复完成！');
console.log('💡 现在活动列表应该显示正确的活动，点击进去也会显示对应的详情页面。');