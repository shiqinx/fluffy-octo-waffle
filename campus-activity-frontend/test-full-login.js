// 测试完整的登录流程
import { login } from './src/api/auth.js';

console.log('=== 测试完整的登录流程 ===');

// 1. 测试卢敏婷登录
console.log('\n=== 测试卢敏婷登录 ===');
try {
  const result = await login({
    userId: '2330502134',
    password: 'test123456',
    rememberMe: false
  });
  console.log('✅ 卢敏婷登录成功:', result);
} catch (error) {
  console.log('❌ 卢敏婷登录失败:', error);
}

// 2. 测试孙金瑶登录
console.log('\n=== 测试孙金瑶登录 ===');
try {
  const result = await login({
    userId: '2330502143',
    password: '123456',
    rememberMe: false
  });
  console.log('✅ 孙金瑶登录成功:', result);
} catch (error) {
  console.log('❌ 孙金瑶登录失败:', error);
}

// 3. 测试错误的密码
console.log('\n=== 测试错误密码 ===');
try {
  const result = await login({
    userId: '2330502134',
    password: 'wrongpassword',
    rememberMe: false
  });
  console.log('✅ 登录成功:', result);
} catch (error) {
  console.log('❌ 登录失败:', error);
}