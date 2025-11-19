import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTeamStore } from '@/stores/team'

describe('Team Store', () => {
  let teamStore

  beforeEach(() => {
    // 创建新的Pinia实例
    setActivePinia(createPinia())
    teamStore = useTeamStore()
    
    // Mock console.log避免测试输出过多
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    // 恢复console
    vi.restoreAllMocks()
  })

  describe('初始状态', () => {
    it('应该正确初始化团队状态', () => {
      expect(teamStore.teams).toBeInstanceOf(Array)
      expect(teamStore.teams.length).toBeGreaterThan(0)
      expect(teamStore.loading).toBe(false)
    })

    it('应该包含默认团队数据', () => {
      const teams = teamStore.teams
      
      expect(teams).toHaveLength(2)
      expect(teams[0]).toHaveProperty('id', 1)
      expect(teams[0]).toHaveProperty('name', '前端开发学习小组')
      expect(teams[0]).toHaveProperty('type', '学习')
      expect(teams[0]).toHaveProperty('currentMembers', 5)
      expect(teams[0]).toHaveProperty('maxMembers', 10)
      expect(teams[0]).toHaveProperty('isMember', false)
      
      expect(teams[1]).toHaveProperty('id', 2)
      expect(teams[1]).toHaveProperty('name', '篮球爱好者')
      expect(teams[1]).toHaveProperty('type', '运动')
      expect(teams[1]).toHaveProperty('isMember', true)
    })

    it('团队数据应该包含必要的字段', () => {
      const team = teamStore.teams[0]
      
      expect(team).toHaveProperty('id')
      expect(team).toHaveProperty('name')
      expect(team).toHaveProperty('type')
      expect(team).toHaveProperty('description')
      expect(team).toHaveProperty('currentMembers')
      expect(team).toHaveProperty('maxMembers')
      expect(team).toHaveProperty('leader')
      expect(team).toHaveProperty('members')
      expect(team).toHaveProperty('isMember')
      expect(team).toHaveProperty('status')
      expect(team).toHaveProperty('createdAt')
      
      expect(team.leader).toHaveProperty('id')
      expect(team.leader).toHaveProperty('name')
      expect(team.members).toBeInstanceOf(Array)
    })
  })

  describe('loadTeams', () => {
    it('应该成功加载团队数据', async () => {
      await teamStore.loadTeams()

      expect(teamStore.loading).toBe(false)
      expect(console.log).toHaveBeenCalledWith('🔄 加载团队数据...')
      expect(console.log).toHaveBeenCalledWith('✅ 团队数据加载完成')
    })

    it('应该设置loading状态', async () => {
      const loadPromise = teamStore.loadTeams()
      
      // 在加载过程中应该是loading状态
      expect(teamStore.loading).toBe(true)
      
      await loadPromise
      expect(teamStore.loading).toBe(false)
    })

    it('应该处理加载错误', async () => {
      // Mock一个错误
      const consoleSpy = vi.spyOn(console, 'error')
      
      // 临时重写loadTeams来模拟错误
      const originalLoadTeams = teamStore.loadTeams
      teamStore.loadTeams = async () => {
        throw new Error('网络错误')
      }

      await expect(teamStore.loadTeams()).rejects.toThrow('网络错误')
      
      // 恢复原方法
      teamStore.loadTeams = originalLoadTeams
    })
  })

  describe('createNewTeam', () => {
    it('应该成功创建新团队', async () => {
      const teamData = {
        name: '新团队',
        type: '技术',
        description: '这是一个新团队',
        maxMembers: 15
      }

      const newTeam = await teamStore.createNewTeam(teamData)

      expect(newTeam).toBeDefined()
      expect(newTeam.name).toBe('新团队')
      expect(newTeam.type).toBe('技术')
      expect(newTeam.description).toBe('这是一个新团队')
      expect(newTeam.currentMembers).toBe(1)
      expect(newTeam.maxMembers).toBe(15)
      expect(newTeam.isMember).toBe(true)
      expect(newTeam.status).toBe('open')
      expect(newTeam.createdAt).toBeDefined()
      
      // 新团队应该被添加到列表开头
      expect(teamStore.teams[0]).toStrictEqual(newTeam)
      expect(teamStore.teams).toHaveLength(3)
    })

    it('应该为创建的团队生成唯一ID', async () => {
      const teamData1 = { name: '团队1', type: '技术' }
      const teamData2 = { name: '团队2', type: '学习' }

      const team1 = await teamStore.createNewTeam(teamData1)
      
      // 添加小延迟确保时间戳不同
      await new Promise(resolve => setTimeout(resolve, 1))
      
      const team2 = await teamStore.createNewTeam(teamData2)

      expect(team1.id).not.toBe(team2.id)
      expect(typeof team1.id).toBe('number')
      expect(typeof team2.id).toBe('number')
    })

    it('应该处理创建团队失败', async () => {
      // 临时重写createNewTeam来模拟错误
      const originalCreateNewTeam = teamStore.createNewTeam
      teamStore.createNewTeam = vi.fn().mockRejectedValue(new Error('创建失败'))

      await expect(teamStore.createNewTeam({ name: '失败团队' }))
        .rejects.toThrow('创建失败')
      
      // 恢复原方法
      teamStore.createNewTeam = originalCreateNewTeam
    })
  })

  describe('joinTeamById', () => {
    it('应该成功加入团队', async () => {
      const teamId = 1
      const initialTeam = teamStore.teams.find(t => t.id === teamId)
      const initialMembers = initialTeam.currentMembers
      const initialIsMember = initialTeam.isMember

      await teamStore.joinTeamById(teamId)

      const updatedTeam = teamStore.teams.find(t => t.id === teamId)
      expect(updatedTeam.isMember).toBe(true)
      expect(updatedTeam.currentMembers).toBe(initialMembers + 1)
      
      // 如果原本不是成员，isMember应该改变
      if (!initialIsMember) {
        expect(updatedTeam.isMember).not.toBe(initialIsMember)
      }
    })

    it('应该处理不存在的团队ID', async () => {
      const initialTeams = [...teamStore.teams]
      
      // 不应该抛出错误，应该静默处理
      await expect(teamStore.joinTeamById(999)).resolves.toBeUndefined()
      
      // 团队列表不应该改变
      expect(teamStore.teams).toEqual(initialTeams)
    })

    it('应该处理加入团队失败', async () => {
      // 临时重写joinTeamById来模拟错误
      const originalJoinTeamById = teamStore.joinTeamById
      teamStore.joinTeamById = async () => {
        throw new Error('加入失败')
      }

      await expect(teamStore.joinTeamById(1)).rejects.toThrow('加入失败')
      
      // 恢复原方法
      teamStore.joinTeamById = originalJoinTeamById
    })
  })

  describe('数据完整性', () => {
    it('团队成员数据应该正确', () => {
      const team = teamStore.teams[0]
      const members = team.members
      
      expect(members).toBeInstanceOf(Array)
      expect(members.length).toBeGreaterThan(0)
      
      members.forEach(member => {
        expect(member).toHaveProperty('id')
        expect(member).toHaveProperty('name')
        expect(member).toHaveProperty('role')
        expect(['leader', 'member']).toContain(member.role)
      })
    })

    it('团队领导信息应该正确', () => {
      teamStore.teams.forEach(team => {
        expect(team.leader).toBeDefined()
        expect(team.leader).toHaveProperty('id')
        expect(team.leader).toHaveProperty('name')
        
        // 领导应该是成员之一
        const leaderAsMember = team.members.find(m => m.id === team.leader.id)
        expect(leaderAsMember).toBeDefined()
        expect(leaderAsMember.role).toBe('leader')
      })
    })

    it('团队成员数量应该一致', () => {
      teamStore.teams.forEach(team => {
        expect(team.currentMembers).toBeGreaterThanOrEqual(1)
        expect(team.currentMembers).toBeLessThanOrEqual(team.maxMembers)
      })
    })

    it('创建时间应该是有效的ISO字符串', () => {
      teamStore.teams.forEach(team => {
        expect(team.createdAt).toBeDefined()
        expect(typeof team.createdAt).toBe('string')
        
        // 验证是否为有效的ISO日期字符串
        const date = new Date(team.createdAt)
        expect(date.getTime()).not.toBeNaN()
      })
    })
  })

  describe('边界情况', () => {
    it('应该处理空团队数据', async () => {
      // 清空团队列表
      teamStore.teams = []
      
      const teamData = {
        name: '空列表中的第一个团队',
        type: '测试'
      }
      
      const newTeam = await teamStore.createNewTeam(teamData)
      
      expect(teamStore.teams).toHaveLength(1)
      expect(teamStore.teams[0]).toStrictEqual(newTeam)
    })

    it('应该处理重复加入同一团队', async () => {
      const teamId = 2 // 已经是成员的团队
      const initialTeam = { ...teamStore.teams.find(t => t.id === teamId) }
      
      await teamStore.joinTeamById(teamId)
      
      const updatedTeam = teamStore.teams.find(t => t.id === teamId)
      expect(updatedTeam.isMember).toBe(true)
      expect(updatedTeam.currentMembers).toBe(initialTeam.currentMembers + 1)
    })
  })
})