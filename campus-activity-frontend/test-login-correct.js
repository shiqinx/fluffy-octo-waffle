// 正确测试修复后的登录功能
import { globalDataManager } from './src/api/global-data.js';
import { mockLogin } from './src/api/mock.js';

console.log('=== 测试修复后的登录功能 ===');

// 1. 测试卢敏婷登录
console.log('\n=== 测试卢敏婷登录 ===');
try {
  const result = await mockLogin({
    studentId: '2330502134',
    password: 'test123456'
  });
  console.log('✅ 卢敏婷登录成功:', result);
} catch (error) {
  console.log('❌ 卢敏婷登录失败:', error);
}

// 2. 测试孙金瑶登录
console.log('\n=== 测试孙金瑶登录 ===');
try {
  const result = await mockLogin({
    studentId: '2330502143',
    password: '123456'
  });
  console.log('✅ 孙金瑶登录成功:', result);
} catch (error) {
  console.log('❌ 孙金瑶登录失败:', error);
}

// 3. 测试错误的密码
console.log('\n=== 测试错误密码 ===');
try {
  const result = await mockLogin({
    studentId: '2330502134',
    password: 'wrongpassword'
  });
  console.log('✅ 登录成功:', result);
} catch (error) {
  console.log('❌ 登录失败:', error);
}