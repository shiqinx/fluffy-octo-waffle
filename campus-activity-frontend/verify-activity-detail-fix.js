// 活动详情页面修复验证脚本
console.log('🔧 开始验证活动详情页面修复...');

// 测试1: 检查路由参数监听器
console.log('📋 测试1: 检查路由参数监听器');
fetch('/src/views/activity/ActivityDetail.vue')
    .then(response => response.text())
    .then(content => {
        if (content.includes('watch(() => route.params.id')) {
            console.log('✅ 路由参数监听器已添加');
        } else {
            console.log('❌ 路由参数监听器未找到');
        }
        
        // 测试2: 检查签到功能修复
        console.log('📋 测试2: 检查签到功能修复');
        if (content.includes('participant.userId === userStore.userInfo.id') && 
            !content.includes('participant.userId === authStore.userInfo.id')) {
            console.log('✅ 签到功能store引用已修复');
        } else {
            console.log('❌ 签到功能store引用仍有问题');
        }
        
        // 测试3: 检查加载状态覆盖层
        console.log('📋 测试3: 检查加载状态覆盖层');
        if (content.includes('loading-overlay') && content.includes('loading-spinner')) {
            console.log('✅ 加载状态覆盖层已添加');
        } else {
            console.log('❌ 加载状态覆盖层未找到');
        }
        
        // 测试4: 检查错误处理
        console.log('📋 测试4: 检查错误处理');
        if (content.includes('router.back()') && content.includes('setTimeout')) {
            console.log('✅ 错误处理逻辑已完善');
        } else {
            console.log('❌ 错误处理逻辑需要改进');
        }
        
        console.log('🎉 活动详情页面修复验证完成！');
    })
    .catch(error => {
        console.error('❌ 验证失败:', error);
    });

// 测试5: 检查API调用
console.log('📋 测试5: 检查API调用');
import('./src/api/activity.js').then(module => {
    const { getActivityDetail } = module;
    
    // 测试几个活动ID
    const testIds = ['1', '2', '3'];
    
    Promise.all(testIds.map(id => 
        getActivityDetail(id)
            .then(result => {
                if (result && result.success && result.data) {
                    console.log(`✅ 活动${id}API调用成功: ${result.data.title}`);
                    return true;
                } else {
                    console.log(`❌ 活动${id}API响应格式错误`);
                    return false;
                }
            })
            .catch(error => {
                console.log(`❌ 活动${id}API调用失败: ${error.message}`);
                return false;
            })
    )).then(results => {
        const successCount = results.filter(r => r).length;
        console.log(`📊 API测试结果: ${successCount}/${results.length} 成功`);
    });
}).catch(error => {
    console.error('❌ API模块导入失败:', error);
});