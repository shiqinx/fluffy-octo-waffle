#!/usr/bin/env node

// 快速测试脚本 - 强制使用Mock模式
import { execSync } from 'child_process'
import { writeFileSync } from 'fs'

// 设置环境变量，强制使用Mock模式
process.env.VITE_USE_MOCK = 'true'
process.env.NODE_ENV = 'test'

// 创建临时的环境配置
const envConfig = `
// 强制测试环境配置
export const useMock = () => true
export const getApiBaseUrl = () => '/'
export const isDevelopment = false
export const isProduction = false
`

try {
  // 写入临时环境配置
  writeFileSync('./src/utils/env.test.js', envConfig)
  
  console.log('🚀 开始快速测试（Mock模式）...')
  
  // 运行测试
  const testCommand = process.argv[2] || 'test:run'
  const testFile = process.argv[3] || ''
  
  let command = `npm run ${testCommand}`
  if (testFile) {
    command += ` -- ${testFile}`
  }
  
  console.log(`执行命令: ${command}`)
  execSync(command, { 
    stdio: 'inherit',
    env: {
      ...process.env,
      VITE_USE_MOCK: 'true',
      NODE_ENV: 'test'
    }
  })
  
} catch (error) {
  console.error('测试执行失败:', error.message)
  process.exit(1)
} finally {
  // 清理临时文件
  try {
    const fs = require('fs')
    if (fs.existsSync('./src/utils/env.test.js')) {
      fs.unlinkSync('./src/utils/env.test.js')
    }
  } catch (cleanupError) {
    console.warn('清理临时文件失败:', cleanupError.message)
  }
}