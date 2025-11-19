// 修复localStorage中的活动数据
console.log('🔍 开始检查和修复活动数据...');

try {
    const stored = localStorage.getItem('campus_activities');
    let activities = [];
    
    if (!stored) {
        console.log('❌ 没有找到活动数据，创建新的多样化数据...');
    } else {
        activities = JSON.parse(stored);
        console.log('📊 当前活动数量:', activities.length);
        
        const basketballCount = activities.filter(activity => 
            activity.title && (activity.title.includes('篮球') || activity.title.includes('篮球赛'))
        ).length;
        
        const basketballPercentage = activities.length > 0 ? 
            Math.round((basketballCount / activities.length) * 100) : 0;
            
        console.log('🏀 篮球活动数量:', basketballCount);
        console.log('📈 篮球活动占比:', basketballPercentage + '%');
        
        if (basketballPercentage <= 80) {
            console.log('✅ 数据状态正常，无需修复');
            process.exit(0);
        }
        
        console.log('⚠️ 检测到数据异常，开始修复...');
    }
    
    // 正确的多样化活动数据
    const correctActivities = [
        {
            id: 1,
            title: '中医养生讲座',
            type: '学术讲座',
            category: 'study',
            description: '邀请著名中医专家讲解传统养生知识，包括四季养生、食疗养生、运动养生等内容。现场还有免费中医体质检测服务。',
            locationName: '学术报告厅',
            location: {
                name: '学术报告厅',
                address: '广东药科大学云浮校区学术报告厅'
            },
            startTime: '2024-12-20T14:00:00',
            endTime: '2024-12-20T16:30:00',
            registrationDeadline: '2024-12-19T23:59:59',
            currentParticipants: 156,
            maxParticipants: 200,
            organizer: {
                id: 1,
                name: '中医学院',
                avatar: '',
                role: '组织者',
                creditScore: 98
            },
            status: 'open',
            isEnrolled: false,
            distance: 0.3,
            tags: ['健康', '养生', '中医', '讲座']
        },
        {
            id: 2,
            title: '摄影作品展览',
            type: '文化艺术',
            category: 'culture',
            description: '展示我校摄影爱好者的优秀作品，包括校园风光、人物肖像、纪实摄影等多类别。开幕式将有专业摄影师现场分享拍摄技巧。',
            locationName: '艺术展览中心',
            location: {
                name: '艺术展览中心',
                address: '广东药科大学云浮校区艺术展览中心'
            },
            startTime: '2024-12-21T10:00:00',
            endTime: '2024-12-25T18:00:00',
            registrationDeadline: '2024-12-20T23:59:59',
            currentParticipants: 234,
            maxParticipants: 500,
            organizer: {
                id: 2,
                name: '摄影协会',
                avatar: '',
                role: '组织者',
                creditScore: 95
            },
            status: 'open',
            isEnrolled: false,
            distance: 0.5,
            tags: ['摄影', '艺术', '展览', '文化']
        },
        {
            id: 3,
            title: '编程马拉松大赛',
            type: '科技创新',
            category: 'tech',
            description: '48小时编程挑战赛，主题为"智慧校园"。参赛者需要在规定时间内完成创新项目开发，优胜团队将获得丰厚奖品和实习机会。',
            locationName: '创新实验室',
            location: {
                name: '创新实验室',
                address: '广东药科大学云浮校区创新实验室'
            },
            startTime: '2024-12-22T09:00:00',
            endTime: '2024-12-24T09:00:00',
            registrationDeadline: '2024-12-21T23:59:59',
            currentParticipants: 87,
            maxParticipants: 100,
            organizer: {
                id: 3,
                name: '计算机学院',
                avatar: '',
                role: '组织者',
                creditScore: 96
            },
            status: 'open',
            isEnrolled: false,
            distance: 1.2,
            tags: ['编程', '创新', '比赛', '技术']
        },
        {
            id: 4,
            title: '篮球友谊赛',
            type: '体育竞技',
            category: 'sports',
            description: '院系间篮球友谊赛，促进各院系交流。比赛采用国际篮联规则，设有MVP奖项和最佳团队奖。',
            locationName: '体育馆',
            location: {
                name: '体育馆',
                address: '广东药科大学云浮校区体育馆'
            },
            startTime: '2024-12-23T16:00:00',
            endTime: '2024-12-23T18:00:00',
            registrationDeadline: '2024-12-22T23:59:59',
            currentParticipants: 178,
            maxParticipants: 200,
            organizer: {
                id: 4,
                name: '体育部',
                avatar: '',
                role: '组织者',
                creditScore: 94
            },
            status: 'open',
            isEnrolled: false,
            distance: 0.8,
            tags: ['篮球', '体育', '比赛', '友谊赛']
        },
        {
            id: 5,
            title: '校园音乐节',
            type: '文艺演出',
            category: 'culture',
            description: '年度校园音乐盛典，邀请校内知名乐队和校外专业音乐人同台演出。涵盖摇滚、民谣、流行等多种音乐风格。',
            locationName: '大学生活动中心',
            location: {
                name: '大学生活动中心',
                address: '广东药科大学云浮校区大学生活动中心'
            },
            startTime: '2024-12-24T19:00:00',
            endTime: '2024-12-24T22:30:00',
            registrationDeadline: '2024-12-23T23:59:59',
            currentParticipants: 856,
            maxParticipants: 1000,
            organizer: {
                id: 5,
                name: '学生会文艺部',
                avatar: '',
                role: '组织者',
                creditScore: 92
            },
            status: 'open',
            isEnrolled: false,
            distance: 0.6,
            tags: ['音乐', '演出', '文艺', '音乐节']
        },
        {
            id: 6,
            title: '图书馆学习小组',
            type: '学习交流',
            category: 'study',
            description: '为期一周的集中学习活动，提供安静的学习环境和专业的学习指导。每日有不同学科的老师现场答疑。',
            locationName: '图书馆研讨室',
            location: {
                name: '图书馆研讨室',
                address: '广东药科大学云浮校区图书馆研讨室'
            },
            startTime: '2024-12-19T09:00:00',
            endTime: '2024-12-25T21:00:00',
            registrationDeadline: '2024-12-18T23:59:59',
            currentParticipants: 42,
            maxParticipants: 50,
            organizer: {
                id: 6,
                name: '图书馆',
                avatar: '',
                role: '组织者',
                creditScore: 99
            },
            status: 'open',
            isEnrolled: false,
            distance: 0.4,
            tags: ['学习', '图书馆', '研讨', '交流']
        }
    ];
    
    localStorage.setItem('campus_activities', JSON.stringify(correctActivities));
    console.log('✅ 已修复活动数据，现在有', correctActivities.length, '个多样化活动');
    
    console.log('📋 修复后的活动列表:');
    correctActivities.forEach((activity, index) => {
        console.log('  ', index + 1 + '.', activity.title, '-', activity.type);
    });
    
    console.log('🎉 修复完成！请刷新页面查看效果');
    
} catch (error) {
    console.error('❌ 修复数据时出错:', error);
}