// 强制清理所有活动相关缓存
console.log('🧹 开始强制清理所有活动相关缓存...')

// 清理所有可能的localStorage键
const keysToRemove = [
    'campus_activities',
    'activity_store_activities', 
    'user_activities',
    'current_activity',
    'activity_detail_cache',
    'activities_cache',
    'mock_activities'
]

let removedCount = 0
keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
        localStorage.removeItem(key)
        console.log(`✅ 已清理: ${key}`)
        removedCount++
    }
})

// 清理sessionStorage
sessionStorage.clear()
console.log('✅ 已清理sessionStorage')

// 清理可能的globalData缓存
if (typeof globalThis !== 'undefined' && globalThis.__campusActivityData) {
    delete globalThis.__campusActivityData
    console.log('✅ 已清理全局数据缓存')
}

console.log(`🎉 清理完成！共清理了 ${removedCount} 个localStorage项`)

// 强制刷新页面以确保数据重新加载
console.log('🔄 3秒后将自动刷新页面...')
setTimeout(() => {
    window.location.reload()
}, 3000)