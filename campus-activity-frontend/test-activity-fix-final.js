// 测试活动数据修复效果
console.log('🔍 开始测试活动数据修复效果...');

// 检查localStorage中的活动数据
function checkActivitiesData() {
    try {
        const activities = JSON.parse(localStorage.getItem('campus_activities') || '[]');
        console.log('📊 localStorage中的活动数据:', activities);
        console.log('📊 活动数量:', activities.length);
        
        if (activities.length > 0) {
            console.log('📋 活动列表:');
            activities.forEach((activity, index) => {
                console.log(`  ${index + 1}. ${activity.title} (${activity.type}) - ${activity.locationName}`);
            });
            
            // 检查是否全是同一个活动
            const titles = activities.map(a => a.title);
            const uniqueTitles = [...new Set(titles)];
            console.log('🔍 唯一标题数量:', uniqueTitles.length);
            console.log('🔍 唯一标题:', uniqueTitles);
            
            if (uniqueTitles.length === 1) {
                console.warn('⚠️ 警告: 所有活动都是同一个标题:', uniqueTitles[0]);
                return false;
            } else {
                console.log('✅ 活动数据正常，包含多种不同的活动');
                return true;
            }
        } else {
            console.warn('⚠️ 没有找到活动数据');
            return false;
        }
    } catch (error) {
        console.error('❌ 检查活动数据失败:', error);
        return false;
    }
}

// 清理并重置活动数据
function resetActivitiesData() {
    console.log('🔄 开始重置活动数据...');
    
    try {
        // 清理现有的活动数据
        localStorage.removeItem('campus_activities');
        console.log('🗑️ 已清理现有的活动数据');
        
        // 生成正确的默认活动数据
        const defaultOrganizerId = 1;
        const defaultActivities = [
            {
                id: 1,
                title: '中医养生讲座',
                type: 'study',
                category: 'study',
                locationName: '学术报告厅',
                location: {
                    name: '学术报告厅',
                    address: '学校学术报告厅'
                },
                description: '邀请中医专家讲解中医养生知识，分享传统保健方法。',
                startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
                registrationDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000).toISOString(),
                enrollStartTime: new Date().toISOString(),
                enrollEndTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000).toISOString(),
                currentParticipants: 15,
                maxParticipants: 30,
                organizer: {
                    id: defaultOrganizerId + 1,
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
                id: 2,
                title: '摄影作品展览',
                type: 'culture',
                category: 'culture',
                locationName: '艺术展厅',
                location: {
                    name: '艺术展厅',
                    address: '学校艺术展厅'
                },
                description: '展示学生摄影作品，分享摄影技巧，交流创作心得。',
                startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
                registrationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000).toISOString(),
                enrollStartTime: new Date().toISOString(),
                enrollEndTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000).toISOString(),
                currentParticipants: 12,
                maxParticipants: 25,
                organizer: {
                    id: defaultOrganizerId + 2,
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
                id: 3,
                title: '编程马拉松大赛',
                type: 'tech',
                category: 'tech',
                locationName: '创新实验室',
                location: {
                    name: '创新实验室',
                    address: '学校创新实验室'
                },
                description: '24小时编程挑战赛，主题为智慧校园，展示编程技能。',
                startTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                registrationDeadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
                enrollStartTime: new Date().toISOString(),
                enrollEndTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
                currentParticipants: 8,
                maxParticipants: 20,
                organizer: {
                    id: defaultOrganizerId + 3,
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
                id: 4,
                title: '音乐节',
                type: 'culture',
                category: 'culture',
                locationName: '露天剧场',
                location: {
                    name: '露天剧场',
                    address: '学校露天剧场'
                },
                description: '年度校园音乐节，邀请校内外乐队演出，享受音乐盛宴。',
                startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
                registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
                enrollStartTime: new Date().toISOString(),
                enrollEndTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
                currentParticipants: 25,
                maxParticipants: 40,
                organizer: {
                    id: defaultOrganizerId + 4,
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
            },
            {
                id: 5,
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
                    id: defaultOrganizerId,
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
            }
        ];
        
        // 保存到localStorage
        localStorage.setItem('campus_activities', JSON.stringify(defaultActivities));
        console.log('✅ 已保存正确的活动数据到localStorage');
        console.log('📋 保存的活动列表:');
        defaultActivities.forEach((activity, index) => {
            console.log(`  ${index + 1}. ${activity.title} (${activity.type}) - ${activity.locationName}`);
        });
        
        return true;
    } catch (error) {
        console.error('❌ 重置活动数据失败:', error);
        return false;
    }
}

// 执行测试
console.log('\n=== 检查当前活动数据 ===');
const isDataValid = checkActivitiesData();

if (!isDataValid) {
    console.log('\n=== 重置活动数据 ===');
    const resetSuccess = resetActivitiesData();
    
    if (resetSuccess) {
        console.log('\n=== 验证修复效果 ===');
        checkActivitiesData();
    }
}

console.log('\n🎉 测试完成！');