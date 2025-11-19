// 活动详情修复脚本
// 专门解决活动详情页面显示"中医养生讲座"的问题

(function() {
    'use strict';
    
    console.log('🔧 活动详情修复脚本已加载');
    
    // 修复活动详情获取函数
    function fixMockGetActivityDetail() {
        // 检查是否已经修复过
        if (window.activityDetailFixed) {
            console.log('✅ 活动详情已经修复过');
            return;
        }
        
        // 获取当前的mockGetActivityDetail函数
        const originalScript = document.querySelector('script[src*="mock.js"]');
        if (!originalScript) {
            console.warn('⚠️ 未找到mock.js脚本');
            return;
        }
        
        // 创建修复后的活动详情获取函数
        window.fixedMockGetActivityDetail = async function(activityId) {
            console.log('🔧 使用修复后的活动详情获取函数，activityId:', activityId);
            
            // 确保activityId是字符串
            activityId = String(activityId);
            
            // 定义正确的活动数据
            const correctActivities = [
                {
                    id: "1",
                    title: "中医养生讲座",
                    type: "学术讲座",
                    category: "study",
                    description: "邀请著名中医专家讲解传统养生知识，包括四季养生、食疗养生、运动养生等内容。现场还有免费中医体质检测服务。",
                    status: "recruiting",
                    startTime: new Date(Date.now() + 86400000 * 2).toISOString(),
                    endTime: new Date(Date.now() + 86400000 * 2 + 10800000).toISOString(),
                    enrollStartTime: new Date(Date.now() + 86400000 * 1).toISOString(),
                    enrollEndTime: new Date(Date.now() + 86400000 * 1.5).toISOString(),
                    location: {
                        name: "学术报告厅",
                        address: "学术报告厅",
                        coords: [116.397428, 39.90923]
                    },
                    organizer: {
                        id: "1",
                        name: "中医学院",
                        avatar: "https://picsum.photos/seed/organizer1/200/200.jpg",
                        role: "学术组织",
                        creditScore: 95
                    },
                    currentParticipants: 156,
                    maxParticipants: 200,
                    enrollments: [],
                    participants: []
                },
                {
                    id: "2",
                    title: "摄影作品展览",
                    type: "文化艺术",
                    category: "culture",
                    description: "展示我校摄影爱好者的优秀作品，包括校园风光、人物肖像、纪实摄影等多类别。开幕式将有专业摄影师现场分享拍摄技巧。",
                    status: "recruiting",
                    startTime: new Date(Date.now() + 86400000 * 3).toISOString(),
                    endTime: new Date(Date.now() + 86400000 * 3 + 28800000).toISOString(),
                    enrollStartTime: new Date(Date.now() + 86400000 * 2).toISOString(),
                    enrollEndTime: new Date(Date.now() + 86400000 * 2.5).toISOString(),
                    location: {
                        name: "艺术展览中心",
                        address: "艺术展览中心",
                        coords: [116.397428, 39.90923]
                    },
                    organizer: {
                        id: "2",
                        name: "摄影协会",
                        avatar: "https://picsum.photos/seed/organizer2/200/200.jpg",
                        role: "文艺组织",
                        creditScore: 88
                    },
                    currentParticipants: 234,
                    maxParticipants: 500,
                    enrollments: [],
                    participants: []
                },
                {
                    id: "3",
                    title: "编程马拉松大赛",
                    type: "科技创新",
                    category: "tech",
                    description: "48小时编程挑战赛，主题为"智慧校园"。参赛者需要在规定时间内完成创新项目开发，优胜团队将获得丰厚奖品和实习机会。",
                    status: "recruiting",
                    startTime: new Date(Date.now() + 86400000 * 4).toISOString(),
                    endTime: new Date(Date.now() + 86400000 * 6).toISOString(),
                    enrollStartTime: new Date(Date.now() + 86400000 * 3).toISOString(),
                    enrollEndTime: new Date(Date.now() + 86400000 * 3.5).toISOString(),
                    location: {
                        name: "创新实验室",
                        address: "创新实验室",
                        coords: [116.397428, 39.90923]
                    },
                    organizer: {
                        id: "3",
                        name: "计算机学院",
                        avatar: "https://picsum.photos/seed/organizer3/200/200.jpg",
                        role: "学术组织",
                        creditScore: 92
                    },
                    currentParticipants: 87,
                    maxParticipants: 100,
                    enrollments: [],
                    participants: []
                },
                {
                    id: "4",
                    title: "篮球友谊赛",
                    type: "体育竞技",
                    category: "sports",
                    description: "院系间篮球友谊赛，促进各院系交流。比赛采用国际篮联规则，设有MVP奖项和最佳团队奖。",
                    status: "recruiting",
                    startTime: new Date(Date.now() + 86400000 * 5).toISOString(),
                    endTime: new Date(Date.now() + 86400000 * 5 + 7200000).toISOString(),
                    enrollStartTime: new Date(Date.now() + 86400000 * 4).toISOString(),
                    enrollEndTime: new Date(Date.now() + 86400000 * 4.5).toISOString(),
                    location: {
                        name: "体育馆",
                        address: "体育馆",
                        coords: [116.397428, 39.90923]
                    },
                    organizer: {
                        id: "4",
                        name: "体育部",
                        avatar: "https://picsum.photos/seed/organizer4/200/200.jpg",
                        role: "体育组织",
                        creditScore: 85
                    },
                    currentParticipants: 178,
                    maxParticipants: 200,
                    enrollments: [],
                    participants: []
                },
                {
                    id: "5",
                    title: "校园音乐节",
                    type: "文艺演出",
                    category: "culture",
                    description: "年度校园音乐盛典，邀请校内知名乐队和校外专业音乐人同台演出。涵盖摇滚、民谣、流行等多种音乐风格。",
                    status: "recruiting",
                    startTime: new Date(Date.now() + 86400000 * 6).toISOString(),
                    endTime: new Date(Date.now() + 86400000 * 6 + 14400000).toISOString(),
                    enrollStartTime: new Date(Date.now() + 86400000 * 5).toISOString(),
                    enrollEndTime: new Date(Date.now() + 86400000 * 5.5).toISOString(),
                    location: {
                        name: "大学生活动中心",
                        address: "大学生活动中心",
                        coords: [116.397428, 39.90923]
                    },
                    organizer: {
                        id: "5",
                        name: "学生会文艺部",
                        avatar: "https://picsum.photos/seed/organizer5/200/200.jpg",
                        role: "文艺组织",
                        creditScore: 90
                    },
                    currentParticipants: 856,
                    maxParticipants: 1000,
                    enrollments: [],
                    participants: []
                },
                {
                    id: "6",
                    title: "图书馆学习小组",
                    type: "学习交流",
                    category: "study",
                    description: "为期一周的集中学习活动，提供安静的学习环境和专业的学习指导。每日有不同学科的老师现场答疑。",
                    status: "recruiting",
                    startTime: new Date(Date.now() + 86400000 * 1).toISOString(),
                    endTime: new Date(Date.now() + 86400000 * 7).toISOString(),
                    enrollStartTime: new Date(Date.now() + 86400000 * 0.5).toISOString(),
                    enrollEndTime: new Date(Date.now() + 86400000 * 0.8).toISOString(),
                    location: {
                        name: "图书馆研讨室",
                        address: "图书馆研讨室",
                        coords: [116.397428, 39.90923]
                    },
                    organizer: {
                        id: "6",
                        name: "图书馆",
                        avatar: "https://picsum.photos/seed/organizer6/200/200.jpg",
                        role: "学术组织",
                        creditScore: 88
                    },
                    currentParticipants: 42,
                    maxParticipants: 50,
                    enrollments: [],
                    participants: []
                }
            ];
            
            // 严格匹配活动ID
            const activity = correctActivities.find(act => String(act.id) === activityId);
            
            if (!activity) {
                console.error('❌ 活动不存在，activityId:', activityId);
                console.log('📋 可用的活动ID:', correctActivities.map(act => act.id));
                throw { success: false, message: '活动不存在' };
            }
            
            console.log('✅ 找到活动:', {
                id: activity.id,
                title: activity.title,
                type: activity.type,
                category: activity.category
            });
            
            // 模拟延迟
            await new Promise(resolve => setTimeout(resolve, 300));
            
            return {
                success: true,
                data: activity,
                message: '获取活动详情成功'
            };
        };
        
        // 标记已修复
        window.activityDetailFixed = true;
        console.log('✅ 活动详情修复函数已创建');
    }
    
    // 修复API调用
    function fixApiCalls() {
        // 拦截并修复API调用
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const [url, options] = args;
            
            // 检查是否是活动详情API调用
            if (typeof url === 'string' && url.includes('/api/activity/detail/')) {
                const activityId = url.split('/').pop();
                console.log('🔧 拦截到活动详情API调用，activityId:', activityId);
                
                // 使用修复后的函数
                return window.fixedMockGetActivityDetail(activityId).then(result => {
                    return new Response(JSON.stringify(result), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }).catch(error => {
                    return new Response(JSON.stringify(error), {
                        status: 404,
                        headers: { 'Content-Type': 'application/json' }
                    });
                });
            }
            
            // 其他API调用正常处理
            return originalFetch.apply(this, args);
        };
        
        console.log('✅ API调用拦截器已设置');
    }
    
    // 清理localStorage中的损坏数据
    function clearCorruptedData() {
        try {
            const stored = localStorage.getItem('campus_activities');
            if (stored) {
                const activities = JSON.parse(stored);
                
                // 检查是否所有活动都是同一个标题
                const titles = activities.map(act => act.title);
                const uniqueTitles = [...new Set(titles)];
                
                if (uniqueTitles.length === 1 && uniqueTitles[0] === '中医养生讲座') {
                    console.log('🗑️ 检测到数据污染，清理localStorage');
                    localStorage.removeItem('campus_activities');
                    console.log('✅ 已清理损坏的localStorage数据');
                }
            }
        } catch (error) {
            console.warn('⚠️ 清理localStorage数据时出错:', error);
        }
    }
    
    // 执行修复
    function runFix() {
        console.log('🚀 开始执行活动详情修复...');
        
        clearCorruptedData();
        fixMockGetActivityDetail();
        fixApiCalls();
        
        console.log('🎉 活动详情修复完成！');
        console.log('💡 现在访问活动详情页面应该显示正确的活动信息');
    }
    
    // 立即执行修复
    runFix();
    
    // 暴露修复函数到全局，方便手动调用
    window.fixActivityDetail = {
        run: runFix,
        clearData: clearCorruptedData,
        getFixedActivity: window.fixedMockGetActivityDetail
    };
    
})();