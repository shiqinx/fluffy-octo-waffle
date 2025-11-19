// API错误诊断和修复脚本
// 解决 dataModelConverter.js:268 "API调用错误: Object" 问题

console.log('🔍 开始API错误诊断...\n');

// 1. 检查当前环境配置
const checkEnvironment = () => {
    console.log('=== 环境配置检查 ===');
    
    // 检查是否在浏览器环境
    if (typeof window !== 'undefined') {
        console.log('✅ 浏览器环境正常');
        
        // 检查当前URL
        console.log(`📍 当前URL: ${window.location.href}`);
        
        // 检查localStorage中的配置
        const useMock = localStorage.getItem('VITE_USE_MOCK');
        const apiBaseUrl = localStorage.getItem('VITE_API_BASE_URL');
        
        console.log(`🔧 Mock模式: ${useMock || '未设置'}`);
        console.log(`🌐 API地址: ${apiBaseUrl || '未设置'}`);
        
        return {
            isBrowser: true,
            useMock: useMock === 'true',
            apiBaseUrl: apiBaseUrl || 'http://localhost:8080/api'
        };
    } else {
        console.log('❌ 非浏览器环境');
        return { isBrowser: false };
    }
};

// 2. 模拟常见的API错误场景
const simulateApiErrors = () => {
    console.log('\n=== 模拟API错误场景 ===');
    
    const errors = [
        {
            name: '网络连接错误',
            error: new Error('Network Error')
        },
        {
            name: '服务器响应错误(404)',
            error: {
                response: {
                    status: 404,
                    data: { message: 'API接口不存在' }
                }
            }
        },
        {
            name: '服务器响应错误(500)',
            error: {
                response: {
                    status: 500,
                    data: { message: '服务器内部错误' }
                }
            }
        },
        {
            name: '请求超时',
            error: {
                request: {},
                message: 'Request timeout'
            }
        },
        {
            name: 'CORS跨域错误',
            error: {
                message: 'CORS policy violation'
            }
        }
    ];
    
    errors.forEach(({ name, error }) => {
        console.log(`\n🧪 测试场景: ${name}`);
        console.log(`错误对象:`, error);
        
        // 这里会调用 handleApiError 函数
        if (typeof handleApiError === 'function') {
            const result = handleApiError(error);
            console.log(`处理结果:`, result);
        } else {
            console.log('⚠️ handleApiError 函数未找到');
        }
    });
};

// 3. 检查API请求配置
const checkApiConfiguration = () => {
    console.log('\n=== API配置检查 ===');
    
    // 检查常见的API配置问题
    const issues = [];
    
    // 检查是否在开发环境
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    console.log(`🔍 开发环境: ${isDev ? '是' : '否'}`);
    
    // 检查协议
    const isSecure = window.location.protocol === 'https:';
    console.log(`🔒 安全协议: ${isSecure ? 'HTTPS' : 'HTTP'}`);
    
    // 检查端口
    const port = window.location.port;
    console.log(`🚪 前端端口: ${port || '默认'}`);
    
    // 常见问题诊断
    if (!isDev && !isSecure) {
        issues.push('生产环境建议使用HTTPS');
    }
    
    if (isDev && port === '3000') {
        console.log('💡 提示: 前端运行在3000端口，确保后端在8080端口');
    }
    
    if (issues.length > 0) {
        console.log('\n⚠️ 发现的配置问题:');
        issues.forEach(issue => console.log(`   - ${issue}`));
    } else {
        console.log('✅ API配置检查通过');
    }
};

// 4. 提供解决方案
const provideSolutions = () => {
    console.log('\n=== 解决方案建议 ===');
    
    console.log(`
🔧 针对 "API调用错误: Object" 的解决方案:

1. 📝 检查环境变量文件 (.env.development):
   VITE_USE_MOCK=true          # 启用Mock模式避免后端依赖
   VITE_API_BASE_URL=http://localhost:8080/api
   VITE_AMAP_KEY=30b170859f00b71edbd631aab944129a

2. 🚀 启动后端服务 (如果不使用Mock):
   cd backend
   npm run dev
   # 确保后端运行在 http://localhost:8080

3. 🔄 重启前端开发服务器:
   npm run dev
   # 修改环境变量后必须重启

4. 🧪 使用API测试页面验证:
   访问: http://localhost:3000/public/test-activity-api.html
   或: http://localhost:3000/public/api-error-debug.html

5. 📊 检查网络请求:
   打开浏览器开发者工具 → Network 标签
   查看失败的请求详情

6. 🔍 启用详细日志:
   在浏览器控制台中查看详细的错误信息
   包括请求URL、参数、响应状态等

⚡ 快速修复命令:
   # 创建环境变量文件
   echo "VITE_USE_MOCK=true" > .env.development
   echo "VITE_API_BASE_URL=http://localhost:8080/api" >> .env.development
   echo "VITE_AMAP_KEY=30b170859f00b71edbd631aab944129a" >> .env.development
   
   # 重启开发服务器
   npm run dev
`);
};

// 5. 自动修复功能
const autoFix = () => {
    console.log('\n=== 尝试自动修复 ===');
    
    if (typeof window !== 'undefined') {
        // 设置推荐的配置
        localStorage.setItem('VITE_USE_MOCK', 'true');
        localStorage.setItem('VITE_API_BASE_URL', 'http://localhost:8080/api');
        
        console.log('✅ 已设置推荐配置到localStorage:');
        console.log('   - VITE_USE_MOCK=true');
        console.log('   - VITE_API_BASE_URL=http://localhost:8080/api');
        
        console.log('\n🔄 请重启开发服务器以应用更改:');
        console.log('   npm run dev');
    }
};

// 6. 验证修复效果
const verifyFix = () => {
    console.log('\n=== 验证修复效果 ===');
    
    setTimeout(() => {
        console.log('⏳ 等待3秒后验证...');
        
        // 检查配置是否生效
        const useMock = localStorage.getItem('VITE_USE_MOCK');
        const apiBaseUrl = localStorage.getItem('VITE_API_BASE_URL');
        
        console.log(`✅ Mock模式: ${useMock === 'true' ? '已启用' : '未启用'}`);
        console.log(`✅ API地址: ${apiBaseUrl || '未设置'}`);
        
        if (useMock === 'true') {
            console.log('\n🎉 修复成功！现在应该不会再出现API调用错误了。');
            console.log('💡 Mock模式已启用，应用可以正常使用模拟数据。');
        } else {
            console.log('\n⚠️ Mock模式未启用，请确保后端服务正在运行。');
        }
    }, 3000);
};

// 执行诊断流程
const runDiagnosis = () => {
    console.log('🎯 API错误诊断开始...\n');
    
    const env = checkEnvironment();
    checkApiConfiguration();
    simulateApiErrors();
    provideSolutions();
    
    if (env.isBrowser) {
        autoFix();
        verifyFix();
    }
    
    console.log('\n✨ 诊断完成！');
    console.log('📋 如果问题仍然存在，请查看上述建议并按步骤操作。');
};

// 导出函数供外部调用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        checkEnvironment,
        simulateApiErrors,
        checkApiConfiguration,
        provideSolutions,
        autoFix,
        verifyFix,
        runDiagnosis
    };
}

// 自动运行诊断
if (typeof window !== 'undefined') {
    runDiagnosis();
}