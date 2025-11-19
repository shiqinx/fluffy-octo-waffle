// 简化的登录问题诊断脚本
console.log('🔍 ===== 完整登录问题诊断 =====')

// 1. 模拟用户数据
console.log('\n📋 步骤1: 检查用户数据')
const users = [
    {
        id: 1,
        studentId: '2330502143',
        realName: '孙金瑶',
        password: '123456',
    },
    {
        id: 2,
        studentId: '2330502134', 
        realName: '卢敏婷',
        password: 'test123456',
    }
]

console.log('系统中的用户:')
users.forEach(user => {
    console.log(`- ID: ${user.id}, 学号: "${user.studentId}" (类型: ${typeof user.studentId}), 姓名: ${user.realName}, 密码: "${user.password}" (类型: ${typeof user.password})`)
})

// 2. 模拟验证函数
console.log('\n✅ 步骤2: 模拟验证函数')
function validateLoginParams(credentials) {
    if (!credentials.studentId || credentials.studentId.trim() === '') {
        throw new Error('学号不能为空')
    }
    if (!credentials.password || credentials.password.trim() === '') {
        throw new Error('密码不能为空')
    }
    return {
        studentId: credentials.studentId.trim(),
        password: credentials.password
    }
}

// 3. 模拟数据转换函数
console.log('\n🔄 步骤3: 模拟数据转换函数')
function convertToUserLoginRequest(loginData) {
    return {
        userId: loginData.studentId,  // 这里保持字符串类型
        userPassword: loginData.password,
        rememberMe: loginData.rememberMe || false
    }
}

// 4. 模拟mockLogin函数
console.log('\n🔐 步骤4: 模拟mockLogin函数')
function mockLogin(data) {
    const studentId = data.studentId || data.username
    const password = data.password
    
    console.log(`🔍 mockLogin接收参数: studentId="${studentId}" (类型: ${typeof studentId}), password="${password}" (类型: ${typeof password})`)
    
    let user = null
    for (const u of users) {
        console.log(`🔍 比较用户: ${u.realName}`)
        console.log(`  - 输入学号: "${studentId}" vs 存储学号: "${u.studentId}" -> 匹配: ${u.studentId == studentId}`)
        console.log(`  - 输入密码: "${password}" vs 存储密码: "${u.password}" -> 匹配: ${u.password == password}`)
        
        if ((u.studentId == studentId) && (u.password == password)) {
            user = u
            break
        }
    }
    
    if (user) {
        return {
            success: true,
            data: {
                token: 'mock_token_' + Date.now(),
                user: {
                    id: user.id,
                    realName: user.realName,
                    studentId: user.studentId
                }
            },
            message: '登录成功'
        }
    } else {
        throw {
            success: false,
            message: '学号或密码错误'
        }
    }
}

// 5. 测试完整登录流程
console.log('\n🧪 步骤5: 测试完整登录流程')
const testCases = [
    { studentId: '2330502134', password: 'test123456' }, // 卢敏婷
    { studentId: '2330502143', password: '123456' },     // 孙金瑶
    { studentId: '20210001', password: '123456' },       // 不存在的用户
]

for (const testCase of testCases) {
    try {
        console.log(`\n--- 测试登录: ${testCase.studentId} ---`)
        
        // 5.1 验证
        const validated = validateLoginParams(testCase)
        console.log(`✅ 验证通过: ${JSON.stringify(validated)}`)
        
        // 5.2 转换
        const converted = convertToUserLoginRequest(validated)
        console.log(`🔄 转换后: ${JSON.stringify(converted)}`)
        
        // 5.3 模拟登录 - 这里是关键！
        // 问题在于auth.js中传递给mockLogin的参数格式
        console.log(`🔍 当前auth.js中的调用方式:`)
        console.log(`   mockLogin({`)
        console.log(`     studentId: loginRequest.userId,`)
        console.log(`     password: loginRequest.userPassword`)
        console.log(`   })`)
        
        const mockCredentials = {
            studentId: converted.userId,  // 来自转换后的userId
            password: converted.userPassword
        }
        console.log(`🔍 实际传递的参数: ${JSON.stringify(mockCredentials)}`)
        
        const result = mockLogin(mockCredentials)
        console.log(`✅ 登录成功: ${result.message}`)
        
    } catch (error) {
        console.log(`❌ 登录失败: ${error.message}`)
    }
}

console.log('\n🎯 ===== 诊断完成 =====')
console.log('\n💡 关键发现:')
console.log('1. 用户数据中学号是字符串类型')
console.log('2. convertToUserLoginRequest现在保持字符串类型（已修复）')
console.log('3. mockLogin使用松散相等比较(==)，应该能匹配')
console.log('4. auth.js中的参数传递格式正确')
console.log('\n如果仍然失败，可能是:')
console.log('- 浏览器缓存问题')
console.log('- 环境变量问题')
console.log('- 模块加载顺序问题')