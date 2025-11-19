// 强制清理活动数据污染的脚本
console.log('🧹 开始强制清理活动数据污染...')

// 1. 清理localStorage中的活动数据
console.log('🗑️ 清理localStorage中的活动数据')
localStorage.removeItem('campus_activities')

// 2. 验证清理结果
const afterCleanup = localStorage.getItem('campus_activities')
if (afterCleanup) {
  console.warn('⚠️ 清理失败，localStorage中仍有数据:', afterCleanup)
} else {
  console.log('✅ localStorage清理成功')
}

// 3. 刷新页面以重新加载干净的数据
console.log('🔄 3秒后自动刷新页面...')
setTimeout(() => {
  console.log('🔄 正在刷新页面...')
  window.location.reload()
}, 3000)

// 4. 显示清理状态
console.log('📊 清理状态:')
console.log('  - localStorage已清理:', !localStorage.getItem('campus_activities'))
console.log('  - 即将刷新页面重新加载数据')