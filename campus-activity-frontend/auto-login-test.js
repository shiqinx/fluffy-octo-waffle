// 自动化登录测试脚本
import { login } from './src/api/auth.js';

console.log('🚀 开始自动化登录测试...\n');

// 测试用例
const testCases = [
  {
    name: '用户1 (孙金瑶)',
    data: { studentId: '2330502143', password: 'abc123456' },
    expected: 'success'
  },
  {
    name: '用户2 (卢敏婷)', 
    data: { studentId: '2330502134', password: 'test123456' },
    expected: 'success'
  },
  {
    name: '错误用户',
    data: { studentId: '9999999999', password: 'wrongpassword' },
    expected: 'error'
  }
];

async function runTests() {
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    try {
      console.log(`📝 测试: ${testCase.name}`);
      console.log(`   学号: ${testCase.data.studentId}`);
      console.log(`   密码: ${testCase.data.password}`);
      
      const result = await login(testCase.data);
      
      if (testCase.expected === 'success') {
        console.log(`✅ 成功: 登录通过`);
        console.log(`   用户名: ${result.data?.userName || '未知'}`);
        console.log(`   Token: ${result.data?.token ? '已生成' : '未生成'}`);
        passed++;
      } else {
        console.log(`❌ 失败: 应该失败但成功了`);
        failed++;
      }
      
    } catch (error) {
      if (testCase.expected === 'error') {
        console.log(`✅ 成功: 正确拒绝登录`);
        console.log(`   错误信息: ${error.message}`);
        passed++;
      } else {
        console.log(`❌ 失败: 意外错误`);
        console.log(`   错误信息: ${error.message}`);
        failed++;
      }
    }
    
    console.log('---');
  }
  
  console.log(`\n📊 测试结果:`);
  console.log(`   通过: ${passed}`);
  console.log(`   失败: ${failed}`);
  console.log(`   总计: ${passed + failed}`);
  
  if (failed === 0) {
    console.log(`\n🎉 所有测试通过！登录功能正常工作。`);
  } else {
    console.log(`\n⚠️ 有 ${failed} 个测试失败，需要检查。`);
  }
}

runTests().catch(console.error);