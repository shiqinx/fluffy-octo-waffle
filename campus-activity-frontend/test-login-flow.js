// 登录流程详细测试
console.log('=== 开始登录流程详细测试 ===');

// 测试用户数据
const testUsers = [
  { studentId: '2021001', password: '123456', realName: '孙金瑶' },
  { studentId: '2021002', password: '123456', realName: '卢敏婷' }
];

// 1. 测试全局数据管理器
console.log('\n1. 测试全局数据管理器');
try {
  const { globalDataManager } = await import('./src/api/global-data.js');
  const users = globalDataManager.getUsers();
  console.log('✅ 全局数据管理器加载成功');
  console.log('用户数量:', users.length);
  console.log('用户列表:', users.map(u => ({
    id: u.id,
    studentId: u.studentId,
    realName: u.realName,
    passwordLength: u.password?.length
  })));
} catch (error) {
  console.error('❌ 全局数据管理器加载失败:', error);
}

// 2. 测试验证函数
console.log('\n2. 测试验证函数');
try {
  const { validateLoginParams } = await import('./src/utils/validation.js');
  
  for (const user of testUsers) {
    const result = await validateLoginParams({
      studentId: user.studentId,
      password: user.password
    });
    console.log(`✅ 验证 ${user.realName}:`, result);
  }
} catch (error) {
  console.error('❌ 验证函数测试失败:', error);
}

// 3. 测试数据转换函数
console.log('\n3. 测试数据转换函数');
try {
  const { convertToUserLoginRequest } = await import('./src/utils/dataModelConverter.js');
  
  for (const user of testUsers) {
    const loginRequest = convertToUserLoginRequest({
      userId: user.studentId,
      password: user.password,
      userPassword: user.password,
      rememberMe: false
    });
    console.log(`✅ 转换 ${user.realName}:`, loginRequest);
  }
} catch (error) {
  console.error('❌ 数据转换函数测试失败:', error);
}

// 4. 测试mockLogin函数
console.log('\n4. 测试mockLogin函数');
try {
  const { mockLogin } = await import('./src/api/mock.js');
  
  for (const user of testUsers) {
    console.log(`\n--- 测试 ${user.realName} 登录 ---`);
    const result = await mockLogin({
      studentId: user.studentId,
      password: user.password
    });
    console.log('✅ 登录结果:', result);
  }
} catch (error) {
  console.error('❌ mockLogin测试失败:', error);
}

// 5. 测试完整的登录API
console.log('\n5. 测试完整的登录API');
try {
  const { login } = await import('./src/api/auth.js');
  
  for (const user of testUsers) {
    console.log(`\n--- 测试 ${user.realName} 完整登录API ---`);
    const result = await login({
      studentId: user.studentId,
      password: user.password,
      rememberMe: false
    });
    console.log('✅ 完整登录结果:', result);
  }
} catch (error) {
  console.error('❌ 完整登录API测试失败:', error);
}

// 6. 测试validatedApi
console.log('\n6. 测试validatedApi');
try {
  const { validatedApi } = await import('./src/api/index.js');
  
  for (const user of testUsers) {
    console.log(`\n--- 测试 ${user.realName} validatedApi ---`);
    const result = await validatedApi.login({
      studentId: user.studentId,
      password: user.password,
      rememberMe: false
    });
    console.log('✅ validatedApi登录结果:', result);
  }
} catch (error) {
  console.error('❌ validatedApi测试失败:', error);
}

console.log('\n=== 登录流程详细测试完成 ===');