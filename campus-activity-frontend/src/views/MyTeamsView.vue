<!-- @/views/MyTeamsView.vue -->
<template>
  <div class="my-teams-view">
    <van-nav-bar title="我的团队" left-arrow @click-left="handleBack">
      <template #right>
        <van-icon name="add-o" @click="createTeam" />
      </template>
    </van-nav-bar>

    <!-- 标签栏 -->
    <div class="tabs-container">
      <van-tabs v-model="activeTab" @change="handleTabChange" sticky line-height="4px">
        <van-tab title="我创建的" name="owned">
          <div class="teams-content">
            <div v-if="loading">
              <van-loading type="spinner" color="#1989fa" />
              <p class="loading-text">加载中...</p>
            </div>
            <div v-else-if="ownedTeams.length === 0">
              <div class="empty-state">
                <van-icon name="friends-o" size="60" color="#c8c9cc" />
                <p class="empty-text">还没有创建过团队</p>
                <van-button type="primary" size="small" @click="createTeam">创建团队</van-button>
              </div>
            </div>
            <div v-else>
              <div
                v-for="team in ownedTeams"
                :key="team.id"
                class="team-card"
                @click="goToTeamDetail(team.id)"
              >
                <div class="team-header">
                  <img :src="team.avatar || defaultTeamAvatar" alt="团队头像" class="team-avatar">
                  <div class="team-info">
                    <h3 class="team-name">{{ team.name }}</h3>
                    <p class="team-description">{{ team.description }}</p>
                  </div>
                </div>
                <div class="team-stats">
                  <div class="stat-item">
                    <span class="stat-number">{{ team.memberCount }}</span>
                    <span class="stat-label">成员数</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">{{ team.activityCount }}</span>
                    <span class="stat-label">活动数</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">{{ team.pendingRequests }}</span>
                    <span class="stat-label" :class="{ 'has-requests': team.pendingRequests > 0 }">入队申请</span>
                  </div>
                </div>
                <div class="team-actions">
                  <van-button size="small" type="primary" @click.stop="manageTeam(team.id)">管理团队</van-button>
                  <van-button size="small" type="default" @click.stop="createTeamActivity(team.id)">发布活动</van-button>
                </div>
              </div>
            </div>
          </div>
        </van-tab>
        <van-tab title="我加入的" name="joined">
          <div class="teams-content">
            <div v-if="loading">
              <van-loading type="spinner" color="#1989fa" />
              <p class="loading-text">加载中...</p>
            </div>
            <div v-else-if="joinedTeams.length === 0">
              <div class="empty-state">
                <van-icon name="friends" size="60" color="#c8c9cc" />
                <p class="empty-text">还没有加入任何团队</p>
                <van-button type="primary" size="small" @click="exploreTeams">浏览团队</van-button>
              </div>
            </div>
            <div v-else>
              <div
                v-for="team in joinedTeams"
                :key="team.id"
                class="team-card"
                @click="goToTeamDetail(team.id)"
              >
                <div class="team-header">
                  <img :src="team.avatar || defaultTeamAvatar" alt="团队头像" class="team-avatar">
                  <div class="team-info">
                    <h3 class="team-name">{{ team.name }}</h3>
                    <p class="team-description">{{ team.description }}</p>
                    <div class="member-role">
                      <span :class="['role-badge', `role-${team.role}`]">
                        {{ getRoleText(team.role) }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="team-stats">
                  <div class="stat-item">
                    <span class="stat-number">{{ team.memberCount }}</span>
                    <span class="stat-label">成员数</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">{{ team.activityCount }}</span>
                    <span class="stat-label">活动数</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">{{ team.joinedDate }}</span>
                    <span class="stat-label">加入时间</span>
                  </div>
                </div>
                <div class="team-actions">
                  <van-button size="small" type="default" v-if="team.role !== 'owner'" @click.stop="contactTeam(team.id)">
                    联系队长
                  </van-button>
                  <van-button size="small" type="danger" @click.stop="leaveTeam(team.id, team.name)">
                    退出团队
                  </van-button>
                </div>
              </div>
            </div>
          </div>
        </van-tab>
        <van-tab title="申请记录" name="requests">
          <div class="teams-content">
            <div v-if="loading">
              <van-loading type="spinner" color="#1989fa" />
              <p class="loading-text">加载中...</p>
            </div>
            <div v-else-if="teamRequests.length === 0">
              <div class="empty-state">
                <van-icon name="chat-o" size="60" color="#c8c9cc" />
                <p class="empty-text">暂无团队申请记录</p>
              </div>
            </div>
            <div v-else>
              <div
                v-for="request in teamRequests"
                :key="request.id"
                class="request-item"
              >
                <div class="request-info">
                  <h4 class="request-team-name">{{ request.teamName }}</h4>
                  <p class="request-time">申请时间：{{ formatTime(request.requestTime) }}</p>
                  <p class="request-message" v-if="request.message">申请留言：{{ request.message }}</p>
                </div>
                <div class="request-status">
                  <span :class="['status-badge', `status-${request.status}`]">
                    {{ getRequestStatusText(request.status) }}
                  </span>
                </div>
                <div class="request-actions" v-if="request.status === 'pending'">
                  <van-button size="small" type="primary" @click="acceptRequest(request.id)">
                    接受
                  </van-button>
                  <van-button size="small" type="default" @click="rejectRequest(request.id)">
                    拒绝
                  </van-button>
                </div>
              </div>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>
    
    <!-- 创建团队弹窗 -->
    <van-popup
      v-model:show="showCreateTeamPopup"
      position="bottom"
      round
      :style="{ height: '80%' }"
    >
      <div class="popup-header">
        <h3>创建团队</h3>
        <van-icon name="close" @click="showCreateTeamPopup = false" />
      </div>
      <div class="popup-content">
        <div class="form-item">
          <div class="form-label">团队名称</div>
          <van-field
            v-model="newTeam.name"
            placeholder="请输入团队名称（2-20字）"
            maxlength="20"
          />
        </div>
        <div class="form-item">
          <div class="form-label">团队描述</div>
          <van-field
            v-model="newTeam.description"
            type="textarea"
            placeholder="请输入团队描述"
            maxlength="200"
            :rows="4"
            show-word-limit
          />
        </div>
        <div class="form-item">
          <div class="form-label">团队类型</div>
          <van-field
            v-model="newTeamTypeText"
            readonly
            placeholder="请选择团队类型"
            :right-icon="'arrow'"
            @click="showTeamTypePicker = true"
          />
          <van-picker
            v-model:show="showTeamTypePicker"
            :columns="teamTypes"
            @confirm="(selectedOptions) => {
              newTeam.type = selectedOptions.selectedValues[0]
              newTeamTypeText.value = selectedOptions.selectedOptions[0]?.text || ''
              showTeamTypePicker = false
            }"
            @cancel="() => { showTeamTypePicker = false }"
          />
        </div>
        <div class="form-item">
          <div class="form-label">团队头像</div>
          <div class="avatar-uploader">
            <div class="upload-avatar" @click="triggerAvatarUpload">
              <img :src="newTeam.avatar || defaultTeamAvatar" alt="团队头像" class="upload-image">
              <div class="upload-overlay">
                <van-icon name="camera" size="24" color="white" />
              </div>
            </div>
            <p class="upload-hint">点击上传团队头像</p>
          </div>
          <input
            ref="teamAvatarInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleTeamAvatarChange"
          />
        </div>
      </div>
      <div class="popup-footer">
        <van-button block type="primary" @click="submitCreateTeam">
          创建团队
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTeamStore } from '@/stores/team'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/auth'
import { showToast, showConfirmDialog, showFailToast } from 'vant'
import { formatTime } from '@/utils/date'
import { getMyTeams, createTeam as createTeamApi, leaveTeam as leaveTeamApi, getTeamJoinRequests, agreeJoinRequest } from '@/api/team'
import { getTeamMembers } from '@/api/belong'

const router = useRouter()
const teamStore = useTeamStore()
const userStore = useUserStore()
const authStore = useAuthStore()

// 默认团队头像
const defaultTeamAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQwIDBDMjEuNzE1NyAwIDEwIDEzLjcxNTcgMTAgMjQuMThDMTAgMjcuNzk1NSAxMS44NjEgMzAgMTMuOTkgMzBMMjAgMzAgMjAgMzZNNTYgMzBMMjggMzAgMjggMzBNMzYgMzBMMzYgMzBNMjQgMzBMNDQgMzAgMzYgMzBNMTUgMTFMNDUgMTFDMzQuOTMgMTEgMTUgMTkgMTUgMzVMMTYgMzVGNTMgMzVMMTMgMzVMMTkgMTlaIiBmaWxsPSIjZmZmZmZmIi8+CjxwYXRoIGQ9Ik0zMCAxMkM0Mi4zMzIgMTIgNTMgMjEuMzczNSA1MyAzMy4zMzY5TDQ4IDQ1QzQ4IDI4LjUgMzggMjAgMjUgMjBMMjAgMjBNMTcgMzJDNDAuMDAyIDMyIDQ3IDQwLjUgNDcgNDQuMzdCOTAgNjAuOTIgNDcgNDQuMzcgNDcgMzJaIiBmaWxsPSIjNjY2NjY2Ii8+Cjwvc3ZnPgo='

// 状态管理
const activeTab = ref('owned')
const loading = ref(false)

// 团队数据
const ownedTeams = ref([])
const joinedTeams = ref([])
const teamRequests = ref([])

// 创建团队相关
const showCreateTeamPopup = ref(false)
const newTeam = reactive({
  name: '',
  description: '',
  type: '',
  avatar: ''
})
const newTeamTypeText = ref('')
const showTeamTypePicker = ref(false)
const teamTypes = [
  { text: '学习小组', value: '学习小组' },
  { text: '兴趣社团', value: '兴趣社团' },
  { text: '运动团队', value: '运动团队' },
  { text: '竞赛小组', value: '竞赛小组' },
  { text: '志愿服务', value: '志愿服务' },
  { text: '其他', value: '其他' }
]
const teamAvatarInput = ref(null)

// 加载我创建的团队
const loadOwnedTeams = async () => {
  loading.value = true
  try {
    // 使用真实API获取我创建的团队
    const response = await getMyTeams({
      userId: authStore.user?.id,
      role: 'owner'
    })
    
    if (response.success && response.data) {
      const teams = response.data.list || []
      
      // 获取每个团队的详细信息和申请数量
      ownedTeams.value = await Promise.all(teams.map(async (team) => {
        // 获取团队成员信息
        let memberCount = team.memberCount || 0
        let pendingRequests = 0
        
        try {
          // 获取团队成员列表
          const membersResponse = await getTeamMembers(team.id)
          if (membersResponse.success) {
            memberCount = membersResponse.data.total || 0
          }
          
          // 获取加入申请（如果是队长）
          const requestsResponse = await getTeamJoinRequests(team.id)
          if (requestsResponse.success) {
            pendingRequests = requestsResponse.data.list?.filter(req => req.status === 'pending').length || 0
          }
        } catch (error) {
          console.warn(`获取团队 ${team.id} 详细信息失败:`, error)
        }
        
        return {
          id: team.id.toString(),
          name: team.name,
          description: team.description,
          avatar: team.avatar || '',
          memberCount: memberCount,
          activityCount: team.activityCount || 0,
          pendingRequests: pendingRequests
        }
      }))
      
      console.log('成功获取我创建的团队:', ownedTeams.value)
    } else {
      throw new Error(response.message || '获取团队列表失败')
    }
  } catch (error) {
    console.error('加载我创建的团队失败:', error)
    showFailToast(error.message || '加载失败，请重试')
    
    // 如果API调用失败，回退到store数据
    await loadOwnedTeamsFromStore()
  } finally {
    loading.value = false
  }
}

// 从store加载团队数据（作为回退方案）
const loadOwnedTeamsFromStore = async () => {
  try {
    await teamStore.loadTeams()
    ownedTeams.value = teamStore.teams.filter(team => 
      [1, 2].includes(team.leader.id)
    ).map(team => ({
      id: team.id.toString(),
      name: team.name,
      description: team.description,
      avatar: team.leader.avatar || '',
      memberCount: team.currentMembers,
      activityCount: Math.floor(Math.random() * 10) + 1,
      pendingRequests: Math.floor(Math.random() * 5)
    }))
  } catch (error) {
    console.error('从store加载团队数据失败:', error)
  }
}

// 加载我加入的团队
const loadJoinedTeams = async () => {
  loading.value = true
  try {
    // 使用真实API获取我加入的团队
    const response = await getMyTeams({
      userId: authStore.user?.id,
      role: 'member'
    })
    
    if (response.success && response.data) {
      const teams = response.data.list || []
      
      joinedTeams.value = await Promise.all(teams.map(async (team) => {
        // 获取团队成员信息
        let memberCount = team.memberCount || 0
        
        try {
          const membersResponse = await getTeamMembers(team.id)
          if (membersResponse.success) {
            memberCount = membersResponse.data.total || 0
          }
        } catch (error) {
          console.warn(`获取团队 ${team.id} 成员信息失败:`, error)
        }
        
        return {
          id: team.id.toString(),
          name: team.name,
          description: team.description,
          avatar: team.avatar || '',
          memberCount: memberCount,
          activityCount: team.activityCount || 0
        }
      }))
      
      console.log('成功获取我加入的团队:', joinedTeams.value)
    } else {
      throw new Error(response.message || '获取团队列表失败')
    }
  } catch (error) {
    console.error('加载我加入的团队失败:', error)
    showFailToast(error.message || '加载失败，请重试')
    
    // 如果API调用失败，回退到store数据
    await loadJoinedTeamsFromStore()
  } finally {
    loading.value = false
  }
}

// 从store加载加入的团队数据（作为回退方案）
const loadJoinedTeamsFromStore = async () => {
  try {
    await teamStore.loadTeams()
    joinedTeams.value = teamStore.teams.filter(team => 
      team.isMember && ![1, 2].includes(team.leader.id)
    ).map(team => ({
      id: team.id.toString(),
      name: team.name,
      description: team.description,
      avatar: team.leader.avatar || '',
      memberCount: team.currentMembers,
      activityCount: Math.floor(Math.random() * 10) + 1,
      role: team.members.find(m => m.id === userStore.userId)?.role || 'member',
      joinedDate: new Date(team.createdAt).toLocaleDateString().replace(/\//g, '-')
    }))
  } catch (error) {
    console.error('从store加载加入的团队数据失败:', error)
  }
}

// 加载团队申请记录
const loadTeamRequests = async () => {
  loading.value = true
  try {
    // 获取我创建的团队的申请记录
    const ownedResponse = await getMyTeams({
      userId: authStore.user?.id,
      role: 'owner'
    })
    
    if (!ownedResponse.success) {
      throw new Error(ownedResponse.message || '获取团队列表失败')
    }
    
    const ownedTeamIds = (ownedResponse.data.list || []).map(team => team.id)
    
    // 获取所有团队的申请记录
    const allRequests = []
    for (const teamId of ownedTeamIds) {
      try {
        const requestsResponse = await getTeamJoinRequests(teamId)
        if (requestsResponse.success && requestsResponse.data.list) {
          allRequests.push(...requestsResponse.data.list.map(req => ({
            ...req,
            teamId: teamId
          })))
        }
      } catch (error) {
        console.warn(`获取团队 ${teamId} 申请记录失败:`, error)
      }
    }
    
    // 转换数据格式
    teamRequests.value = allRequests.map(request => ({
      id: request.id.toString(),
      teamId: request.teamId.toString(),
      teamName: request.teamName || `团队${request.teamId}`,
      applicantId: request.userId.toString(),
      applicantName: request.userName || `用户${request.userId}`,
      applicantAvatar: request.userAvatar || '',
      message: request.message || '',
      status: request.status,
      applyTime: request.createdAt
    }))
    
    console.log('成功获取团队申请记录:', teamRequests.value)
  } catch (error) {
    console.error('加载团队申请记录失败:', error)
    showFailToast(error.message || '加载失败，请重试')
    
    // 如果API调用失败，回退到store数据
    await loadTeamRequestsFromStore()
  } finally {
    loading.value = false
  }
}

// 从store加载团队申请记录（作为回退方案）
const loadTeamRequestsFromStore = async () => {
  try {
    // 模拟申请记录数据，因为teamStore中没有loadJoinRequests方法
    teamRequests.value = [
      {
        id: '1',
        teamId: '1',
        teamName: '前端开发学习小组',
        applicantId: '3',
        applicantName: '王五',
        applicantAvatar: '',
        message: '我想加入学习小组，一起学习前端技术',
        status: 'pending',
        applyTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        teamId: '2',
        teamName: '篮球爱好者',
        applicantId: '5',
        applicantName: '赵七',
        applicantAvatar: '',
        message: '我喜欢打篮球，希望能加入团队',
        status: 'pending',
        applyTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  } catch (error) {
    console.error('从store加载团队申请记录失败:', error)
  }
}

// 处理返回
const handleBack = () => {
  router.back()
}

// 跳转到团队详情
const goToTeamDetail = (teamId) => {
  router.push(`/teams/${teamId}`)
}

// 管理团队
const manageTeam = (teamId) => {
  router.push(`/teams/${teamId}`)
}

// 创建团队活动
const createTeamActivity = (teamId) => {
  router.push(`/activities/create?teamId=${teamId}`)
}

// 浏览团队
const exploreTeams = () => {
  router.push('/teams')
}

// 联系队长
const contactTeam = (teamId) => {
  // 实际项目中这里应该跳转到聊天页面或显示队长信息
  showToast('联系队长功能开发中')
}

// 退出团队
const leaveTeam = async (teamId, teamName) => {
  try {
    await showConfirmDialog({
      title: '确认退出',
      message: `确定要退出"${teamName}"团队吗？`
    })
    
    // 使用真实API退出团队
    const response = await leaveTeamApi(teamId)
    
    if (response.success) {
      showToast('已退出团队')
      // 从列表中移除
      joinedTeams.value = joinedTeams.value.filter(team => team.id !== teamId)
    } else {
      throw new Error(response.message || '退出团队失败')
    }
  } catch (error) {
    if (error.message !== 'cancel') {
      console.error('退出团队失败:', error)
      showFailToast(error.message || '退出失败，请重试')
    }
  }
}

// 接受申请
const acceptRequest = async (requestId) => {
  try {
    await showConfirmDialog({
      title: '确认接受',
      message: '确定要接受这个团队申请吗？'
    })
    
    // 使用真实API接受申请
    const response = await agreeJoinRequest(requestId)
    
    if (response.success) {
      showToast('已同意申请')
      // 更新申请状态
      const request = teamRequests.value.find(r => r.id === requestId)
      if (request) {
        request.status = 'accepted'
      }
      // 刷新相关团队数据
      await loadOwnedTeams()
    } else {
      throw new Error(response.message || '同意申请失败')
    }
  } catch (error) {
    if (error.message !== 'cancel') {
      console.error('接受申请失败:', error)
      showFailToast(error.message || '操作失败，请重试')
    }
  }
}

// 拒绝申请
const rejectRequest = async (requestId) => {
  try {
    await showConfirmDialog({
      title: '确认拒绝',
      message: '确定要拒绝这个团队申请吗？'
    })
    
    // 实际项目中这里应该调用API拒绝申请
    // 目前模拟拒绝成功
    showToast('已拒绝申请')
    
    // 更新申请状态
    const request = teamRequests.value.find(r => r.id === requestId)
    if (request) {
      request.status = 'rejected'
    }
  } catch (error) {
    // 用户取消操作
  }
}

// 获取角色文本
const getRoleText = (role) => {
  const roleMap = {
    owner: '队长',
    admin: '管理员',
    member: '成员'
  }
  return roleMap[role] || '成员'
}

// 获取申请状态文本
const getRequestStatusText = (status) => {
  const statusMap = {
    pending: '待处理',
    accepted: '已接受',
    rejected: '已拒绝'
  }
  return statusMap[status] || status
}

// 处理标签页切换
const handleTabChange = (tab) => {
  activeTab.value = tab
}

// 创建团队
const createTeam = () => {
  showCreateTeamPopup.value = true
}

// 触发团队头像上传
const triggerAvatarUpload = () => {
  teamAvatarInput.value?.click()
}

// 处理团队头像变更
const handleTeamAvatarChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  // 验证文件类型和大小
  if (!file.type.match('image.*')) {
    showToast('请选择图片文件')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast('图片大小不能超过5MB')
    return
  }

  // 预览头像
  const reader = new FileReader()
  reader.onload = (e) => {
    newTeam.avatar = e.target.result
  }
  reader.readAsDataURL(file)
}

// 提交创建团队
const submitCreateTeam = async () => {
  // 表单验证
  if (!newTeam.name.trim()) {
    showToast('请输入团队名称')
    return
  }
  if (newTeam.name.length < 2 || newTeam.name.length > 20) {
    showToast('团队名称长度应为2-20个字符')
    return
  }
  if (!newTeam.description.trim()) {
    showToast('请输入团队描述')
    return
  }
  if (!newTeam.type) {
    showToast('请选择团队类型')
    return
  }

  try {
    loading.value = true
    // 使用真实API创建团队
    const response = await createTeamApi({
      name: newTeam.name.trim(),
      description: newTeam.description.trim(),
      type: newTeam.type,
      avatar: newTeam.avatar
    })
    
    if (response.success) {
      showToast('团队创建成功')
      showCreateTeamPopup.value = false
      
      // 重置表单
      Object.assign(newTeam, {
        name: '',
        description: '',
        type: '',
        avatar: ''
      })
      newTeamTypeText.value = ''
      
      // 刷新团队列表
      await loadOwnedTeams()
      
      // 跳转到新创建的团队详情页
      router.push(`/teams/${response.data.id}`)
    } else {
      throw new Error(response.message || '创建团队失败')
    }
  } catch (error) {
    console.error('创建团队失败:', error)
    showFailToast(error.message || '创建失败，请重试')
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(() => {
  loadOwnedTeams()
  loadJoinedTeams()
  loadTeamRequests()
})
</script>

<style scoped>
.my-teams-view {
  min-height: 100vh;
  background: #f5f5f5;
}

.tabs-container {
  margin-bottom: 20px;
}

.teams-content {
  padding: 16px;
  min-height: 300px;
}

.team-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.team-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.team-avatar {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  margin-right: 12px;
  object-fit: cover;
}

.team-info {
  flex: 1;
}

.team-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.team-description {
  font-size: 14px;
  color: #666;
  margin: 0 0 4px 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  display: box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  box-orient: vertical;
}

.member-role {
  margin-top: 4px;
}

.role-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.role-owner {
  background: #fff2e8;
  color: #fa8c16;
}

.role-admin {
  background: #f0f0f0;
  color: #666;
}

.role-member {
  background: #e6f7ff;
  color: #1890ff;
}

.team-stats {
  display: flex;
  justify-content: space-around;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 12px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #999;
}

.stat-label.has-requests {
  color: #ff4d4f;
}

.team-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}

.empty-text {
  font-size: 14px;
  color: #999;
  margin: 16px 0 24px;
}

.loading-text {
  text-align: center;
  color: #999;
  font-size: 14px;
  margin-top: 12px;
}

/* 申请记录样式 */
.request-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.request-info {
  margin-bottom: 12px;
}

.request-team-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.request-time {
  font-size: 13px;
  color: #999;
  margin: 0 0 4px 0;
}

.request-message {
  font-size: 14px;
  color: #666;
  margin: 8px 0 0 0;
  background: #f9f9f9;
  padding: 8px;
  border-radius: 4px;
  border-left: 3px solid #1989fa;
}

.request-status {
  margin-bottom: 12px;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-pending {
  background: #fff7e6;
  color: #fa8c16;
}

.status-accepted {
  background: #f6ffed;
  color: #52c41a;
}

.status-rejected {
  background: #fff1f0;
  color: #ff4d4f;
}

.request-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

/* 弹窗样式 */
.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.popup-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.popup-content {
  padding: 16px;
  overflow-y: auto;
  max-height: calc(80vh - 160px);
}

.form-item {
  margin-bottom: 20px;
}

.form-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.avatar-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-avatar {
  position: relative;
  margin-bottom: 8px;
  cursor: pointer;
}

.upload-image {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.upload-avatar:hover .upload-overlay {
  opacity: 1;
}

.upload-hint {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.popup-footer {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>