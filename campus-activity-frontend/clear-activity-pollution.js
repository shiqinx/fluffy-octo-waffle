// 清理活动数据污染问题
console.log('🔧 开始清理活动数据污染...')

// 清理localStorage中的损坏数据
function clearCorruptedData() {
    try {
        // 检查并清理所有相关的localStorage键
        const keysToCheck = [
            'campus_activities',
            'activities',
            'activity_data',
            'user_activities',
            'enrollments'
        ]
        
        keysToCheck.forEach(key => {
            const data = localStorage.getItem(key)
            if (data) {
                try {
                    const parsed = JSON.parse(data)
                    if (Array.isArray(parsed)) {
                        // 检查是否所有活动都是同一个标题
                        const titles = parsed.map(item => item.title || item.name)
                        const uniqueTitles = [...new Set(titles)]
                        
                        if (uniqueTitles.length === 1 && uniqueTitles[0] === '中医养生讲座') {
                            console.log(`🗑️ 检测到 ${key} 中的数据污染，清理中...`)
                            localStorage.removeItem(key)
                            console.log(`✅ 已清理 ${key} 中的损坏数据`)
                        }
                    }
                } catch (parseError) {
                    console.log(`🗑️ ${key} 数据格式异常，清理中...`)
                    localStorage.removeItem(key)
                }
            }
        })
        
        console.log('🎉 数据清理完成！')
        
        // 重新加载页面以获取新的数据
        setTimeout(() => {
            console.log('🔄 重新加载页面...')
            window.location.reload()
        }, 1000)
        
    } catch (error) {
        console.error('❌ 清理数据时出错:', error)
    }
}

// 立即执行清理
clearCorruptedData()