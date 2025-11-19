<template>
  <div class="create-team">
    <van-nav-bar
      :title="isEdit ? '编辑团队' : '创建团队'"
      left-text="取消"
      right-text="发布"
      @click-left="onCancel"
      @click-right="onSubmit"
    />

    <van-form @submit="onSubmit" class="team-form">
      <van-cell-group title="团队信息">
        <van-field
          v-model="form.name"
          label="团队名称"
          placeholder="请输入团队名称"
          :rules="[{ required: true, message: '请输入团队名称' }]"
          maxlength="20"
          show-word-limit
        />
        
        <van-field
          v-model="form.description"
          rows="3"
          autosize
          label="团队描述"
          type="textarea"
          placeholder="请描述团队的目标、要求等"
          :rules="[{ required: true, message: '请输入团队描述' }]"
          maxlength="200"
          show-word-limit
        />
        
        <van-field
          v-model="form.maxMembers"
          label="团队人数"
          type="digit"
          placeholder="请输入团队最大人数"
          :rules="[
            { required: true, message: '请输入团队人数' },
            { validator: validateTeamSize, message: '人数范围2-10人' }
          ]"
        />
      </van-cell-group>

      <van-cell-group title="团队设置">
        <van-field
          v-model="form.needApproval"
          label="需要审核"
        >
          <template #input>
            <van-switch v-model="form.needApproval" size="20" />
          </template>
          <template #extra>
            <van-tag type="primary" size="small">开启后加入需经您审核</van-tag>
          </template>
        </van-field>

        <van-field
          v-model="form.tags"
          label="团队标签"
          placeholder="请输入标签，用逗号分隔"
        />
      </van-cell-group>

      <!-- 邀请成员 -->
      <van-cell-group title="邀请成员" v-if="!isEdit">
        <div class="invite-section">
          <van-search
            v-model="searchKeyword"
            placeholder="搜索同学..."
            @search="searchUsers"
          />
          
          <div class="search-results" v-if="searchResults.length > 0">
            <van-checkbox-group v-model="selectedUsers">
              <van-cell
                v-for="user in searchResults"
                :key="user.id"
                :title="user.username"
                :label="`学号: ${user.studentId}`"
              >
                <template #icon>
                  <van-image
                    round
                    width="40"
                    height="40"
                    :src="user.avatar || '/default-avatar.png'"
                    style="margin-right: 10px;"
                  />
                </template>
                <template #right-icon>
                  <van-checkbox :name="user.id" />
                </template>
              </van-cell>
            </van-checkbox-group>
          </div>
        </div>
      </van-cell-group>
    </van-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTeamStore } from '@/stores/team'
import { showToast, showConfirmDialog } from 'vant'

const route = useRoute()
const router = useRouter()
const teamStore = useTeamStore()

const loading = ref(false)
const searchKeyword = ref('')
const searchResults = ref([])
const selectedUsers = ref([])

const isEdit = computed(() => !!route.query.id)

const form = reactive({
  name: '',
  description: '',
  maxMembers: 4,
  needApproval: false,
  tags: '',
  activityId: route.query.activityId || ''
})

// 验证团队人数
const validateTeamSize = (val) => val >= 2 && val <= 10

// 搜索用户
const searchUsers = async () => {
  if (!searchKeyword.value.trim()) {
    searchResults.value = []
    return
  }

  try {
    // 模拟搜索用户
    searchResults.value = [
      {
        id: '2',
        username: '小明',
        studentId: '2330502002',
        avatar: ''
      },
      {
        id: '3',
        username: '小红',
        studentId: '2330502003',
        avatar: ''
      }
    ]
  } catch (error) {
    showToast('搜索失败')
  }
}

// 取消创建
const onCancel = async () => {
  try {
    await showConfirmDialog({
      title: '确认取消',
      message: '确定要取消创建团队吗？所有输入的内容将丢失。'
    })
    router.back()
  } catch (error) {
    // 用户取消
  }
}

// 提交表单
const onSubmit = async () => {
  loading.value = true
  try {
    const teamData = {
      ...form,
      invitedUsers: selectedUsers.value
    }

    if (isEdit.value) {
      await teamStore.updateTeam(route.query.id, teamData)
      showToast('团队更新成功！')
    } else {
      await teamStore.createTeam(teamData)
      showToast('团队创建成功！')
    }
    
    router.back()
  } catch (error) {
    showToast(isEdit.value ? '更新失败' : '创建失败')
  } finally {
    loading.value = false
  }
}

// 如果是编辑模式，加载团队数据
onMounted(() => {
  if (isEdit.value) {
    loadTeamData()
  }
})

const loadTeamData = async () => {
  try {
    const team = await teamStore.getTeamDetail(route.query.id)
    Object.assign(form, {
      name: team.name,
      description: team.description,
      maxMembers: team.maxMembers,
      needApproval: team.needApproval,
      tags: team.tags
    })
  } catch (error) {
    showToast('加载团队数据失败')
  }
}
</script>

<style scoped>
.create-team {
  background: #f5f5f5;
  min-height: 100vh;
}

.team-form {
  padding-bottom: 20px;
}

.invite-section {
  padding: 0 15px;
}

.search-results {
  margin-top: 15px;
  max-height: 300px;
  overflow-y: auto;
}

:deep(.van-field__label) {
  width: 80px;
}
</style>