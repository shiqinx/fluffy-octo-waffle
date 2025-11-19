import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAppStore } from '@/stores/appStore'

describe('App Store', () => {
  let appStore

  beforeEach(() => {
    // Mock navigator
    Object.defineProperty(window, 'navigator', {
      value: {
        onLine: true
      },
      writable: true
    })
    
    // Mock document
    Object.defineProperty(document, 'documentElement', {
      value: {
        setAttribute: vi.fn()
      },
      writable: true
    })
    
    setActivePinia(createPinia())
    appStore = useAppStore()
  })

  describe('初始状态', () => {
    it('应该正确初始化应用状态', () => {
      expect(appStore.globalLoading).toBe(false)
      expect(appStore.onlineStatus).toBe(true)
      expect(appStore.theme).toBe('light')
      expect(appStore.language).toBe('zh-CN')
    })
  })

  describe('setGlobalLoading', () => {
    it('应该设置全局加载状态', () => {
      appStore.setGlobalLoading(true)
      expect(appStore.globalLoading).toBe(true)
      
      appStore.setGlobalLoading(false)
      expect(appStore.globalLoading).toBe(false)
    })
  })

  describe('setOnlineStatus', () => {
    it('应该设置在线状态', () => {
      appStore.setOnlineStatus(false)
      expect(appStore.onlineStatus).toBe(false)
      
      appStore.setOnlineStatus(true)
      expect(appStore.onlineStatus).toBe(true)
    })
  })

  describe('setTheme', () => {
    it('应该设置主题', () => {
      appStore.setTheme('dark')
      expect(appStore.theme).toBe('dark')
      
      appStore.setTheme('light')
      expect(appStore.theme).toBe('light')
    })

    it('应该更新DOM属性', () => {
      appStore.setTheme('dark')
      
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark')
    })
  })

  describe('setLanguage', () => {
    it('应该设置语言', () => {
      appStore.setLanguage('en-US')
      expect(appStore.language).toBe('en-US')
      
      appStore.setLanguage('zh-CN')
      expect(appStore.language).toBe('zh-CN')
    })
  })

  describe('响应式更新', () => {
    it('应该响应式更新所有状态', () => {
      // 设置多个状态
      appStore.setGlobalLoading(true)
      appStore.setOnlineStatus(false)
      appStore.setTheme('dark')
      appStore.setLanguage('en-US')
      
      // 验证所有状态都正确设置
      expect(appStore.globalLoading).toBe(true)
      expect(appStore.onlineStatus).toBe(false)
      expect(appStore.theme).toBe('dark')
      expect(appStore.language).toBe('en-US')
    })
  })
})