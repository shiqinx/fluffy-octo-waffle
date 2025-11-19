// 使用正确学号的登录测试
console.log('=== 使用正确学号的登录测试 ===');

// 正确的用户数据
const correctTestUsers = [
  { studentId: '2330502143', password: '123456', realName: '孙金瑶' },
  { studentId: '2330502134', password: 'test123456', realName: '卢敏婷' }
];

// 测试mockLogin函数
console.log('\n测试mockLogin函数（使用正确学号）');
try {
  const { mockLogin } = await import('./src/api/mock.js');
  
  for (const user of correctTestUsers) {
    console.log(`\n--- 测试 ${user.realName} (${user.studentId}) 登录 ---`);
    try {
      const result = await mockLogin({
        studentId: user.studentId,
        password: user.password
      });
      console.log('✅ 登录成功:', result.success);
      console.log('用户信息:', result.data?.user);
    } catch (error) {
      console.log('❌ 登录失败:', error.message);
    }
  }
} catch (error) {
  console.error('❌ mockLogin导入失败:', error);
}

console.log('\n=== 测试完成 ===');