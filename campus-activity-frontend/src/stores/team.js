import { defineStore } from 'pinia'
import { ref } from 'vue'
import { teamAPI } from '@/api/team'

export const useTeamStore = defineStore('team', () => {
  const teams = ref([])
  const myTeams = ref([])
  const currentTeam = ref(null)

  // 随机组队 - 对应随机组队功能
  const randomTeamMatch = async (preferences) => {
    const response = await teamAPI.randomMatch(preferences)
    return response
  }

  // 创建团队
  const createTeam = async (teamData) => {
    const response = await teamAPI.create(teamData)
    return response
  }

  // 邀请加入团队
  const inviteToTeam = async (teamId, userId) => {
    const response = await teamAPI.invite(teamId, userId)
    return response
  }

  // 审核加入申请
  const reviewApplication = async (applicationId, approved) => {
    const response = await teamAPI.review(applicationId, approved)
    return response
  }

  return {
    teams,
    myTeams,
    currentTeam,
    randomTeamMatch,
    createTeam,
    inviteToTeam,
    reviewApplication
  }
})