// 测试活动数据筛选逻辑
import { getPersonalizedActivities } from './src/config/map.js'

// 模拟当前用户信息
const currentUserId = '1'
const currentUserName = '张三'

console.log('=== 测试活动数据筛选逻辑 ===')
console.log(`当前用户: ${currentUserName} (ID: ${currentUserId})`)

// 获取个性化活动数据
const allActivities = getPersonalizedActivities(currentUserId, currentUserName)

console.log('\n=== 所有活动数据 ===')
allActivities.forEach(activity => {
  console.log(`活动${activity.id}: ${activity.title}`)
  console.log(`  - 组织者ID: ${activity.organizer?.id} / ${activity.organizerId}`)
  console.log(`  - 是否报名: ${activity.isEnrolled}`)
  console.log(`  - 是否收藏: ${activity.isFavorite}`)
  console.log(`  - 是否已审批: ${activity.isApproved}`)
  console.log('')
})

// 筛选我发布的活动
const createdActivities = allActivities.filter(activity => 
  activity.organizer?.id === currentUserId || activity.organizerId === currentUserId
)

// 筛选我报名的活动（排除自己创建的）
const enrolledActivities = allActivities.filter(activity => 
  activity.isEnrolled && 
  activity.organizer?.id !== currentUserId && 
  activity.organizerId !== currentUserId
)

// 筛选我收藏的活动（排除自己创建的）
const favoriteActivities = allActivities.filter(activity => 
  activity.isFavorite && 
  activity.organizer?.id !== currentUserId && 
  activity.organizerId !== currentUserId
)

console.log('\n=== 筛选结果 ===')
console.log(`我发布的活动 (${createdActivities.length}个):`)
createdActivities.forEach(activity => {
  console.log(`  - ${activity.title}`)
})

console.log(`\n我报名的活动 (${enrolledActivities.length}个):`)
enrolledActivities.forEach(activity => {
  console.log(`  - ${activity.title}`)
})

console.log(`\n我收藏的活动 (${favoriteActivities.length}个):`)
favoriteActivities.forEach(activity => {
  console.log(`  - ${activity.title}`)
})

// 检查是否有重复
const allTitles = [
  ...createdActivities.map(a => a.title),
  ...enrolledActivities.map(a => a.title),
  ...favoriteActivities.map(a => a.title)
]

const duplicates = allTitles.filter((title, index) => allTitles.indexOf(title) !== index)
if (duplicates.length > 0) {
  console.log('\n⚠️  发现重复活动:', duplicates)
} else {
  console.log('\n✅ 没有重复活动')
}