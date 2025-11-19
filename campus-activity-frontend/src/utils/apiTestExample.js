/**
 * API测试使用示例
 * 这个文件演示如何在开发环境中使用API测试工具
 * 
 * 使用方法：
 * 1. 在开发环境中导入并调用这些测试函数
 * 2. 在浏览器控制台查看测试结果
 * 3. 根据测试结果调整API调用和数据模型
 */

import { runApiTests, testSingleApi, performanceTestApi } from './apiTests'
import { createTeam, applyTeam } from '@/api/team'
import { createActivity, joinActivity } from '@/api/activity'
import { sendMessage } from '@/api/message'

/**
 * 在开发环境中运行API测试
 * 可以在应用启动时调用，或者通过控制台手动调用
 */
export const runDevelopmentTests = async () => {
  // 检查是否在开发环境
  if (import.meta.env.DEV) {
    console.log('\n📊 开始运行API测试...')
    
    try {
      // 运行所有API测试
      const results = await runApiTests()
      
      // 分析测试结果
      if (results.summary.failed > 0) {
        console.warn('⚠️  部分API测试失败，请检查API实现和数据模型')
      } else {
        console.log('✅ 所有API测试通过！')
      }
      
      return results
    } catch (error) {
      console.error('❌ API测试运行失败:', error)
    }
  }
}

/**
 * 测试特定API的使用示例
 */
export const demoSingleApiTest = async () => {
  console.log('\n🔍 测试单个API示例:')
  
  // 测试创建团队API
  const teamResult = await testSingleApi(createTeam, [{
    teamName: 'Demo Team',
    description: 'API测试演示团队',
    maxMembers: 5,
    tags: ['demo', 'test']
  }])
  
  console.log('团队创建测试结果:', teamResult.success ? '成功' : '失败')
  
  if (teamResult.success && teamResult.data) {
    // 如果团队创建成功，可以继续测试其他相关API
    const teamId = teamResult.data.id
    console.log(`创建的团队ID: ${teamId}`)
    
    // 测试申请加入团队API
    const applyResult = await testSingleApi(applyTeam, [{
      teamId,
      message: '我想加入这个测试团队'
    }])
    
    console.log('申请加入团队测试结果:', applyResult.success ? '成功' : '失败')
  }
}

/**
 * 性能测试使用示例
 */
export const demoPerformanceTest = async () => {
  console.log('\n⚡ 开始性能测试...')
  
  // 测试获取活动列表API的性能（调用10次）
  const performanceResult = await performanceTestApi(
    getActivityList,  // 这里需要导入getActivityList
    [{}],            // 空参数
    10              // 调用10次
  )
  
  console.log('性能测试结果:', performanceResult)
}

/**
 * 错误处理演示
 * 展示如何在应用中处理API错误
 */
export const demoErrorHandling = async () => {
  console.log('\n🛡️  错误处理演示:')
  
  try {
    // 故意传入错误参数测试错误处理
    const result = await testSingleApi(createTeam, [{
      // 缺少必要参数
      description: '缺少团队名称的测试'
      // 应该包含 teamName
    }])
    
    if (!result.success) {
      console.log('错误捕获成功!')
      console.log('错误信息:', result.message)
      console.log('错误代码:', result.code)
      
      // 在这里可以添加UI提示逻辑
      // showErrorMessage(result.message)
      
      // 根据不同错误类型执行不同操作
      if (result.code === 401) {
        console.log('需要重新登录...')
        // redirectToLogin()
      } else if (result.code === 403) {
        console.log('没有权限，显示权限不足提示...')
        // showPermissionDeniedAlert()
      }
    }
  } catch (error) {
    // 正常情况下不应该进入这里，因为我们的testSingleApi已经处理了错误
    console.error('未捕获的错误:', error)
  }
}

/**
 * 在组件中使用API测试的示例代码
 * 注意：这只是示例，实际使用时需要根据组件结构调整
 */

/*
// 在Vue组件中的使用示例
import { testSingleApi } from '@/utils/apiTests'
import { createActivity } from '@/api/activity'

export default {
  methods: {
    async createActivityWithTest() {
      try {
        const activityData = {
          title: '测试活动',
          description: '这是通过测试工具创建的活动',
          // 其他必要参数...
        }
        
        // 使用测试工具调用API
        const result = await testSingleApi(createActivity, [activityData])
        
        if (result.success) {
          // 处理成功
          this.$toast.success('活动创建成功')
          this.loadActivities()
        } else {
          // 处理错误
          this.$toast.error(result.message)
          
          // 记录错误
          this.logApiError('createActivity', result)
        }
      } catch (error) {
        // 这一层是额外的保险
        this.$toast.error('系统错误，请稍后重试')
        console.error('创建活动失败:', error)
      }
    },
    
    logApiError(action, error) {
      // 可以将错误信息发送到监控系统
      console.log(`API错误日志 - ${action}:`, error)
      // 例如：errorTrackingService.log(error)
    }
  }
}
*/

export default {
  runDevelopmentTests,
  demoSingleApiTest,
  demoPerformanceTest,
  demoErrorHandling
}