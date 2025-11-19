// 完整的登录问题诊断脚本
import { globalDataManager } from './src/api/global-data.js'
import { validateLoginParams } from './src/utils/validation.js'
import { convertToUserLoginRequest } from './src/utils/dataModelConverter.js'
import { mockLogin } from './src/api/mock.js'

console.log('🔍 ===== 完整登录问题诊断 =====')

// 1. 检查用户数据
console.log('\n📋 步骤1: 检查用户数据')
const users = globalDataManager.getUsers()
console.log('系统中的用户:')
users.forEach(user => {
    console.log(`- ID: ${user.id}, 学号: "${user.studentId}" (类型: ${typeof user.studentId}), 姓名: ${user.realName}, 密码: "${user.password}" (类型: ${typeof user.password})`)
})

// 2. 测试验证函数
console.log('\n✅ 步骤2: 测试验证函数')
const testCredentials = [
    { studentId: '2330502134', password: 'test123456' }, // 卢敏婷
    { studentId: '2330502143', password: '123456' },     // 孙金瑶
    { studentId: '20210001', password: '123456' },       // 不存在的用户
]

for (const credentials of testCredentials) {
    try {
        const validated = await validateLoginParams(credentials)
        console.log(`✅ 验证通过: ${JSON.stringify(validated)}`)
    } catch (error) {
        console.log(`❌ 验证失败: ${error.message}`)
    }
}

// 3. 测试数据转换
console.log('\n🔄 步骤3: 测试数据转换')
for (const credentials of testCredentials) {
    try {
        const validated = await validateLoginParams(credentials)
        const converted = convertToUserLoginRequest(validated)
        console.log(`🔄 转换结果: ${JSON.stringify(converted)}`)
    } catch (error) {
        console.log(`❌ 转换失败: ${error.message}`)
    }
}

// 4. 测试完整登录流程
console.log('\n🔐 步骤4: 测试完整登录流程')
for (const credentials of testCredentials) {
    try {
        console.log(`\n--- 测试登录: ${credentials.studentId} ---`)
        
        // 4.1 验证
        const validated = await validateLoginParams(credentials)
        console.log(`✅ 验证通过: ${JSON.stringify(validated)}`)
        
        // 4.2 转换
        const converted = convertToUserLoginRequest(validated)
        console.log(`🔄 转换后: ${JSON.stringify(converted)}`)
        
        // 4.3 模拟登录 (传递正确的参数格式)
        const mockCredentials = {
            studentId: converted.userId,  // 注意：这里使用converted.userId
            password: converted.userPassword
        }
        console.log(`🔍 调用mockLogin参数: ${JSON.stringify(mockCredentials)}`)
        
        const result = await mockLogin(mockCredentials)
        console.log(`✅ 登录成功: ${result.message}`)
        
    } catch (error) {
        console.log(`❌ 登录失败: ${error.message}`)
        console.log(`   错误详情: ${JSON.stringify(error)}`)
    }
}

console.log('\n🎯 ===== 诊断完成 =====')