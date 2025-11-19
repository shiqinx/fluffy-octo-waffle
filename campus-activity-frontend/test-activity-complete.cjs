// 测试活动创建和显示功能的完整流程
const fs = require('fs');
const path = require('path');

console.log('🚀 开始测试活动创建和显示功能...\n');

// 模拟localStorage
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
  },
  clear: function() {
    this.data = {};
  }
};

// 模拟activityStore的核心方法
const mockActivityStore = {
  activities: [],
  
  // 模拟 loadActivitiesFromStorage
  loadActivitiesFromStorage() {
    try {
      const stored = mockLocalStorage.getItem('campus_activities');
      if (stored) {
        const activities = JSON.parse(stored);
        console.log('🔄 从localStorage加载活动:', activities.length, '个');
        return activities;
      }
    } catch (error) {
      console.error('从localStorage加载活动失败:', error);
    }
    
    // 返回默认活动数据
    return [
      {
        id: 1,
        title: '周末篮球友谊赛',
        type: 'sports',
        category: 'sports',
        locationName: '篮球场1',
        location: {
          name: '篮球场1',
          address: '学校篮球场1'
        },
        description: '周末篮球比赛，欢迎所有篮球爱好者参加',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
        registrationDeadline: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        currentParticipants: 4,
        maxParticipants: 8,
        organizer: {
          id: 1,
          name: '篮球社',
          avatar: ''
        },
        distance: 0.5,
        isEnrolled: false,
        isApproved: false,
        status: 'open',
        participants: [],
        enrollments: [],
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
      }
    ];
  },
  
  // 模拟 saveActivitiesToStorage
  saveActivitiesToStorage(activities) {
    try {
      mockLocalStorage.setItem('campus_activities', JSON.stringify(activities));
      console.log('✅ 活动数据已保存到localStorage');
      return true;
    } catch (error) {
      console.error('❌ 保存活动数据失败:', error);
      return false;
    }
  },
  
  // 模拟 loadActivities
  async loadActivities() {
    console.log('🔄 模拟 activityStore.loadActivities()');
    this.activities = this.loadActivitiesFromStorage();
    console.log('✅ 活动数据加载完成，当前活动数量:', this.activities.length);
    return this.activities;
  },
  
  // 模拟 createNewActivity
  async createNewActivity(activityData) {
    try {
      console.log('🔄 模拟创建活动:', activityData.title);
      
      const newActivity = {
        ...activityData,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      
      // 添加到本地活动列表开头
      this.activities.unshift(newActivity);
      
      // 保存到localStorage
      this.saveActivitiesToStorage(this.activities);
      
      console.log('✅ 活动创建成功:', newActivity.title);
      return newActivity;
    } catch (error) {
      console.error('❌ 创建活动失败:', error);
      throw error;
    }
  }
};

// 测试步骤
async function runTest() {
  try {
    console.log('📋 步骤1: 清理localStorage，模拟应用首次启动');
    mockLocalStorage.clear();
    mockActivityStore.activities = [];
    
    console.log('\n📋 步骤2: 模拟ActivityList.vue页面加载，调用loadData()');
    await mockActivityStore.loadActivities();
    console.log('当前活动列表:');
    mockActivityStore.activities.forEach((activity, index) => {
      console.log(`  ${index + 1}. ${activity.title} (创建时间: ${new Date(activity.createdAt).toLocaleString()})`);
    });
    
    console.log('\n📋 步骤3: 模拟CreateActivity.vue创建新活动');
    const newActivityData = {
      title: '新创建的测试活动 - ' + new Date().toLocaleTimeString(),
      type: 'sports',
      category: 'sports',
      locationName: '测试地点',
      location: {
        name: '测试地点',
        address: '测试地址'
      },
      description: '这是新创建的测试活动',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
      registrationDeadline: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      currentParticipants: 1,
      maxParticipants: 20,
      organizer: {
        id: 1,
        name: '测试组织者',
        avatar: ''
      },
      distance: 0.5,
      isEnrolled: false,
      isApproved: false,
      status: 'open',
      participants: [],
      enrollments: []
    };
    
    const createdActivity = await mockActivityStore.createNewActivity(newActivityData);
    console.log('创建的活动:', createdActivity.title);
    
    console.log('\n📋 步骤4: 模拟返回ActivityList.vue页面，重新加载数据');
    await mockActivityStore.loadActivities();
    console.log('更新后的活动列表:');
    mockActivityStore.activities.forEach((activity, index) => {
      const isNew = activity.id === createdActivity.id;
      console.log(`  ${index + 1}. ${activity.title} ${isNew ? '🆕' : ''} (创建时间: ${new Date(activity.createdAt).toLocaleString()})`);
    });
    
    console.log('\n📋 步骤5: 验证新活动是否在列表顶部');
    const firstActivity = mockActivityStore.activities[0];
    if (firstActivity.id === createdActivity.id) {
      console.log('✅ 成功！新创建的活动显示在列表顶部');
    } else {
      console.log('❌ 失败！新创建的活动未显示在列表顶部');
      console.log('期望的活动ID:', createdActivity.id);
      console.log('实际第一个活动ID:', firstActivity.id);
    }
    
    console.log('\n📋 步骤6: 检查localStorage数据一致性');
    const storedData = mockLocalStorage.getItem('campus_activities');
    if (storedData) {
      const parsedActivities = JSON.parse(storedData);
      console.log('localStorage中的活动数量:', parsedActivities.length);
      console.log('localStorage中第一个活动:', parsedActivities[0]?.title);
      
      if (parsedActivities[0]?.id === createdActivity.id) {
        console.log('✅ localStorage数据一致性验证通过');
      } else {
        console.log('❌ localStorage数据一致性验证失败');
      }
    }
    
    console.log('\n🎉 测试完成！');
    
    // 输出最终状态
    console.log('\n📊 最终状态报告:');
    console.log('- 内存中活动数量:', mockActivityStore.activities.length);
    console.log('- localStorage中活动数量:', JSON.parse(mockLocalStorage.getItem('campus_activities') || '[]').length);
    console.log('- 新活动是否在顶部:', mockActivityStore.activities[0]?.id === createdActivity.id ? '是' : '否');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 运行测试
runTest();