<template>
  <div class="activity-review">
    <van-nav-bar
      :title="`活动审核 - ${activity?.title}`"
      left-text="返回"
      left-arrow
      @click-left="$router.back()"
    />

    <div class="review-content" v-if="activity">
      <!-- 活动信息 -->
      <van-cell-group title="活动信息">
        <van-cell title="活动标题" :value="activity.title" />
        <van-cell title="活动分类" :value="getCategoryText(activity.category)" />
        <van-cell title="组织者" :value="activity.organizer?.name" />
        <van-cell title="活动时间" :value="formatTimeRange(activity.startTime, activity.endTime)" />
        <van-cell title="活动地点" :value="activity.location?.name" />
      </van-cell-group>

      <!-- 报名列表 -->
      <van-cell-group title="报名审核">
        <div v-if="enrollments.length === 0" class="empty-state">
          <van-empty description="暂无待审核的报名" />
        </div>

        <div v-else class="enrollment-list">
          <div
            v-for="enrollment in enrollments"
            :key="enrollment.id"
            class="enrollment-item"
          >
            <van-card>
              <template #title>
                <div class="applicant-info">
                  <van-image
                    round
                    width="40"
                    height="40"
                    :src="enrollment.user.avatar"
                  />
                  <div class="applicant-details">
                    <div class="applicant-name">{{ enrollment.user.name }}</div>
                    <div class="applicant-id">{{ enrollment.user.studentId }}</div>
                  </div>
                </div>
              </template>

              <template #desc>
                <div class="enrollment-details">
                  <div class="apply-time">
                    报名时间: {{ formatTime(enrollment.applyTime) }}
                  </div>
                  <div v-if="enrollment.remark" class="apply-remark">
                    备注: {{ enrollment.remark }}
                  </div>
                </div>
              </template>

              <template #footer>
                <div class="review-actions">
                  <van-button
                    size="small"
                    type="success"
                    @click="approveEnrollment(enrollment.id)"
                    :loading="enrollment.loading"
                  >
                    通过
                  </van-button>
                  <van-button
                    size="small"
                    type="danger"
                    @click="showRejectDialog(enrollment)"
                    :loading="enrollment.loading"
                  >
                    拒绝
                  </van-button>
                  <van-button
                    size="small"
                    type="default"
                    @click="showApplicantDetail(enrollment.user)"
                  >
                    详情
                  </van-button>
                </div>
              </template>
            </van-card>
          </div>
        </div>
      </van-cell-group>

      <!-- 批量操作 -->
      <div v-if="enrollments.length > 0" class="batch-actions">
        <van-button
          type="primary"
          block
          @click="showBatchApproveDialog"
        >
          批量通过所有申请
        </van-button>
      </div>

      <!-- 审核统计 -->
      <van-cell-group title="审核统计">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">{{ stats.total }}</div>
            <div class="stat-label">总报名</div>
          </div>
          <div class="stat-item">
            <div class="stat-number" style="color: #07c160;">{{ stats.approved }}</div>
            <div class="stat-label">已通过</div>
          </div>
          <div class="stat-item">
            <div class="stat-number" style="color: #ee0a24;">{{ stats.rejected }}</div>
            <div class="stat-label">已拒绝</div>
          </div>
          <div class="stat-item">
            <div class="stat-number" style="color: #1989fa;">{{ stats.pending }}</div>
            <div class="stat-label">待审核</div>
          </div>
        </div>
      </van-cell-group>
    </div>

    <!-- 拒绝原因弹窗 -->
    <van-dialog
      v-model:show="showRejectReasonDialog"
      title="拒绝原因"
      show-cancel-button
      @confirm="rejectEnrollment"
    >
      <van-field
        v-model="rejectReason"
        type="textarea"
        placeholder="请输入拒绝原因（可选）"
        rows="3"
        autosize
      />
    </van-dialog>

    <!-- 批量通过确认 -->
    <van-dialog
      v-model:show="showBatchApproveConfirm"
      title="批量通过"
      show-cancel-button
      @confirm="batchApproveAll"
    >
      <div style="text-align: center; padding: 20px;">
        确定要通过所有待审核的报名申请吗？
      </div>
    </van-dialog>

    <!-- 申请人详情弹窗 -->
    <van-popup
      v-model:show="showApplicantDetailPopup"
      position="bottom"
      :style="{ height: '60%' }"
    >
      <applicant-detail-panel
        v-if="selectedApplicant"
        :user="selectedApplicant"
        @close="showApplicantDetailPopup = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { showToast, showConfirmDialog, showFailToast } from 'vant'
import { useActivityStore } from '@/stores/activity'
import { agreeJoinActivity } from '@/api/activity'
import ApplicantDetailPanel from '@/components/Activity/ApplicantDetailPanel.vue'

const route = useRoute()
const activityStore = useActivityStore()

const activityId = route.params.id

// 状态管理
const activity = ref(null)
const enrollments = ref([])
const showRejectReasonDialog = ref(false)
const showBatchApproveConfirm = ref(false)
const showApplicantDetailPopup = ref(false)
const selectedApplicant = ref(null)

// 拒绝相关
const currentRejectEnrollmentId = ref('')
const rejectReason = ref('')

// 计算属性
const stats = computed(() => {
  const total = enrollments.value.length
  const approved = enrollments.value.filter(e => e.status === 'approved').length
  const rejected = enrollments.value.filter(e => e.status === 'rejected').length
  const pending = enrollments.value.filter(e => e.status === 'pending').length
  
  return { total, approved, rejected, pending }
})

onMounted(() => {
  loadActivityDetail()
  loadEnrollments()
})

const loadActivityDetail = async () => {
  try {
    await activityStore.fetchActivityDetail(activityId)
    activity.value = activityStore.currentActivity
  } catch (error) {
    console.error('加载活动详情失败:', error)
    showToast('加载活动详情失败')
  }
}

const loadEnrollments = async () => {
  try {
    // 模拟加载报名数据
    enrollments.value = [
      {
        id: 'enroll1',
        user: {
          id: 'user1',
          name: '张三',
          studentId: '2330502001',
          avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
          department: '计算机学院',
          creditScore: 95
        },
        applyTime: new Date(Date.now() - 3600000).toISOString(),
        remark: '我对这个活动很感兴趣！',
        status: 'pending',
        loading: false
      },
      {
        id: 'enroll2',
        user: {
          id: 'user2',
          name: '李四',
          studentId: '2330502002',
          avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
          department: '软件学院',
          creditScore: 88
        },
        applyTime: new Date(Date.now() - 7200000).toISOString(),
        remark: '',
        status: 'pending',
        loading: false
      }
    ]
  } catch (error) {
    console.error('加载报名列表失败:', error)
    showToast('加载报名列表失败')
  }
}

const getCategoryText = (category) => {
  const categoryMap = {
    lecture: '讲座',
    sports: '运动',
    boardgame: '桌游',
    club: '社团',
    study: '学习',
    other: '其他'
  }
  return categoryMap[category] || '其他'
}

const formatTime = (timeStr) => {
  return new Date(timeStr).toLocaleString('zh-CN')
}

const formatTimeRange = (startTime, endTime) => {
  const start = new Date(startTime)
  const end = new Date(endTime)
  return `${start.toLocaleDateString()} ${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}`
}

const approveEnrollment = async (enrollmentId) => {
  const enrollment = enrollments.value.find(e => e.id === enrollmentId)
  if (!enrollment) return

  enrollment.loading = true
  
  try {
    // 调用真实API审核通过
    const response = await agreeJoinActivity({
      activityId: activityId,
      userId: enrollment.user.id,
      approved: true
    })
    
    if (response.success) {
      enrollment.status = 'approved'
      showToast('已通过申请')
    } else {
      throw new Error(response.message || '审核失败')
    }
    
  } catch (error) {
    console.error('审核通过失败:', error)
    showFailToast(error.message || '审核失败，请稍后重试')
  } finally {
    enrollment.loading = false
  }
}

const showRejectDialog = (enrollment) => {
  currentRejectEnrollmentId.value = enrollment.id
  rejectReason.value = ''
  showRejectReasonDialog.value = true
}

const rejectEnrollment = async () => {
  const enrollmentId = currentRejectEnrollmentId.value
  const enrollment = enrollments.value.find(e => e.id === enrollmentId)
  if (!enrollment) return

  enrollment.loading = true
  
  try {
    // 调用真实API审核拒绝
    const response = await agreeJoinActivity({
      activityId: activityId,
      userId: enrollment.user.id,
      approved: false,
      reason: rejectReason.value
    })
    
    if (response.success) {
      enrollment.status = 'rejected'
      showToast('已拒绝申请')
    } else {
      throw new Error(response.message || '审核失败')
    }
    
  } catch (error) {
    console.error('审核拒绝失败:', error)
    showFailToast(error.message || '审核失败，请稍后重试')
  } finally {
    enrollment.loading = false
    showRejectReasonDialog.value = false
    currentRejectEnrollmentId.value = ''
    rejectReason.value = ''
  }
}

const showBatchApproveDialog = () => {
  if (enrollments.value.filter(e => e.status === 'pending').length === 0) {
    showToast('没有待审核的申请')
    return
  }
  showBatchApproveConfirm.value = true
}

const batchApproveAll = async () => {
  const pendingEnrollments = enrollments.value.filter(e => e.status === 'pending')
  
  try {
    for (const enrollment of pendingEnrollments) {
      enrollment.loading = true
      
      try {
        // 调用真实API批量审核
        const response = await agreeJoinActivity({
          activityId: activityId,
          userId: enrollment.user.id,
          approved: true
        })
        
        if (response.success) {
          enrollment.status = 'approved'
        } else {
          throw new Error(response.message || '审核失败')
        }
      } catch (error) {
        console.error(`审核用户 ${enrollment.user.name} 失败:`, error)
        // 继续处理其他用户，不中断整个流程
      } finally {
        enrollment.loading = false
      }
    }
    
    const approvedCount = pendingEnrollments.filter(e => e.status === 'approved').length
    if (approvedCount > 0) {
      showToast(`已通过 ${approvedCount} 个申请`)
    } else {
      showFailToast('批量审核失败，请稍后重试')
    }
  } catch (error) {
    console.error('批量审核失败:', error)
    showFailToast('批量审核失败，请稍后重试')
  } finally {
    showBatchApproveConfirm.value = false
  }
}

const showApplicantDetail = (user) => {
  selectedApplicant.value = user
  showApplicantDetailPopup.value = true
}
</script>

<style scoped>
.activity-review {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.review-content {
  padding-top: 46px;
  padding-bottom: 20px;
}

.empty-state {
  padding: 40px 0;
}

.enrollment-list {
  padding: 0 16px;
}

.enrollment-item {
  margin-bottom: 12px;
}

.applicant-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.applicant-details {
  flex: 1;
}

.applicant-name {
  font-weight: 600;
  margin-bottom: 2px;
}

.applicant-id {
  font-size: 12px;
  color: #969799;
}

.enrollment-details {
  font-size: 12px;
  color: #646566;
}

.apply-time {
  margin-bottom: 4px;
}

.apply-remark {
  color: #1989fa;
}

.review-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.batch-actions {
  padding: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 16px;
  background: white;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #969799;
}
</style>