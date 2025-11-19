// 直接在浏览器控制台运行的测试脚本
// 复制这段代码到浏览器控制台执行

(async function testLogin() {
    console.log('🔧 开始浏览器内登录测试')
    
    try {
        // 1. 检查环境
        console.log('🌍 环境检查:')
        console.log('- VITE_USE_MOCK:', import.meta.env?.VITE_USE_MOCK)
        console.log('- 当前URL:', window.location.href)
        
        // 2. 导入必要的模块
        console.log('📦 导入模块...')
        const { globalDataManager } = await import('./src/api/global-data.js')
        const { validateLoginParams } = await import('./src/utils/validation.js')
        const { convertToUserLoginRequest } = await import('./src/utils/dataModelConverter.js')
        const { mockLogin } = await import('./src/api/mock.js')
        const { login } = await import('./src/api/auth.js')
        
        // 3. 检查用户数据
        console.log('👥 检查用户数据:')
        const users = globalDataManager.getUsers()
        users.forEach(user => {
            console.log(`- ${user.realName}: 学号="${user.studentId}" (${typeof user.studentId}), 密码="${user.password}" (${typeof user.password})`)
        })
        
        // 4. 测试验证函数
        console.log('\n✅ 测试验证函数:')
        const validated = await validateLoginParams({ 
            studentId: '2330502134', 
            password: 'test123456' 
        })
        console.log('验证结果:', validated)
        
        // 5. 测试数据转换
        console.log('\n🔄 测试数据转换:')
        const converted = convertToUserLoginRequest(validated)
        console.log('转换结果:', converted)
        
        // 6. 测试mockLogin
        console.log('\n🔍 测试mockLogin:')
        try {
            const mockResult = await mockLogin({
                studentId: '2330502134',
                password: 'test123456'
            })
            console.log('✅ mockLogin成功:', mockResult)
        } catch (error) {
            console.log('❌ mockLogin失败:', error.message)
        }
        
        // 7. 测试完整登录API
        console.log('\n🔐 测试完整登录API:')
        try {
            const loginResult = await login({ 
                studentId: '2330502134', 
                password: 'test123456',
                rememberMe: false 
            })
            console.log('✅ 完整登录成功:', loginResult)
        } catch (error) {
            console.log('❌ 完整登录失败:', error.message)
        }
        
        // 8. 测试第二个用户
        console.log('\n👤 测试第二个用户:')
        try {
            const loginResult2 = await login({ 
                studentId: '2330502143', 
                password: '123456',
                rememberMe: false 
            })
            console.log('✅ 第二个用户登录成功:', loginResult2)
        } catch (error) {
            console.log('❌ 第二个用户登录失败:', error.message)
        }
        
        console.log('\n🎯 测试完成！')
        
    } catch (error) {
        console.error('❌ 测试过程中出错:', error)
        console.error('错误详情:', error.stack)
    }
})()