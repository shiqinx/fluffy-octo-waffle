import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    // 测试环境
    environment: 'jsdom',
    
    // 全局 API 可用
    globals: true,
    
    // 设置文件
    setupFiles: ['./src/test/setup.js'],
    
    // 测试文件匹配模式
    include: [
      'src/**/__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,ts,jsx,tsx}'
    ],
    
    // 排除文件
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache'
    ],
    
    // 性能优化配置
    testTimeout: 10000, // 增加超时时间
    hookTimeout: 10000,  // 增加钩子超时时间
    
    // 并发配置
    pool: 'threads',
    poolOptions: {
      threads: {
        maxThreads: 4, // 限制并发线程数
        minThreads: 1
      }
    },
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        'vite.config.js',
        'vitest.config.js'
      ],
      thresholds: {
        global: {
          branches: 75,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    
    // 监听模式配置
    watchExclude: [
      'node_modules/',
      'dist/'
    ],
    
    // 优化输出
    reporter: ['verbose'],
    outputFile: './test-results.txt'
  },
  
  // 路径解析
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})