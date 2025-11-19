// 修复活动列表显示问题
console.log('🔧 开始修复活动列表显示问题...');

// 清理并重新初始化活动数据
const activities = [
    {
        id: 1,
        title: '篮球友谊赛',
        type: 'sports',
        category: 'sports',
        locationName: '篮球场1',
        location: { name: '篮球场1', address: '篮球场1' },
        description: '周末篮球比赛，欢迎所有篮球爱好者参加',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        registrationDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000).toISOString(),
        enrollStartTime: new Date().toISOString(),
        enrollEndTime: new Date(Date.now() + 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000).toISOString(),
        currentParticipants: 8,
        maxParticipants: 20,
        organizer: { id: 1, name: '篮球社', avatar: 'https://via.placeholder.com/150', role: '组织者', creditScore: 95 },
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
        location: { name: '学术报告厅', address: '学术报告厅' },
        description: '邀请中医专家讲解中医养生知识',
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        registrationDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000).toISOString(),
        enrollStartTime: new Date().toISOString(),
        enrollEndTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000).toISOString(),
        currentParticipants: 15,
        maxParticipants: 30,
        organizer: { id: 2, name: '中医学院', avatar: 'https://via.placeholder.com/150', role: '组织者', creditScore: 98 },
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
        location: { name: '艺术展厅', address: '艺术展厅' },
        description: '展示学生摄影作品，分享摄影技巧',
        startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
        registrationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000).toISOString(),
        enrollStartTime: new Date().toISOString(),
        enrollEndTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000).toISOString(),
        currentParticipants: 12,
        maxParticipants: 25,
        organizer: { id: 3, name: '摄影协会', avatar: 'https://via.placeholder.com/150', role: '组织者', creditScore: 92 },
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
        location: { name: '创新实验室', address: '创新实验室' },
        description: '24小时编程挑战赛，主题为智慧校园',
        startTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        registrationDeadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
        enrollStartTime: new Date().toISOString(),
        enrollEndTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
        currentParticipants: 8,
        maxParticipants: 20,
        organizer: { id: 4, name: '计算机学院', avatar: 'https://via.placeholder.com/150', role: '组织者', creditScore: 96 },
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
        location: { name: '露天剧场', address: '露天剧场' },
        description: '年度校园音乐节，邀请校内外乐队演出',
        startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
        registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
        enrollStartTime: new Date().toISOString(),
        enrollEndTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
        currentParticipants: 25,
        maxParticipants: 40,
        organizer: { id: 5, name: '学生会', avatar: 'https://via.placeholder.com/150', role: '组织者', creditScore: 94 },
        distance: 0.6,
        isEnrolled: false,
        isApproved: false,
        status: 'open',
        participants: [],
        enrollments: []
    }
];

console.log('📊 重新初始化5个不同类型的活动数据:');
activities.forEach((activity, index) => {
    console.log(`  ${index + 1}. ${activity.title} (${activity.type})`);
});

// 在浏览器环境中执行
if (typeof window !== 'undefined') {
    // 清理现有数据
    localStorage.removeItem('campus_activities');
    
    // 保存新的活动数据
    localStorage.setItem('campus_activities', JSON.stringify(activities));
    
    console.log('\n✅ 浏览器环境修复完成！');
    console.log('📋 localStorage中的活动数据已更新');
} else {
    console.log('\n✅ Node.js环境脚本执行完成');
    console.log('📋 请在浏览器控制台中运行此脚本来更新localStorage');
}

console.log('\n🧪 测试建议:');
console.log('  1. 访问 http://localhost:3000/activities 查看活动列表');
console.log('  2. 点击不同的活动，验证详情页面显示正确内容');
console.log('  3. 确认不再出现"全是英语角"的问题');
console.log('\n🎯 修复内容:');
console.log('  • 修复了ActivityList.vue中的错误回退逻辑');
console.log('  • 增加了5种不同类型的活动数据');
console.log('  • 清理并重新初始化了localStorage数据');
console.log('  • 确保活动详情页面显示正确的内容');