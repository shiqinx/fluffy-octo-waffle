// @/stores/team.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

const useTeamStore = defineStore('team', () => {
  const teams = ref([
    {
      id: 1,
      name: '前端开发学习小组',
      type: '学习',
      description: '共同学习前端开发技术，分享项目经验',
      currentMembers: 5,
      maxMembers: 10,
      leader: { id: 1, name: '张三', avatar: '' },
      members: [
        { id: 1, name: '张三', avatar: '', role: 'leader' },
        { id: 2, name: '李四', avatar: '', role: 'member' }
      ],
      isMember: false,
      status: 'open',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      name: '篮球爱好者',
      type: '运动',
      description: '每周固定篮球活动，欢迎加入',
      currentMembers: 8,
      maxMembers: 15,
      leader: { id: 2, name: '李四', avatar: '' },
      members: [
        { id: 2, name: '李四', avatar: '', role: 'leader' },
        { id: 4, name: '赵六', avatar: '', role: 'member' }
      ],
      isMember: true,
      status: 'open',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ])
  
  const loading = ref(false)

  const loadTeams = async () => {
    loading.value = true
    try {
      console.log('🔄 加载团队数据...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('✅ 团队数据加载完成')
    } catch (error) {
      console.error('加载团队列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const createNewTeam = async (teamData) => {
    try {
      // 生成唯一ID，使用时间戳和随机数确保唯一性
      const generateId = () => {
        return Date.now() + Math.floor(Math.random() * 1000)
      }
      
      const newTeam = {
        id: generateId(),
        ...teamData,
        currentMembers: 1,
        isMember: true,
        status: 'open',
        createdAt: new Date().toISOString()
      }
      teams.value.unshift(newTeam)
      return newTeam
    } catch (error) {
      console.error('创建团队失败:', error)
      throw error
    }
  }

  const joinTeamById = async (teamId) => {
    try {
      const team = teams.value.find(t => t.id === teamId)
      if (team) {
        team.isMember = true
        team.currentMembers += 1
      }
    } catch (error) {
      console.error('加入团队失败:', error)
      throw error
    }
  }

  return {
    teams,
    loading,
    loadTeams,
    createNewTeam,
    joinTeamById
  }
})

export { useTeamStore }
export default useTeamStore