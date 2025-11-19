// API错误修复验证脚本
// 验证 dataModelConverter.js:268 "API调用错误: Object" 问题是否已解决

console.log('🔍 验证API错误修复效果...\n');

// 1. 检查环境变量配置
const checkEnvironmentVariables = () => {
    console.log('=== 环境变量检查 ===');
    
    // 检查Vite环境变量
    const isDev = import.meta.env.MODE === 'development';
    const useMock = import.meta.env.VITE_USE_MOCK === 'true';
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    const amapKey = import.meta.env.VITE_AMAP_KEY;
    
    console.log(`🔧 开发环境: ${isDev ? '是' : '否'}`);
    console.log(`🎭 Mock模式: ${useMock ? '已启用' : '未启用'}`);
    console.log(`🌐 API地址: ${apiBaseUrl || '未设置'}`);
    console.log(`🗺️ 地图密钥: ${amapKey ? '已设置' : '未设置'}`);
    
    return {
        isDev,
        useMock,
        apiBaseUrl,
        amapKey,
        isConfigured: useMock && apiBaseUrl && amapKey
    };
};

// 2. 测试Mock API功能
const testMockApis = async () => {
    console.log('\n=== Mock API测试 ===');
    
    try {
        // 导入API函数
        const { userApi, activityApi } = await import('@/api');
        
        const tests = [
            {
                name: '用户登录API',
                test: () => userApi.login({ userId: '2330502143', userPassword: '123456' })
            },
            {
                name: '活动列表API',
                test: () => activityApi.getActivityList()
            },
            {
                name: '创建活动API',
                test: () => activityApi.createActivity({
                    title: '测试活动',
                    description: '这是一个测试活动',
                    location: '测试地点',
                    startTime: '2024-12-20T10:00:00Z',
                    endTime: '2024-12-20T12:00:00Z',
                    maxParticipants: 50
                })
            }
        ];
        
        let successCount = 0;
        let failCount = 0;
        
        for (const { name, test } of tests) {
            try {
                console.log(`🧪 测试: ${name}`);
                const result = await test();
                
                if (result && result.success !== false) {
                    console.log(`✅ ${name} - 成功`);
                    successCount++;
                } else {
                    console.log(`❌ ${name} - 失败: ${result?.message || '未知错误'}`);
                    failCount++;
                }
            } catch (error) {
                console.log(`❌ ${name} - 异常: ${error.message}`);
                failCount++;
            }
        }
        
        console.log(`\n📊 测试结果: 成功 ${successCount}/${tests.length}, 失败 ${failCount}/${tests.length}`);
        
        return {
            total: tests.length,
            success: successCount,
            failed: failCount,
            successRate: (successCount / tests.length * 100).toFixed(1)
        };
        
    } catch (error) {
        console.log('❌ API测试失败:', error.message);
        return { error: error.message };
    }
};

// 3. 检查错误处理机制
const checkErrorHandling = () => {
    console.log('\n=== 错误处理检查 ===');
    
    try {
        // 检查handleApiError函数是否存在
        if (typeof handleApiError === 'function') {
            console.log('✅ handleApiError函数已加载');
            
            // 测试错误处理
            const testError = new Error('测试错误');
            const result = handleApiError(testError);
            
            console.log('✅ 错误处理功能正常');
            console.log(`📝 错误格式: success=${result.success}, message="${result.message}"`);
            
            return true;
        } else {
            console.log('❌ handleApiError函数未找到');
            return false;
        }
    } catch (error) {
        console.log('❌ 错误处理检查失败:', error.message);
        return false;
    }
};

// 4. 验证修复状态
const verifyFix = (envConfig, apiTestResult, errorHandling) => {
    console.log('\n=== 修复状态验证 ===');
    
    let fixStatus = '✅ 修复完成';
    let issues = [];
    
    // 检查环境配置
    if (!envConfig.isConfigured) {
        fixStatus = '⚠️ 部分修复';
        issues.push('环境配置不完整');
    }
    
    // 检查API测试
    if (apiTestResult.error) {
        fixStatus = '⚠️ 部分修复';
        issues.push('API测试失败');
    } else if (apiTestResult.failed > 0) {
        fixStatus = '⚠️ 部分修复';
        issues.push(`有${apiTestResult.failed}个API测试失败`);
    }
    
    // 检查错误处理
    if (!errorHandling) {
        fixStatus = '⚠️ 部分修复';
        issues.push('错误处理机制异常');
    }
    
    console.log(`🎯 修复状态: ${fixStatus}`);
    
    if (issues.length > 0) {
        console.log('⚠️ 发现的问题:');
        issues.forEach(issue => console.log(`   - ${issue}`));
    } else {
        console.log('🎉 所有检查通过，API错误问题已解决！');
    }
    
    return {
        status: fixStatus,
        issues,
        isFixed: issues.length === 0
    };
};

// 5. 提供使用建议
const provideUsageTips = (isFixed) => {
    console.log('\n=== 使用建议 ===');
    
    if (isFixed) {
        console.log(`
🎉 恭喜！API错误问题已完全解决。

📱 现在你可以正常使用应用的所有功能：
   ✅ 用户登录/注册
   ✅ 活动浏览/创建/报名
   ✅ 团队管理
   ✅ 聊天功能
   ✅ 个人资料管理

🔧 当前配置：
   🎭 Mock模式：已启用（无需后端服务器）
   📊 数据存储：浏览器本地存储
   🔄 数据持久化：自动保存

💡 使用提示：
   - 刷新页面数据不会丢失
   - 可以创建多个活动进行测试
   - 支持完整的用户注册流程
   - 所有API调用都会正常工作

🚀 如果需要连接真实后端：
   1. 启动后端服务器
   2. 修改 .env.development 中的 VITE_USE_MOCK=false
   3. 重启开发服务器
        `);
    } else {
        console.log(`
⚠️ 修复未完成，请按以下步骤操作：

1. 🔧 检查环境配置：
   - 确保 .env.development 文件存在
   - 确保 VITE_USE_MOCK=true

2. 🔄 重启开发服务器：
   npm run dev

3. 🧪 重新验证：
   - 刷新浏览器页面
   - 重新运行此验证脚本

4. 📞 如需帮助：
   - 查看浏览器控制台错误信息
   - 检查网络请求状态
   - 确认所有依赖已正确安装
        `);
    }
};

// 主验证流程
const runVerification = async () => {
    console.log('🎯 开始API错误修复验证...\n');
    
    try {
        // 1. 检查环境配置
        const envConfig = checkEnvironmentVariables();
        
        // 2. 测试Mock API
        const apiTestResult = await testMockApis();
        
        // 3. 检查错误处理
        const errorHandling = checkErrorHandling();
        
        // 4. 验证修复状态
        const fixStatus = verifyFix(envConfig, apiTestResult, errorHandling);
        
        // 5. 提供使用建议
        provideUsageTips(fixStatus.isFixed);
        
        console.log('\n✨ 验证完成！');
        
        return fixStatus;
        
    } catch (error) {
        console.error('❌ 验证过程出错:', error);
        return { status: '❌ 验证失败', error: error.message };
    }
};

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        checkEnvironmentVariables,
        testMockApis,
        checkErrorHandling,
        verifyFix,
        provideUsageTips,
        runVerification
    };
}

// 自动运行验证
if (typeof window !== 'undefined') {
    runVerification();
}