// 测试活动创建和列表显示功能
import { useActivityStore } from './src/stores/activityStore.js'
import { useActivityStore as useLocalActivityStore } from './src/stores/activity.js'

// 模拟测试环境
console.log('🧪 开始测试活动功能...')

// 1. 测试本地store
console.log('\n📋 测试1: 本地activity store')
const localStore = useLocalActivityStore()

// 加载现有活动
await localStore.loadActivities()
console.log('初始活动数量:', localStore.activities.length)

// 创建测试活动
const testActivity = {
  title: '测试活动-' + new Date().toLocaleTimeString(),
  type: 'sports',
  category: 'sports',
  locationName: '测试地点',
  location: {
    name: '测试地点',
    address: '测试地址'
  },
  description: '这是测试活动',
  startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  endTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
  registrationDeadline: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
  currentParticipants: 1,
  maxParticipants: 20,
  organizer: {
    id: 1,
    name: '测试组织者',
    avatar: ''
  },
  distance: 0.5,
  isEnrolled: false,
  isApproved: false,
  status: 'open',
  participants: [],
  enrollments: []
}

try {
  const newActivity = await localStore.createNewActivity(testActivity)
  console.log('✅ 活动创建成功:', newActivity.title)
  console.log('创建后活动数量:', localStore.activities.length)
  console.log('新活动在数组中的位置:', localStore.activities.findIndex(a => a.id === newActivity.id))
} catch (error) {
  console.error('❌ 活动创建失败:', error.message)
}

// 2. 测试主store
console.log('\n📋 测试2: 主activity store')
const mainStore = useActivityStore()

// 重新加载活动
await mainStore.loadActivities()
console.log('主store活动数量:', mainStore.activities.length)

// 检查第一个活动是否是新创建的
if (mainStore.activities.length > 0) {
  const firstActivity = mainStore.activities[0]
  console.log('第一个活动:', firstActivity.title)
  console.log('是否包含"测试活动":', firstActivity.title.includes('测试活动'))
}

// 3. 测试localStorage数据
console.log('\n📋 测试3: localStorage数据')
const storedData = localStorage.getItem('campus_activities')
if (storedData) {
  const activities = JSON.parse(storedData)
  console.log('localStorage中活动数量:', activities.length)
  if (activities.length > 0) {
    console.log('第一个活动标题:', activities[0].title)
  }
} else {
  console.log('localStorage中没有活动数据')
}

console.log('\n🎉 测试完成!')