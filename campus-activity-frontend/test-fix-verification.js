// 活动创建和显示修复验证脚本
import { createActivity } from './src/api/activity.js'
import { useActivityStore } from './src/stores/activity.js'

async function testActivityCreationAndDisplay() {
    console.log('🧪 开始测试活动创建和显示功能...')
    
    try {
        // 1. 初始化store
        const activityStore = useActivityStore()
        console.log('✅ Store初始化完成')
        
        // 2. 检查初始状态
        await activityStore.loadActivities()
        const initialCount = activityStore.activities.length
        console.log(`📊 初始活动数量: ${initialCount}`)
        
        // 3. 创建测试活动
        const testActivity = {
            title: `修复验证活动_${Date.now()}`,
            category: 'other',
            description: '用于验证修复效果的测试活动',
            startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
            location: {
                name: '测试地点',
                address: '测试地址'
            },
            maxParticipants: 20,
            requiresApproval: false
        }
        
        console.log('📝 准备创建活动:', testActivity.title)
        
        // 4. 调用创建API
        const response = await createActivity(testActivity)
        
        if (response.success) {
            console.log('✅ 活动创建成功! ID:', response.data.id)
            
            // 5. 立即刷新数据（模拟修复后的逻辑）
            await activityStore.loadActivities()
            const afterCount = activityStore.activities.length
            
            console.log(`📊 刷新后活动数量: ${afterCount}`)
            
            // 6. 检查新活动是否在列表中
            const newActivity = activityStore.activities.find(a => a.id === response.data.id)
            
            if (newActivity) {
                console.log('🎉 测试成功! 新创建的活动已正确显示在列表中')
                console.log('📋 活动信息:', {
                    id: newActivity.id,
                    title: newActivity.title,
                    type: newActivity.type || newActivity.category,
                    location: newActivity.locationName || newActivity.location?.name
                })
                return true
            } else {
                console.log('❌ 测试失败: 新创建的活动未在列表中找到')
                console.log('🔍 当前活动列表:', activityStore.activities.map(a => ({ id: a.id, title: a.title })))
                return false
            }
        } else {
            console.log('❌ 活动创建失败:', response.message)
            return false
        }
        
    } catch (error) {
        console.error('💥 测试过程中发生错误:', error)
        return false
    }
}

// 执行测试
testActivityCreationAndDisplay().then(success => {
    if (success) {
        console.log('🎊 所有测试通过! 修复效果验证成功')
    } else {
        console.log('⚠️ 测试失败，需要进一步检查')
    }
})