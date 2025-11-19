// 简单测试修复后的登录功能
import { globalDataManager } from './src/api/global-data.js';
import { mockLogin } from './src/api/mock.js';

console.log('=== 测试修复后的登录功能 ===');

// 1. 测试直接使用字符串类型的学号
console.log('\n=== 测试字符串学号登录 ===');
try {
  const result = await mockLogin('2330502134', 'test123456');
  console.log('✅ 登录成功:', result);
} catch (error) {
  console.log('❌ 登录失败:', error);
}

// 2. 测试另一个用户
console.log('\n=== 测试另一个用户 ===');
try {
  const result = await mockLogin('2330502143', '123456');
  console.log('✅ 登录成功:', result);
} catch (error) {
  console.log('❌ 登录失败:', error);
}

// 3. 测试数字类型学号（模拟之前的问题）
console.log('\n=== 测试数字学号登录 ===');
try {
  const result = await mockLogin(2330502134, 'test123456');
  console.log('✅ 登录成功:', result);
} catch (error) {
  console.log('❌ 登录失败:', error);
}