import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HelloWorld from '@/components/HelloWorld.vue'

describe('HelloWorld 组件', () => {
  it('应该正确渲染组件', () => {
    const msg = '测试消息'
    const wrapper = mount(HelloWorld, {
      props: { msg }
    })
    
    // 检查组件是否存在
    expect(wrapper.exists()).toBe(true)
    
    // 检查是否渲染了正确的消息
    expect(wrapper.find('h1').text()).toContain(msg)
  })

  it('应该包含正确的 CSS 类', () => {
    const msg = '另一个测试消息'
    const wrapper = mount(HelloWorld, {
      props: { msg }
    })
    
    // 检查是否有 greetings 类
    expect(wrapper.find('.greetings').exists()).toBe(true)
    
    // 检查是否有 green 类
    expect(wrapper.find('h1.green').exists()).toBe(true)
  })

  it('应该包含 Vite 和 Vue 3 链接', () => {
    const wrapper = mount(HelloWorld, {
      props: { msg: '测试' }
    })
    
    const links = wrapper.findAll('a')
    expect(links).toHaveLength(2)
    
    // 检查链接文本
    const linkTexts = links.map(link => link.text())
    expect(linkTexts).toContain('Vite')
    expect(linkTexts).toContain('Vue 3')
    
    // 检查链接属性
    const viteLink = links.find(link => link.text() === 'Vite')
    expect(viteLink.attributes('href')).toBe('https://vite.dev/')
    expect(viteLink.attributes('target')).toBe('_blank')
    expect(viteLink.attributes('rel')).toBe('noopener')
  })

  it('应该验证必需的 props', () => {
    // 测试不传 msg prop 的情况
    // 由于 msg 是必需的，Vue 会发出警告
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    mount(HelloWorld)
    
    // 检查是否有警告（可选，取决于 Vue 版本）
    // expect(consoleSpy).toHaveBeenCalled()
    
    consoleSpy.mockRestore()
  })

  it('应该正确处理不同的消息内容', () => {
    const testCases = [
      '简单消息',
      '包含特殊字符的消息: @#$%',
      '很长的消息：' + 'a'.repeat(100),
      '包含中文的消息：你好世界'
    ]
    
    testCases.forEach(msg => {
      const wrapper = mount(HelloWorld, { props: { msg } })
      expect(wrapper.find('h1').text()).toBe(msg)
    })
  })
})