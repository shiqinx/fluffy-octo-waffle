// 直接测试登录逻辑
import { globalDataManager } from './src/api/global-data.js';
import { mockLogin } from './src/api/mock.js';

console.log('🚀 开始直接测试登录逻辑...');

// 检查用户数据
const users = globalDataManager.getUsers();
console.log('📋 用户数据:');
users.forEach((user, index) => {
    console.log(`  ${index + 1}. ${user.realName} (${user.studentId}) - 密码: ${user.password}`);
});

// 测试两个用户
const testCases = [
    { studentId: '2330502143', password: '123456', name: '孙金瑶' },
    { studentId: '2330502134', password: 'test123456', name: '卢敏婷' }
];

async function runTests() {
    for (const testCase of testCases) {
        console.log(`\n🔍 测试用户: ${testCase.name}`);
        console.log(`📝 学号: ${testCase.studentId}, 密码: ${testCase.password}`);
        
        try {
            const result = await mockLogin({
                studentId: testCase.studentId,
                password: testCase.password
            });
            console.log('✅ 登录成功:', result);
        } catch (error) {
            console.log('❌ 登录失败:', error);
        }
    }
}

runTests().then(() => {
    console.log('\n🎉 测试完成');
}).catch(error => {
    console.error('❌ 测试出错:', error);
});