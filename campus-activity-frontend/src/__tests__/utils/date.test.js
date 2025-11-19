import { describe, it, expect, vi, beforeEach } from 'vitest'
import { formatTime, formatRelativeTime, isToday, isThisWeek } from '@/utils/date.js'

describe('日期工具函数测试', () => {
  beforeEach(() => {
    // 在每个测试前设置固定的时间，避免测试结果因时间变化而不稳定
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('formatTime 函数', () => {
    it('应该正确格式化日期时间', () => {
      const date = '2024-01-15T14:30:00'
      expect(formatTime(date)).toBe('2024-01-15 14:30')
    })

    it('应该正确格式化仅日期', () => {
      const date = '2024-01-15T14:30:00'
      expect(formatTime(date, 'date')).toBe('2024-01-15')
    })

    it('应该正确格式化仅时间', () => {
      const date = '2024-01-15T14:30:00'
      expect(formatTime(date, 'time')).toBe('14:30')
    })

    it('应该处理 Date 对象', () => {
      const date = new Date('2024-01-15T14:30:00')
      expect(formatTime(date)).toBe('2024-01-15 14:30')
    })

    it('应该处理空值', () => {
      expect(formatTime(null)).toBe('')
      expect(formatTime('')).toBe('')
      expect(formatTime(undefined)).toBe('')
    })

    it('应该处理无效日期', () => {
      expect(formatTime('invalid-date')).toBe('')
      expect(formatTime('not-a-date')).toBe('')
    })

    it('应该正确处理单位数月份和日期', () => {
      const date = '2024-01-05T08:05:00'
      expect(formatTime(date)).toBe('2024-01-05 08:05')
    })

    it('应该使用默认格式 datetime', () => {
      const date = '2024-01-15T14:30:00'
      expect(formatTime(date, 'invalid-format')).toBe('2024-01-15 14:30')
    })
  })

  describe('formatRelativeTime 函数', () => {
    it('应该显示"刚刚"（1分钟内）', () => {
      const now = new Date('2024-01-15T14:30:00')
      vi.setSystemTime(now)
      
      const date = new Date('2024-01-15T14:29:30') // 30秒前
      expect(formatRelativeTime(date)).toBe('刚刚')
    })

    it('应该显示"X分钟前"', () => {
      const now = new Date('2024-01-15T14:30:00')
      vi.setSystemTime(now)
      
      const date = new Date('2024-01-15T14:25:00') // 5分钟前
      expect(formatRelativeTime(date)).toBe('5分钟前')
    })

    it('应该显示"X小时前"', () => {
      const now = new Date('2024-01-15T14:30:00')
      vi.setSystemTime(now)
      
      const date = new Date('2024-01-15T10:30:00') // 4小时前
      expect(formatRelativeTime(date)).toBe('4小时前')
    })

    it('应该显示"X天前"', () => {
      const now = new Date('2024-01-15T14:30:00')
      vi.setSystemTime(now)
      
      const date = new Date('2024-01-13T14:30:00') // 2天前
      expect(formatRelativeTime(date)).toBe('2天前')
    })

    it('应该显示日期（超过一周）', () => {
      const now = new Date('2024-01-15T14:30:00')
      vi.setSystemTime(now)
      
      const date = new Date('2024-01-01T14:30:00') // 超过一周
      expect(formatRelativeTime(date)).toBe('2024-01-01')
    })

    it('应该处理空值', () => {
      expect(formatRelativeTime(null)).toBe('')
      expect(formatRelativeTime('')).toBe('')
      expect(formatRelativeTime(undefined)).toBe('')
    })
  })

  describe('isToday 函数', () => {
    it('应该正确识别今天的日期', () => {
      const now = new Date('2024-01-15T14:30:00')
      vi.setSystemTime(now)
      
      const today = new Date('2024-01-15T10:00:00')
      expect(isToday(today)).toBe(true)
    })

    it('应该正确识别不是今天的日期', () => {
      const now = new Date('2024-01-15T14:30:00')
      vi.setSystemTime(now)
      
      const yesterday = new Date('2024-01-14T14:30:00')
      expect(isToday(yesterday)).toBe(false)
      
      const tomorrow = new Date('2024-01-16T14:30:00')
      expect(isToday(tomorrow)).toBe(false)
    })

    it('应该处理不同时间但同一天的日期', () => {
      const now = new Date('2024-01-15T23:59:59')
      vi.setSystemTime(now)
      
      const earlyMorning = new Date('2024-01-15T00:00:01')
      expect(isToday(earlyMorning)).toBe(true)
    })

    it('应该处理空值', () => {
      expect(isToday(null)).toBe(false)
      expect(isToday('')).toBe(false)
      expect(isToday(undefined)).toBe(false)
    })
  })

  describe('isThisWeek 函数', () => {
    it('应该正确识别本周的日期', () => {
      // 假设今天是周三（2024-01-17，getDay() = 3）
      const now = new Date('2024-01-17T14:30:00')
      vi.setSystemTime(now)
      
      // 本周日（1月14日，本周从周日开始）
      const sunday = new Date('2024-01-14T10:00:00')
      expect(isThisWeek(sunday)).toBe(true)
      
      // 周一
      const monday = new Date('2024-01-15T10:00:00')
      expect(isThisWeek(monday)).toBe(true)
      
      // 本周六（1月20日）
      const saturday = new Date('2024-01-20T10:00:00')
      expect(isThisWeek(saturday)).toBe(true)
    })

    it('应该正确识别不是本周的日期', () => {
      // 假设今天是周三（2024-01-17）
      const now = new Date('2024-01-17T14:30:00')
      vi.setSystemTime(now)
      
      // 上周六（1月13日，不在本周范围内）
      const lastSaturday = new Date('2024-01-13T10:00:00')
      expect(isThisWeek(lastSaturday)).toBe(false)
      
      // 下周日（1月21日）
      const nextSunday = new Date('2024-01-21T10:00:00')
      expect(isThisWeek(nextSunday)).toBe(false)
    })

    it('应该处理跨年的情况', () => {
      // 假设今天是1月2日（周二，getDay() = 2）
      const now = new Date('2024-01-02T14:30:00')
      vi.setSystemTime(now)
      
      // 本周日（12月31日，属于本周）
      const lastYear = new Date('2023-12-31T10:00:00')
      expect(isThisWeek(lastYear)).toBe(true)
      
      // 下周日（1月6日）
      const thisYear = new Date('2024-01-06T10:00:00')
      expect(isThisWeek(thisYear)).toBe(true)
    })

    it('应该处理空值', () => {
      expect(isThisWeek(null)).toBe(false)
      expect(isThisWeek('')).toBe(false)
      expect(isThisWeek(undefined)).toBe(false)
    })
  })
})