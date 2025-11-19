// 直接在浏览器控制台执行的清理脚本
console.log('🚀 开始强制清理活动数据污染...')

// 1. 清理localStorage
console.log('🗑️ 清理localStorage中的活动数据')
localStorage.removeItem('campus_activities')

// 2. 设置正确的默认数据
const correctActivities = [
    {
        id: 1,
        title: '中医养生讲座',
        type: 'study',
        locationName: '学术报告厅',
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        currentParticipants: 15,
        maxParticipants: 30
    },
    {
        id: 2,
        title: '摄影作品展览',
        type: 'culture',
        locationName: '艺术展厅',
        startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        currentParticipants: 12,
        maxParticipants: 25
    },
    {
        id: 3,
        title: '编程马拉松大赛',
        type: 'tech',
        locationName: '创新实验室',
        startTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        currentParticipants: 8,
        maxParticipants: 20
    },
    {
        id: 4,
        title: '音乐节',
        type: 'culture',
        locationName: '露天剧场',
        startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        currentParticipants: 25,
        maxParticipants: 40
    },
    {
        id: 5,
        title: '篮球友谊赛',
        type: 'sports',
        locationName: '篮球场1',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        currentParticipants: 4,
        maxParticipants: 8
    }
]

// 3. 保存正确的数据到localStorage
localStorage.setItem('campus_activities', JSON.stringify(correctActivities))

console.log('✅ 数据清理和修复完成！')
console.log('📋 已保存的活动数据:')
correctActivities.forEach((activity, index) => {
    console.log(`  ${index + 1}. ${activity.title} (${activity.type})`)
})

// 4. 刷新页面
console.log('🔄 正在刷新页面...')
window.location.reload()