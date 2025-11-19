<template>
  <div class="team-management">
    <van-nav-bar
      :title="teamInfo.name"
      left-text="返回"
      left-arrow
      @click-left="$router.back()"
    >
      <template #right>
        <van-dropdown-menu active-color="#1989fa">
          <van-dropdown-item ref="item" :options="optionList" />
        </van-dropdown-menu>
      </template>
    </van-nav-bar>

    <div class="management-content">
      <!-- 团队信息 -->
      <van-cell-group class="team-info-section">
        <van-cell title="团队名称" :value="teamInfo.name" />
        <van-cell title="团队人数" :value="`${teamInfo.memberCount}/${teamInfo.maxMembers}`" />
        <van-cell title="创建时间" :value="formatTime(teamInfo.createTime)" />
        <van-cell title="团队状态" :value="teamStatusText" />
      </van-cell-group>

      <!-- 成员管理 -->
      <van-cell-group class="member-section">
        <van-cell title="团队成员" value="管理" is-link @click="showMemberManagement = true" />
        <div class="member-grid">
          <div
            v-for="member in teamMembers"
            :key="member.id"
            class="member-item"
            @click="onMemberClick(member)"
          >
            <van-image
              round
              width="50"
              height="50"
              :src="member.avatar"
            />
            <div class="member-name">{{ member.name }}</div>
            <van-tag v-if="member.role === 'leader'" type="primary" size="small">
              队长
            </van-tag>
          </div>
        </div>
      </van-cell-group>

      <!-- 邀请管理 -->
      <van-cell-group class="invite-section">
        <van-cell title="邀请成员" value="邀请" is-link @click="showInviteDialog = true" />
        <div v-if="pendingInvites.length > 0" class="invite-list">
          <van-cell
            v-for="invite in pendingInvites"
            :key="invite.id"
            :title="invite.userName"
            :label="`邀请时间: ${formatTime(invite.createTime)}`"
          >
            <template #right-icon>
              <van-button
                size="small"
                type="primary"
                @click.stop="acceptInvite(invite.id)"
              >
                接受
              </van-button>
              <van-button
                size="small"
                type="default"
                @click.stop="rejectInvite(invite.id)"
              >
                拒绝
              </van-button>
            </template>
          </van-cell>
        </div>
      </van-cell-group>

      <!-- 团队设置（队长可见） -->
      <van-cell-group v-if="isLeader" class="settings-section">
        <van-cell title="团队设置" value="设置" is-link @click="showTeamSettings = true" />
        <van-cell title="转让队长" value="转让" is-link @click="showTransferDialog = true" />
        <van-cell title="解散团队" value="解散" is-link @click="showDisbandDialog = true" />
      </van-cell-group>
    </div>

    <!-- 成员管理弹窗 -->
    <van-popup
      v-model:show="showMemberManagement"
      position="bottom"
      :style="{ height: '70%' }"
    >
      <member-management-panel
        :team-id="teamId"
        :members="teamMembers"
        :is-leader="isLeader"
        @member-removed="onMemberRemoved"
        @close="showMemberManagement = false"
      />
    </van-popup>

    <!-- 邀请成员弹窗 -->
    <van-popup
      v-model:show="showInviteDialog"
      position="bottom"
      :style="{ height: '60%' }"
    >
      <invite-member-panel
        :team-id="teamId"
        @invite-sent="onInviteSent"
        @close="showInviteDialog = false"
      />
    </van-popup>

    <!-- 团队设置弹窗 -->
    <van-popup
      v-model:show="showTeamSettings"
      position="bottom"
      :style="{ height: '50%' }"
    >
      <team-settings-panel
        :team-info="teamInfo"
        @settings-updated="onSettingsUpdated"
        @close="showTeamSettings = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useAuthStore } from '@/stores/auth'
import { getTeamDetail } from '@/api/team'
// 内联邀请成员面板组件
const InviteMemberPanel = defineComponent({
  props: {
    teamId: String
  },
  emits: ['invite-sent', 'close'],
  setup(props, { emit }) {
    const inviteLink = ref('')
    const showCopied = ref(false)
    
    // 生成邀请链接
    const generateInviteLink = () => {
      // 在实际应用中，这里应该调用后端API生成真实的邀请链接
      inviteLink.value = `${window.location.origin}/join-team?teamId=${props.teamId}&token=${Date.now()}`
    }
    
    // 复制邀请链接
    const copyInviteLink = () => {
      navigator.clipboard.writeText(inviteLink.value).then(() => {
        showCopied.value = true
        setTimeout(() => {
          showCopied.value = false
        }, 2000)
      })
    }
    
    // 发送邀请
    const sendInvite = () => {
      // 在实际应用中，这里应该调用后端API发送邀请
      emit('invite-sent')
      showToast('邀请已发送')
      generateInviteLink() // 生成新的邀请链接
    }
    
    // 组件挂载时生成邀请链接
    generateInviteLink()
    
    return {
      inviteLink,
      showCopied,
      copyInviteLink,
      sendInvite
    }
  },
  template: `
    <div class="invite-member-panel">
      <div class="panel-header">
        <h3>邀请成员</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      <div class="panel-content">
        <div class="invite-method">
          <h4>复制邀请链接</h4>
          <div class="invite-link-container">
            <input
              v-model="inviteLink"
              class="invite-link-input"
              readonly
            />
            <button class="copy-btn" @click="copyInviteLink">
              {{ showCopied ? '已复制' : '复制' }}
            </button>
          </div>
        </div>
        <div class="invite-method">
          <h4>发送邀请</h4>
          <p class="invite-hint">点击下方按钮，通过系统发送邀请给新成员</p>
          <button class="send-invite-btn" @click="sendInvite">
            发送邀请
          </button>
        </div>
      </div>
    </div>
  `
})

// 内联团队设置面板组件
const TeamSettingsPanel = defineComponent({
  props: {
    teamInfo: Object
  },
  emits: ['settings-updated', 'close'],
  setup(props, { emit }) {
    const teamName = ref(props.teamInfo.name)
    const teamDescription = ref(props.teamInfo.description || '')
    
    const handleSave = () => {
      emit('settings-updated', {
        name: teamName.value,
        description: teamDescription.value
      })
      showToast('保存成功')
    }
    
    return {
      teamName,
      teamDescription,
      handleSave
    }
  },
  template: `
    <div class="team-settings-panel">
      <div class="panel-header">
        <h3>团队设置</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      <div class="panel-content">
        <div class="form-item">
          <label>团队名称</label>
          <input
            v-model="teamName"
            class="form-input"
            placeholder="请输入团队名称"
            maxlength="20"
          />
        </div>
        <div class="form-item">
          <label>团队简介</label>
          <textarea
            v-model="teamDescription"
            class="form-textarea"
            placeholder="请输入团队简介"
            rows="4"
            maxlength="100"
          ></textarea>
        </div>
        <button class="save-btn" @click="handleSave">保存设置</button>
      </div>
    </div>
  `
})

// 内联成员管理面板组件
const MemberManagementPanel = defineComponent({
  props: {
    teamId: String,
    members: Array,
    isLeader: Boolean
  },
  emits: ['member-removed', 'close'],
  setup(props, { emit }) {
    const handleRemoveMember = (member) => {
      showConfirmDialog({
        title: '移除成员',
        message: `确定要将 ${member.name} 移出团队吗？`,
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        emit('member-removed', member.id)
        showToast('移除成功')
      })
    }
    
    return {
      handleRemoveMember
    }
  },
  template: `
    <div class="member-management-panel">
      <div class="panel-header">
        <h3>团队成员管理</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      <div class="panel-content">
        <div v-if="members.length === 0" class="empty-message">暂无成员</div>
        <div
          v-for="member in members"
          :key="member.id"
          class="manage-member-item"
        >
          <div class="member-info">
            <div class="member-avatar">{{ member.name.charAt(0) }}</div>
            <div class="member-details">
              <div class="member-name">{{ member.name }}</div>
              <div class="member-role">{{ member.role === 'leader' ? '队长' : '成员' }}</div>
            </div>
          </div>
          <button
            v-if="isLeader && member.role !== 'leader'"
            class="remove-btn"
            @click="handleRemoveMember(member)"
          >
            移除
          </button>
        </div>
      </div>
    </div>
  `
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const teamId = route.params.id

// 状态管理
const teamInfo = ref({
  id: teamId,
  name: '',
  description: '',
  memberCount: 0,
  maxMembers: 20,
  createTime: '',
  status: 'active',
  leaderId: '',
  leaderName: ''
})

const teamMembers = ref([])
const pendingInvites = ref([])

// 弹窗控制
const showMemberManagement = ref(false)
const showInviteDialog = ref(false)
const showTeamSettings = ref(false)
const showTransferDialog = ref(false)
const showDisbandDialog = ref(false)

// 计算属性
const isLeader = computed(() => {
  const currentUser = authStore.userInfo
  if (!currentUser) {
    return false
  }
  return teamMembers.value.some(member => 
    member.id === currentUser.id && member.role === 'leader'
  )
})

const teamStatusText = computed(() => {
  const statusMap = {
    active: '进行中',
    recruiting: '招募中',
    full: '已满员',
    inactive: '已结束'
  }
  return statusMap[teamInfo.value.status] || '未知'
})

const optionList = computed(() => {
  const options = []
  
  if (isLeader.value) {
    options.push({ text: '团队设置', value: 'settings' })
    options.push({ text: '邀请成员', value: 'invite' })
    options.push({ text: '解散团队', value: 'disband' })
  } else {
    options.push({ text: '退出团队', value: 'quit' })
    options.push({ text: '举报团队', value: 'report' })
  }
  
  return options
})

onMounted(() => {
  loadTeamData()
})

const loadTeamData = async () => {
  try {
    // 安全检查：确保 authStore.userInfo 存在
    if (!authStore.userInfo) {
      console.error('用户信息未加载，无法加载团队数据')
      showToast('用户信息未加载，请重新登录')
      return
    }

    console.log('正在加载团队数据，团队ID:', teamId)
    
    // 调用API获取团队详情
    const response = await getTeamDetail(teamId)
    console.log('团队详情API响应:', response)
    
    if (response && response.success) {
      // 更新团队基本信息
      teamInfo.value = {
        id: response.data.id,
        name: response.data.name,
        description: response.data.description || '',
        memberCount: response.data.memberCount,
        maxMembers: response.data.maxMembers || 20,
        createTime: response.data.createdAt || response.data.createTime,
        status: response.data.status || 'active',
        leaderId: response.data.leaderId,
        leaderName: response.data.leaderName
      }
      
      // 更新团队成员数据
      if (response.data.members && Array.isArray(response.data.members)) {
        teamMembers.value = response.data.members.map(member => ({
          id: member.userId,
          name: member.userName,
          avatar: member.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
          role: member.role,
          joinTime: member.joinedAt || member.joinTime
        }))
      } else {
        // 如果没有成员数据，使用默认数据
        teamMembers.value = [
          {
            id: response.data.leaderId,
            name: response.data.leaderName,
            avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
            role: 'leader',
            joinTime: response.data.createdAt || new Date().toISOString()
          }
        ]
      }
      
      console.log('团队数据加载成功:', { teamInfo: teamInfo.value, teamMembers: teamMembers.value })
      showToast('团队数据加载成功')
    } else {
      throw new Error(response?.message || '获取团队详情失败')
    }
    
  } catch (error) {
    console.error('加载团队数据失败:', error)
    showToast(`加载团队数据失败: ${error.message || '未知错误'}`)
    
    // 如果API失败，使用模拟数据作为后备
    console.log('使用模拟数据作为后备')
    teamMembers.value = [
      {
        id: 'user1',
        name: '队长',
        avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
        role: 'leader',
        joinTime: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: authStore.userInfo.id,
        name: authStore.userInfo.realName,
        avatar: authStore.userInfo.avatar,
        role: 'member',
        joinTime: new Date().toISOString()
      }
    ]
  }
}

const formatTime = (timeStr) => {
  return new Date(timeStr).toLocaleDateString('zh-CN')
}

const onMemberClick = (member) => {
  // 查看成员详情
  showToast(`查看成员: ${member.name}`)
}

const onMemberRemoved = (memberId) => {
  teamMembers.value = teamMembers.value.filter(member => member.id !== memberId)
  teamInfo.value.memberCount = teamMembers.value.length
  showToast('成员已移除')
}

const onInviteSent = () => {
  showInviteDialog.value = false
  showToast('邀请已发送')
}

const onSettingsUpdated = (newSettings) => {
  teamInfo.value = { ...teamInfo.value, ...newSettings }
  showTeamSettings.value = false
  showToast('团队设置已更新')
}

const acceptInvite = async (inviteId) => {
  try {
    // 调用API接受邀请
    pendingInvites.value = pendingInvites.value.filter(invite => invite.id !== inviteId)
    showToast('邀请已接受')
  } catch (error) {
    console.error('接受邀请失败:', error)
    showToast('操作失败')
  }
}

const rejectInvite = async (inviteId) => {
  try {
    // 调用API拒绝邀请
    pendingInvites.value = pendingInvites.value.filter(invite => invite.id !== inviteId)
    showToast('邀请已拒绝')
  } catch (error) {
    console.error('拒绝邀请失败:', error)
    showToast('操作失败')
  }
}
</script>

<style scoped>
.team-management {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.management-content {
  padding-top: 46px;
}

.team-info-section,
.member-section,
.invite-section,
.settings-section {
  margin-bottom: 16px;
}

.member-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 16px;
  background: white;
}

.member-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.member-name {
  font-size: 12px;
  color: #646566;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.invite-list {
  background: white;
}
/* 成员管理面板样式 */
.member-management-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  padding: 4px;
  line-height: 1;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.empty-message {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

.manage-member-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #1989fa;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
}

.member-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.manage-member-item .member-name {
  font-size: 16px;
  color: #333;
  width: auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.member-role {
  font-size: 12px;
  color: #999;
}

.remove-btn {
  background: #ff4d4f;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.remove-btn:hover {
  background: #ff7875;
}

/* 团队设置面板样式 */
.team-settings-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #1989fa;
}

.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  resize: none;
  transition: border-color 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: #1989fa;
}

.save-btn {
  width: 100%;
  background: #1989fa;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 20px;
}

.save-btn:hover {
  background: #409eff;
}

/* 邀请成员面板样式 */
.invite-member-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.invite-method {
  margin-bottom: 30px;
}

.invite-method h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.invite-link-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

.invite-link-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: #f9f9f9;
}

.copy-btn {
  padding: 10px 16px;
  background: #1989fa;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.copy-btn:hover {
  background: #409eff;
}

.invite-hint {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #666;
}

.send-invite-btn {
  width: 100%;
  padding: 12px;
  background: #52c41a;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.send-invite-btn:hover {
  background: #73d13d;
}

</style>