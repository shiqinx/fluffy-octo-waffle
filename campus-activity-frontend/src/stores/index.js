// @/stores/index.js
// 如果这个文件存在，确保它正确导出所有 store

export { useActivityStore } from './activity'
export { useTeamStore } from './team'
export { useAuthStore } from './auth'
export { useMessageStore } from './message'
// 添加其他需要的 store

// 或者如果使用统一导出方式
import { useActivityStore } from './activity'
import { useTeamStore } from './team'
import { useAuthStore } from './auth'
import { useMessageStore } from './message'

export {
  useActivityStore,
  useTeamStore,
  useAuthStore,
  useMessageStore
}