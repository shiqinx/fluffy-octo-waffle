// @/config/map.js - 保持原有所有坐标不变
import { getAmapKey, useMock } from '@/utils/env'
import { useUserStore } from '@/stores/userStore'

export const mapConfig = {
  amapKey: getAmapKey(),
  mapStyle: 'amap://styles/normal',
  useMockMap: useMock()
}

// 广东药科大学云浮校区中心坐标
export const campusCenter = [112.184488, 23.028501]

// 所有建筑物坐标 - 保持所有原有坐标
export const campusBuildings = {
  // 校门区域
  northGate1: { name: '北门1', coords: [112.183194, 23.033773], type: 'gate', address: '广东药科大学云浮校区北门1' },
  northMainGate: { name: '北正门', coords: [112.186375, 23.032386], type: 'gate', address: '广东药科大学云浮校区北正门' },
  southGate: { name: '北门2', coords: [112.188208, 23.031797], type: 'gate', address: '广东药科大学云浮校区东北门' },
  westGate: { name: '西门', coords: [112.180735, 23.032588], type: 'gate', address: '广东药科大学云浮校区西门' },

  // 教学区域
  publicTeachingBuilding: { name: '公共教学楼', coords: [112.184746, 23.031159], type: 'teaching', address: '广东药科大学云浮校区公共教学楼' },
  softwareCollege: { name: '软件学院', coords: [112.18646, 23.030065], type: 'teaching', address: '广东药科大学云浮校区软件学院' },
  healthCollege: { name: '健康学院', coords: [112.186694, 23.030927], type: 'teaching', address: '广东药科大学云浮校区健康学院' },
  nursingCollege: { name: '护理学院', coords: [112.186973, 23.031176], type: 'teaching', address: '广东药科大学云浮校区护理学院' },
  chineseMedicineCollege: { name: '中医学院', coords: [112.18427, 23.032529], type: 'teaching', address: '广东药科大学云浮校区中医学院' },

  // 行政与会议中心
  adminBuilding: { name: '行政楼', coords: [112.1856, 23.032217], type: 'admin', address: '广东药科大学云浮校区行政楼' },
  allianceBuilding: { name: '联盟大楼交流中心', coords: [112.183354, 23.033347], type: 'admin', address: '广东药科大学云浮校区联盟大楼交流中心' },
  conferenceCenter: { name: '会议中心', coords: [112.181995, 23.03375], type: 'admin', address: '广东药科大学云浮校区会议中心' },

  // 实验楼区域
  publicLabBuilding: { name: '公共实验楼', coords: [112.186292, 23.02895], type: 'lab', address: '广东药科大学云浮校区公共实验楼' },
  southMedicineCenter: { name: '南药中心创新创业大楼', coords: [112.182189, 23.032642], type: 'lab', address: '广东药科大学云浮校区南药中心创新创业大楼' },
  specimenCenter: { name: '解剖标本中心', coords: [112.18114, 23.028552], type: 'lab', address: '广东药科大学云浮校区解剖标本中心' },

  // 图书馆
  library: { name: '图书馆', coords: [112.184995, 23.029221], type: 'library', address: '广东药科大学云浮校区图书馆' },

  // 宿舍区域
  dormitory1: { name: '1栋宿舍', coords: [112.182669, 23.031494], type: 'dorm', address: '广东药科大学云浮校区1栋宿舍' },
  dormitory2: { name: '2栋宿舍', coords: [112.182387, 23.030895], type: 'dorm', address: '广东药科大学云浮校区2栋宿舍' },
  dormitory3: { name: '3栋宿舍', coords: [112.181769, 23.031784], type: 'dorm', address: '广东药科大学云浮校区3栋宿舍' },
  dormitory4: { name: '4栋宿舍', coords: [112.181487, 23.031315], type: 'dorm', address: '广东药科大学云浮校区4栋宿舍' },
  dormitory5: { name: '5栋宿舍', coords: [112.181521, 23.030926], type: 'dorm', address: '广东药科大学云浮校区5栋宿舍' },
  dormitory6: { name: '6栋宿舍', coords: [112.181333, 23.030425], type: 'dorm', address: '广东药科大学云浮校区6栋宿舍' },
  dormitory7: { name: '7栋宿舍', coords: [112.180584, 23.030391], type: 'dorm', address: '广东药科大学云浮校区7栋宿舍' },
  dormitory8: { name: '8栋宿舍', coords: [112.187933, 23.029267], type: 'dorm', address: '广东药科大学云浮校区8栋宿舍' },
  dormitory9: { name: '9栋宿舍', coords: [112.187692, 23.028698], type: 'dorm', address: '广东药科大学云浮校区9栋宿舍' },
  dormitory10: { name: '10栋宿舍', coords: [112.187205, 23.027683], type: 'dorm', address: '广东药科大学云浮校区10栋宿舍' },
  dormitory11: { name: '11栋宿舍', coords: [112.188875, 23.028932], type: 'dorm', address: '广东药科大学云浮校区11栋宿舍' },
  dormitory12: { name: '12栋宿舍', coords: [112.188571, 23.028364], type: 'dorm', address: '广东药科大学云浮校区12栋宿舍' },
  dormitory13: { name: '13栋宿舍', coords: [112.188296, 23.027821], type: 'dorm', address: '广东药科大学云浮校区13栋宿舍' },

  // 食堂
  canteen1: { name: '第一饭堂', coords: [112.183267, 23.030617], type: 'dining', address: '广东药科大学云浮校区第一饭堂' },
  canteen2: { name: '第二饭堂', coords: [112.18743, 23.028167], type: 'dining', address: '广东药科大学云浮校区第二饭堂' },

  // 体育设施
  sportsField: { name: '田径场', coords: [112.188269, 23.030470], type: 'sports', address: '广东药科大学云浮校区田径场' },
  stadium: { name: '看台', coords: [112.188004, 23.030727], type: 'sports', address: '广东药科大学云浮校区看台' },
  basketballCourt1: { name: '篮球场1', coords: [112.183426, 23.032266], type: 'sports', address: '广东药科大学云浮校区篮球场1' },
  basketballCourt2: { name: '篮球场2', coords: [112.180698, 23.03204], type: 'sports', address: '广东药科大学云浮校区篮球场2' },
  basketballCourt3: { name: '篮球场3', coords: [112.188755, 23.031124], type: 'sports', address: '广东药科大学云浮校区篮球场3' },
  tennisCourt: { name: '网球场', coords: [112.180248, 23.031523], type: 'sports', address: '广东药科大学云浮校区网球场' },

  // 公交站
  busStation: { name: '广东药科大学公交站', coords: [112.184049, 23.033577], type: 'transport', address: '广东药科大学云浮校区公交站' },

  // 未开放区域
  closedArea: { name: '未开放区域', coords: [112.186728, 23.02684], type: 'other', address: '广东药科大学云浮校区未开放区域' }
}

// 模拟活动数据
// 注意：不要在模块顶层使用store，会导致初始化错误
export const mockActivities = [
  {
    id: 1,
    title: '中医养生讲座',
    type: '学术讲座',
    description: '邀请著名中医专家讲解传统养生知识，包括四季养生、食疗养生、运动养生等内容。现场还有免费中医体质检测服务。',
    location: '学术报告厅',
    coordinates: [116.301777, 39.982803],
    startTime: '2024-12-20T14:00:00',
    endTime: '2024-12-20T16:30:00',
    status: 'upcoming',
    maxParticipants: 200,
    currentParticipants: 156,
    organizer: {
      id: 1,
      name: '中医学院',
      avatar: '',
      type: 'organization'
    },
    images: ['https://picsum.photos/seed/medicine2024/400/300.jpg'],
    tags: ['健康', '养生', '中医', '讲座'],
    requirements: '无需报名，直接参加',
    fee: '免费',
    createdAt: '2024-12-15T10:00:00',
    updatedAt: '2024-12-18T16:30:00'
  },
  {
    id: 2,
    title: '摄影作品展览',
    type: '文化艺术',
    description: '展示我校摄影爱好者的优秀作品，包括校园风光、人物肖像、纪实摄影等多个类别。开幕式将有专业摄影师现场分享拍摄技巧。',
    location: '艺术展览中心',
    coordinates: [116.302777, 39.983803],
    startTime: '2024-12-21T10:00:00',
    endTime: '2024-12-25T18:00:00',
    status: 'upcoming',
    maxParticipants: 500,
    currentParticipants: 234,
    organizer: {
      id: 2,
      name: '摄影协会',
      avatar: '',
      type: 'organization'
    },
    images: ['https://picsum.photos/seed/photo2024/400/300.jpg'],
    tags: ['摄影', '艺术', '展览', '文化'],
    requirements: '无需报名，自由参观',
    fee: '免费',
    createdAt: '2024-12-14T09:00:00',
    updatedAt: '2024-12-18T14:20:00'
  },
  {
    id: 3,
    title: '编程马拉松大赛',
    type: '科技创新',
    description: '48小时编程挑战赛，主题为"智慧校园"。参赛者需要在规定时间内完成创新项目开发，优胜团队将获得丰厚奖品和实习机会。',
    location: '创新实验室',
    coordinates: [116.303777, 39.984803],
    startTime: '2024-12-22T09:00:00',
    endTime: '2024-12-24T09:00:00',
    status: 'upcoming',
    maxParticipants: 100,
    currentParticipants: 87,
    organizer: {
      id: 3,
      name: '计算机学院',
      avatar: '',
      type: 'organization'
    },
    images: ['https://picsum.photos/seed/coding2024/400/300.jpg'],
    tags: ['编程', '创新', '比赛', '技术'],
    requirements: '具备基础编程能力，组队参加',
    fee: '50元/队',
    createdAt: '2024-12-10T11:00:00',
    updatedAt: '2024-12-18T15:45:00'
  },
  {
    id: 4,
    title: '篮球友谊赛',
    type: '体育竞技',
    description: '院系间篮球友谊赛，促进各院系交流。比赛采用国际篮联规则，设有MVP奖项和最佳团队奖。',
    location: '体育馆',
    coordinates: [116.304777, 39.985803],
    startTime: '2024-12-23T16:00:00',
    endTime: '2024-12-23T18:00:00',
    status: 'upcoming',
    maxParticipants: 200,
    currentParticipants: 178,
    organizer: {
      id: 4,
      name: '体育部',
      avatar: '',
      type: 'organization'
    },
    images: ['https://picsum.photos/seed/basketball2024/400/300.jpg'],
    tags: ['篮球', '体育', '比赛', '友谊赛'],
    requirements: '穿着运动装备，提前15分钟到场',
    fee: '免费',
    createdAt: '2024-12-16T13:30:00',
    updatedAt: '2024-12-18T17:00:00'
  },
  {
    id: 5,
    title: '校园音乐节',
    type: '文艺演出',
    description: '年度校园音乐盛典，邀请校内知名乐队和校外专业音乐人同台演出。涵盖摇滚、民谣、流行等多种音乐风格。',
    location: '大学生活动中心',
    coordinates: [116.305777, 39.986803],
    startTime: '2024-12-24T19:00:00',
    endTime: '2024-12-24T22:30:00',
    status: 'upcoming',
    maxParticipants: 1000,
    currentParticipants: 856,
    organizer: {
      id: 5,
      name: '学生会文艺部',
      avatar: '',
      type: 'organization'
    },
    images: ['https://picsum.photos/seed/music2024/400/300.jpg'],
    tags: ['音乐', '演出', '文艺', '音乐节'],
    requirements: '凭票入场，一人一票',
    fee: '20元/人',
    createdAt: '2024-12-12T10:15:00',
    updatedAt: '2024-12-18T16:30:00'
  },
  {
    id: 6,
    title: '图书馆学习小组',
    type: '学习交流',
    description: '为期一周的集中学习活动，提供安静的学习环境和专业的学习指导。每日有不同学科的老师现场答疑。',
    location: '图书馆研讨室',
    coordinates: [116.306777, 39.987803],
    startTime: '2024-12-19T09:00:00',
    endTime: '2024-12-25T21:00:00',
    status: 'ongoing',
    maxParticipants: 50,
    currentParticipants: 42,
    organizer: {
      id: 6,
      name: '图书馆',
      avatar: '',
      type: 'organization'
    },
    images: ['https://picsum.photos/seed/study2024/400/300.jpg'],
    tags: ['学习', '图书馆', '研讨', '交流'],
    requirements: '需预约座位，遵守图书馆规定',
    fee: '免费',
    createdAt: '2024-12-15T08:00:00',
    updatedAt: '2024-12-18T12:00:00'
  }
]

// 提供一个函数，让组件在需要时传入当前用户信息来获取个性化的活动数据
export function getPersonalizedActivities(currentUserId, currentUserName) {
  // 根据用户ID生成不同的活动状态，确保不同用户看到的数据不同
  return mockActivities.map((activity, index) => {
    // 根据用户ID和活动索引生成一致的状态
    // 确保正确处理字符串类型的用户ID
    const userSeed = currentUserId ? parseInt(currentUserId.toString()) : 1
    const activityIndex = index + 1
    
    // 为特定活动设置当前用户为组织者（确保每个用户至少有1-2个创建的活动）
    // 用户1创建活动1和5，用户2创建活动2和6，以此类推
    const isOrganizer = (activityIndex === userSeed) || (activityIndex === (userSeed + 4) % 6 + 1)
    
    // 为其他活动设置报名状态（确保每个用户至少有2-3个报名的活动）
    // 排除自己创建的活动
    const isEnrolled = !isOrganizer && (
      (activityIndex === (userSeed % 6) + 1) || 
      (activityIndex === (userSeed + 2) % 6 + 1) ||
      (activityIndex === (userSeed + 5) % 6 + 1)
    )
    
    // 个性化的审批状态
    const isApproved = isEnrolled && activityIndex % 2 === 0
    
    // 如果是组织者，修改组织者信息为当前用户，但保持活动标题不变
    const organizer = isOrganizer 
      ? { id: currentUserId, name: currentUserName || '我', avatar: '', type: 'organization' }
      : activity.organizer
    
    // 调试输出，帮助理解数据生成逻辑
    console.log(`用户${currentUserId}的活动${activity.id}(${activity.title}): isOrganizer=${isOrganizer}, isEnrolled=${isEnrolled}, isApproved=${isApproved}`)
    
    return {
      ...activity,
      // 保持原始标题不变
      title: activity.title,
      // 更新组织者信息
      organizer,
      // 添加组织者ID（兼容性）
      organizerId: organizer.id,
      // 个性化状态
      isEnrolled,
      isApproved,
      // 添加当前参与者数
      currentParticipants: activity.currentParticipants + (isEnrolled ? 1 : 0),
      // 添加活动状态
      status: activity.currentParticipants >= activity.maxParticipants ? 'full' : 'recruiting'
    }
  })
}

export const useMockMap = useMock()