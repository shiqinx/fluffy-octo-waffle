// 检查和修复活动数据的脚本
import fs from 'fs';
import path from 'path';

// 模拟localStorage操作
const mockLocalStorage = {
  data: {},
  getItem: function(key) {
    return this.data[key] || null;
  },
  setItem: function(key, value) {
    this.data[key] = value;
  },
  removeItem: function(key) {
    delete this.data[key];
  }
};

// 创建测试活动数据
function createTestActivities() {
  const activities = [
    {
      id: 1,
      title: '篮球友谊赛',
      category: 'sports',
      description: '周末篮球友谊赛，欢迎所有篮球爱好者参加，一起享受运动的快乐！',
      status: 'recruiting',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString(),
      enrollStartTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      enrollEndTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      location: {
        name: '学校篮球场',
        address: '广东药科大学云浮校区篮球场'
      },
      coords: [22.9149, 112.0441],
      organizer: {
        id: 1,
        name: '张三',
        avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEOURBREIiLz4KPHBhdGggZD0iTTIwIDIyQzIzLjMxMzcgMjIgMjYgMTkuMzEzNyAyNiAxNkMyNiAxMi42ODYzIDIzLjMxMzcgMTAgMjAgMTBDMTYuNjg2MyAxMCAxNCAxMi42ODYzIDE0IDE2QzE0IDE5LjMxMzcgMTYuNjg2MyAyMiAyMCAyMloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yOCAzMEMyOCAyNy43OTAyIDI2LjIwOTggMjYgMjQgMjZIMTZDMTMuNzkwMiAyNiAxMiAyNy43OTAyIDEyIDMwVjMxQzEyIDMxLjU1MjMgMTIuNDQ3NyAzMiAxMyAzMkgyN0MyNy41NTIzIDMyIDI4IDMxLjU1MjMgMjggMzFWMzBaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
        role: '组织者',
        creditScore: 95
      },
      currentParticipants: 8,
      maxParticipants: 10,
      participants: [
        {
          id: 1,
          userId: 1,
          name: '孙金瑶',
          avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEOURBREIiLz4KPHBhdGggZD0iTTIwIDIyQzIzLjMxMzcgMjIgMjYgMTkuMzEzNyAyNiAxNkMyNiAxMi42ODYzIDIzLjMxMzcgMTAgMjAgMTBDMTYuNjg2MyAxMCAxNCAxMi42ODYzIDE0IDE2QzE0IDE5LjMxMzcgMTYuNjg2MyAyMiAyMCAyMloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yOCAzMEMyOCAyNy43OTAyIDI2LjIwOTggMjYgMjQgMjZIMTZDMTMuNzkwMiAyNiAxMiAyNy43OTAyIDEyIDMwVjMxQzEyIDMxLjU1MjMgMTIuNDQ3NyAzMiAxMyAzMkgyN0MyNy41NTIzIDMyIDI4IDMxLjU1MjMgMjggMzFWMzBaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
          creditScore: 88,
          checkedIn: true,
          status: 'approved'
        }
      ],
      enrollments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      title: '中医养生讲座',
      category: 'lecture',
      description: '邀请中医专家讲解中医养生知识，了解传统中医文化，学习健康养生方法。',
      status: 'recruiting',
      startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      enrollStartTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      enrollEndTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      location: {
        name: '教学楼A101',
        address: '广东药科大学云浮校区教学楼A101'
      },
      coords: [22.9150, 112.0442],
      organizer: {
        id: 1,
        name: '张三',
        avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEOURBREIiLz4KPHBhdGggZD0iTTIwIDIyQzIzLjMxMzcgMjIgMjYgMTkuMzEzNyAyNiAxNkMyNiAxMi42ODYzIDIzLjMxMzcgMTAgMjAgMTBDMTYuNjg2MyAxMCAxNCAxMi42ODYzIDE0IDE2QzE0IDE5LjMxMzcgMTYuNjg2MyAyMiAyMCAyMloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yOCAzMEMyOCAyNy43OTAyIDI2LjIwOTggMjYgMjQgMjZIMTZDMTMuNzkwMiAyNiAxMiAyNy43OTAyIDEyIDMwVjMxQzEyIDMxLjU1MjMgMTIuNDQ3NyAzMiAxMyAzMkgyN0MyNy41NTIzIDMyIDI4IDMxLjU1MjIgMjggMzFWMzBaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
        role: '组织者',
        creditScore: 95
      },
      currentParticipants: 25,
      maxParticipants: 50,
      participants: [],
      enrollments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  return activities;
}

// 测试活动详情获取逻辑
function testActivityDetail(activityId) {
  console.log(`测试获取活动详情，ID: ${activityId}`);
  
  // 优先从localStorage获取
  let activity = null;
  try {
    const storedActivities = mockLocalStorage.getItem('campus_activities');
    if (storedActivities) {
      const activities = JSON.parse(storedActivities);
      activity = activities.find(act => act.id == activityId);
      console.log('从localStorage获取活动详情:', activity);
    }
  } catch (error) {
    console.warn('从localStorage读取活动数据失败:', error);
  }
  
  if (activity) {
    console.log('✅ 成功找到活动:', activity.title);
    return activity;
  } else {
    console.log('❌ 未找到活动');
    return null;
  }
}

// 运行测试
console.log('=== 活动详情数据调试 ===');

// 1. 创建测试数据
console.log('\n1. 创建测试数据...');
const testActivities = createTestActivities();
mockLocalStorage.setItem('campus_activities', JSON.stringify(testActivities));
console.log(`已创建 ${testActivities.length} 个测试活动`);

// 2. 测试获取活动详情
console.log('\n2. 测试获取活动详情...');
const activity1 = testActivityDetail(1);
const activity2 = testActivityDetail(2);
const activity3 = testActivityDetail(3);

// 3. 检查数据完整性
console.log('\n3. 检查数据完整性...');
if (activity1) {
  console.log('活动1数据完整性检查:');
  console.log('- 标题:', activity1.title);
  console.log('- 描述:', activity1.description);
  console.log('- 地点:', activity1.location?.name);
  console.log('- 组织者:', activity1.organizer?.name);
  console.log('- 参与者数量:', activity1.participants?.length || 0);
}

console.log('\n=== 调试完成 ===');