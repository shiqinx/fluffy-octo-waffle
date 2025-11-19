// 测试修复后的登录功能
import { globalDataManager } from './src/api/global-data.js';
import { mockLogin } from './src/api/mock.js';
import { convertToUserLoginRequest } from './src/utils/dataModelConverter.js';

console.log('=== 测试修复后的登录功能 ===');

// 1. 测试数据转换
const loginData = {
  userId: '2330502134',
  password: 'test123456'
};

console.log('\n=== 测试数据转换 ===');
console.log('原始登录数据:', loginData);

const convertedData = convertToUserLoginRequest(loginData);
console.log('转换后的数据:', convertedData);
console.log('userId类型:', typeof convertedData.userId);

// 2. 测试登录
console.log('\n=== 测试登录 ===');
try {
  const result = await mockLogin(convertedData.userId, convertedData.userPassword);
  console.log('✅ 登录成功:', result);
} catch (error) {
  console.log('❌ 登录失败:', error);
}

// 3. 测试另一个用户
console.log('\n=== 测试另一个用户 ===');
const loginData2 = {
  userId: '2330502143',
  password: '123456'
};

const convertedData2 = convertToUserLoginRequest(loginData2);
console.log('转换后的数据:', convertedData2);

try {
  const result = await mockLogin(convertedData2.userId, convertedData2.userPassword);
  console.log('✅ 登录成功:', result);
} catch (error) {
  console.log('❌ 登录失败:', error);
}