// 深度调试用户匹配问题
import { globalDataManager } from './src/api/global-data.js';

console.log('=== 深度调试用户匹配问题 ===');

// 1. 获取用户数据
const users = globalDataManager.getUsers();
console.log('用户数据:', users);

// 2. 模拟登录参数
const testStudentId = '2330502134';
const testPassword = 'test123456';

console.log('\n=== 测试参数 ===');
console.log('测试学号:', testStudentId, '类型:', typeof testStudentId);
console.log('测试密码:', testPassword, '类型:', typeof testPassword);

// 3. 逐个检查用户匹配
console.log('\n=== 用户匹配检查 ===');
for (const user of users) {
    console.log('\n检查用户:', user.realName);
    console.log('存储学号:', user.studentId, '类型:', typeof user.studentId);
    console.log('存储密码:', user.password, '类型:', typeof user.password);
    
    console.log('学号比较:');
    console.log('  严格相等 (===):', user.studentId === testStudentId);
    console.log('  松散相等 (==):', user.studentId == testStudentId);
    console.log('  字符串比较:', String(user.studentId) === String(testStudentId));
    
    console.log('密码比较:');
    console.log('  严格相等 (===):', user.password === testPassword);
    console.log('  松散相等 (==):', user.password == testPassword);
    console.log('  字符串比较:', String(user.password) === String(testPassword));
    
    // 检查是否有隐藏字符
    console.log('学号长度比较:');
    console.log('  输入学号长度:', testStudentId.length);
    console.log('  存储学号长度:', String(user.studentId).length);
    
    console.log('密码长度比较:');
    console.log('  输入密码长度:', testPassword.length);
    console.log('  存储密码长度:', String(user.password).length);
    
    // 检查字符编码
    console.log('字符编码检查:');
    console.log('  输入学号字符码:', [...testStudentId].map(c => c.charCodeAt(0)));
    console.log('  存储学号字符码:', [...String(user.studentId)].map(c => c.charCodeAt(0)));
    console.log('  输入密码字符码:', [...testPassword].map(c => c.charCodeAt(0)));
    console.log('  存储密码字符码:', [...String(user.password)].map(c => c.charCodeAt(0)));
}

// 4. 手动测试匹配逻辑
console.log('\n=== 手动测试匹配逻辑 ===');
let foundUser = null;
for (const user of users) {
    if ((user.studentId == testStudentId) && (user.password == testPassword)) {
        foundUser = user;
        break;
    }
}

console.log('找到用户:', foundUser ? foundUser.realName : '未找到');

// 5. 尝试不同的匹配方式
console.log('\n=== 不同匹配方式测试 ===');

// 方式1: 字符串比较
let user1 = users.find(u => String(u.studentId) === String(testStudentId) && String(u.password) === String(testPassword));
console.log('字符串比较结果:', user1 ? user1.realName : '未找到');

// 方式2: 数字比较
let user2 = users.find(u => Number(u.studentId) === Number(testStudentId) && u.password === testPassword);
console.log('数字比较结果:', user2 ? user2.realName : '未找到');

// 方式3: 混合比较
let user3 = users.find(u => (u.studentId == testStudentId) && (u.password === testPassword));
console.log('混合比较结果:', user3 ? user3.realName : '未找到');