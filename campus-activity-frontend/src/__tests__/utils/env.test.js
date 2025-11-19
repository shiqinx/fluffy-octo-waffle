// @/tests/utils/env.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('env.js 环境配置工具函数', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('基本功能测试', () => {
    it('应该能够导入所有函数', async () => {
      const envModule = await import('@/utils/env')
      
      expect(envModule.isDevelopment).toBeDefined()
      expect(envModule.isProduction).toBeDefined()
      expect(envModule.useMock).toBeDefined()
      expect(envModule.getApiBaseUrl).toBeDefined()
      expect(envModule.getAmapKey).toBeDefined()
      expect(envModule.getAppConfig).toBeDefined()
    })

    it('应该返回基本的应用信息', async () => {
      const { getAppConfig } = await import('@/utils/env')
      const config = getAppConfig()
      
      expect(config.appName).toBe('校园活动平台')
      expect(config.version).toBe('1.0.0')
    })
  })

  describe('环境判断', () => {
    it('应该正确判断开发环境', async () => {
      const { isDevelopment, isProduction } = await import('@/utils/env')
      
      // 由于env.js在模块加载时就确定了环境，这里我们只能验证当前环境
      expect(typeof isDevelopment).toBe('boolean')
      expect(typeof isProduction).toBe('boolean')
    })
  })

  describe('模拟数据配置', () => {
    it('应该返回布尔值', async () => {
      const { useMock } = await import('@/utils/env')
      
      expect(typeof useMock()).toBe('boolean')
    })
  })

  describe('API基础URL配置', () => {
    it('应该返回字符串类型的API基础URL', async () => {
      const { getApiBaseUrl } = await import('@/utils/env')
      
      expect(typeof getApiBaseUrl()).toBe('string')
      expect(getApiBaseUrl().length).toBeGreaterThan(0)
    })
  })

  describe('高德地图Key配置', () => {
    it('应该返回字符串类型的高德地图Key', async () => {
      const { getAmapKey } = await import('@/utils/env')
      
      expect(typeof getAmapKey()).toBe('string')
      expect(getAmapKey().length).toBeGreaterThan(0)
    })
  })

  describe('应用配置完整性', () => {
    it('应该返回完整的应用配置对象', async () => {
      const { getAppConfig } = await import('@/utils/env')
      const config = getAppConfig()
      
      expect(config).toMatchObject({
        appName: '校园活动平台',
        version: '1.0.0'
      })
      
      // 验证所有必需的属性都存在
      expect(typeof config.apiBaseUrl).toBe('string')
      expect(typeof config.amapKey).toBe('string')
      expect(typeof config.useMock).toBe('boolean')
      expect(typeof config.isDevelopment).toBe('boolean')
      expect(typeof config.isProduction).toBe('boolean')
    })
  })

  describe('函数调用一致性', () => {
    it('多次调用相同函数应该返回一致的结果', async () => {
      const { useMock, getApiBaseUrl, getAmapKey, getAppConfig } = await import('@/utils/env')
      
      const useMock1 = useMock()
      const useMock2 = useMock()
      expect(useMock1).toBe(useMock2)
      
      const apiBaseUrl1 = getApiBaseUrl()
      const apiBaseUrl2 = getApiBaseUrl()
      expect(apiBaseUrl1).toBe(apiBaseUrl2)
      
      const amapKey1 = getAmapKey()
      const amapKey2 = getAmapKey()
      expect(amapKey1).toBe(amapKey2)
      
      const config1 = getAppConfig()
      const config2 = getAppConfig()
      expect(config1).toEqual(config2)
    })
  })

  describe('默认导出', () => {
    it('应该正确导出所有函数', async () => {
      const envModule = await import('@/utils/env')
      
      expect(envModule.default).toBeDefined()
      expect(envModule.default.isDevelopment).toBe(envModule.isDevelopment)
      expect(envModule.default.isProduction).toBe(envModule.isProduction)
      expect(envModule.default.useMock).toBe(envModule.useMock)
      expect(envModule.default.getApiBaseUrl).toBe(envModule.getApiBaseUrl)
      expect(envModule.default.getAmapKey).toBe(envModule.getAmapKey)
      expect(envModule.default.getAppConfig).toBe(envModule.getAppConfig)
    })
  })
})