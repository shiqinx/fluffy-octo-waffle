// 测试活动创建和显示修复的Node.js脚本
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 模拟浏览器环境
global.window = {};
global.localStorage = {
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

// 动态导入模块
async function testFixes() {
    console.log('🚀 开始测试活动创建和显示修复...\n');

    try {
        // 导入必要的模块
        const { globalDataManager } = await import('./src/api/global-data.js');
        const { mockCreateActivity, mockGetActivityList, mockGetActivityDetail } = await import('./src/api/mock.js');
        const { campusBuildings } = await import('./src/config/map.js');

        console.log('✅ 模块导入成功');

        // 1. 测试活动创建
        console.log('\n📝 1. 测试活动创建功能...');
        const testActivityData = {
            title: '测试活动-' + Date.now(),
            category: 'sports',
            description: '这是一个测试活动，用于验证修复后的功能',
            startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
            location: {
                name: '篮球场1',
                address: '广东药科大学云浮校区篮球场1'
            },
            coords: campusBuildings.basketballCourt1.coords,
            maxParticipants: 20,
            tags: ['测试', '体育'],
            coverImage: ''
        };

        const createResponse = await mockCreateActivity(testActivityData);
        if (createResponse.success) {
            console.log('✅ 活动创建成功');
            console.log(`   活动ID: ${createResponse.data.id}`);
            console.log(`   活动标题: ${createResponse.data.title}`);
            console.log(`   报名开始时间: ${createResponse.data.enrollStartTime}`);
            console.log(`   报名结束时间: ${createResponse.data.enrollEndTime}`);
            console.log(`   坐标数据: ${JSON.stringify(createResponse.data.coords)}`);
            console.log(`   位置信息: ${JSON.stringify(createResponse.data.location)}`);
            
            const activityId = createResponse.data.id;

            // 2. 测试活动详情获取和状态计算
            console.log('\n📊 2. 测试活动状态计算...');
            const detailResponse = await mockGetActivityDetail(activityId);
            if (detailResponse.success) {
                const activity = detailResponse.data;
                console.log('✅ 活动详情获取成功');
                console.log(`   计算状态: ${activity.status}`);
                console.log(`   开始时间: ${new Date(activity.startTime).toLocaleString()}`);
                console.log(`   结束时间: ${new Date(activity.endTime).toLocaleString()}`);
                console.log(`   报名开始: ${activity.enrollStartTime ? new Date(activity.enrollStartTime).toLocaleString() : '未设置'}`);
                console.log(`   报名结束: ${activity.enrollEndTime ? new Date(activity.enrollEndTime).toLocaleString() : '未设置'}`);
                console.log(`   当前时间: ${new Date().toLocaleString()}`);
                
                // 检查状态计算是否正确
                const now = new Date();
                const startTime = new Date(activity.startTime);
                const expectedStatus = now < startTime ? 'recruiting' : 'in_progress';
                console.log(`   预期状态: ${expectedStatus}`);
                console.log(`   状态计算: ${activity.status === expectedStatus ? '✅ 正确' : '❌ 错误'}`);
            } else {
                console.log('❌ 活动详情获取失败:', detailResponse.message);
            }

            // 3. 测试位置信息
            console.log('\n📍 3. 测试位置信息...');
            if (detailResponse.success) {
                const activity = detailResponse.data;
                const hasCoords = activity.coords && Array.isArray(activity.coords) && activity.coords.length === 2;
                const hasLocation = activity.location && activity.location.name;
                
                console.log(`   有坐标数据: ${hasCoords ? '✅ 是' : '❌ 否'}`);
                console.log(`   坐标值: ${hasCoords ? `[${activity.coords[0]}, ${activity.coords[1]}]` : '无'}`);
                console.log(`   有位置信息: ${hasLocation ? '✅ 是' : '❌ 否'}`);
                console.log(`   位置名称: ${activity.location?.name || '无'}`);
                console.log(`   位置地址: ${activity.location?.address || '无'}`);
                console.log(`   地图显示条件: ${hasCoords && hasLocation ? '✅ 满足' : '❌ 不满足'}`);
            }

            // 4. 测试活动列表
            console.log('\n📋 4. 测试活动列表...');
            const listResponse = await mockGetActivityList();
            if (listResponse.success) {
                const activities = listResponse.data.list;
                console.log('✅ 活动列表获取成功');
                console.log(`   总活动数: ${listResponse.data.total}`);
                console.log(`   当前页活动数: ${activities.length}`);
                console.log('   活动状态分布:');
                activities.forEach(act => {
                    console.log(`     - ${act.title}: ${act.status}`);
                });
                
                // 检查新创建的活动是否在列表中
                const newActivity = activities.find(act => act.id === activityId);
                if (newActivity) {
                    console.log('✅ 新创建的活动已在列表中找到');
                    console.log(`   列表中的状态: ${newActivity.status}`);
                } else {
                    console.log('❌ 新创建的活动未在列表中找到');
                }
            } else {
                console.log('❌ 活动列表获取失败:', listResponse.message);
            }

        } else {
            console.log('❌ 活动创建失败:', createResponse.message);
        }

    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error.message);
        console.error(error.stack);
    }

    console.log('\n🎉 测试完成！');
}

// 运行测试
testFixes().catch(console.error);