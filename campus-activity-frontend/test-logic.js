// 测试数据生成逻辑
const mockActivities = [
    { id: 1, title: '篮球友谊赛', organizer: { id: 1, name: '篮球社' } },
    { id: 2, title: '图书馆学习小组', organizer: { id: 2, name: '学习部' } },
    { id: 3, title: '实验技能培训', organizer: { id: 3, name: '实验中心' } },
    { id: 4, title: '网球友谊赛', organizer: { id: 4, name: '网球社' } },
    { id: 5, title: '编程马拉松', organizer: { id: 5, name: '编程协会' } },
    { id: 6, title: '中医养生讲座', organizer: { id: 6, name: '中医学院' } },
    { id: 7, title: '宿舍联谊活动', organizer: { id: 7, name: '学生会' } },
    { id: 8, title: '晨跑俱乐部', organizer: { id: 8, name: '跑步协会' } }
];

function getPersonalizedActivities(currentUserId, currentUserName) {
    return mockActivities.map((activity, index) => {
        const userSeed = currentUserId ? currentUserId.toString().charCodeAt(0) : 1;
        const activitySeed = index + 1;
        
        const isEnrolled = (userSeed + activitySeed) % 3 === 0;
        const isFavorite = (userSeed + activitySeed * 2) % 5 === 0 || (userSeed + activitySeed) % 7 === 0;
        const isApproved = isEnrolled && (userSeed + activitySeed * 3) % 2 === 0;
        
        console.log(`用户${currentUserId}的活动${activity.id}: isEnrolled=${isEnrolled}, isFavorite=${isFavorite}, isApproved=${isApproved}`);
        
        return {
            ...activity,
            isEnrolled,
            isFavorite,
            isApproved,
            organizerId: activity.organizer.id
        };
    });
}

function testUserData(userId) {
    console.log(`\n=== 测试用户${userId} ===`);
    const activities = getPersonalizedActivities(userId, `用户${userId}`);
    const created = activities.filter(a => a.organizerId == userId);
    const enrolled = activities.filter(a => a.isEnrolled && a.organizerId != userId);
    const favorites = activities.filter(a => a.isFavorite && a.organizerId != userId);
    
    console.log('我发布的:', created.map(a => a.title));
    console.log('我报名的:', enrolled.map(a => a.title));
    console.log('我收藏的:', favorites.map(a => a.title));
    
    return {
        userId,
        created: created.length,
        enrolled: enrolled.length,
        favorites: favorites.length
    };
}

// 测试用户1
testUserData('1');
testUserData('2');
testUserData('3');