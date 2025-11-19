<template>
  <div class="enrollment-form">
    <h3>活动报名</h3>
    <van-form @submit="onSubmit">
      <van-field
        v-model="form.studentId"
        name="studentId"
        label="学号"
        placeholder="请输入学号"
        :rules="[
          { required: true, message: '请填写学号' },
          { pattern: /^\d{8,12}$/, message: '学号格式不正确' }
        ]"
      />
      <van-field
        v-model="form.name"
        name="name"
        label="姓名"
        placeholder="请输入姓名"
        :rules="[{ required: true, message: '请填写姓名' }]"
      />
      <van-field
        v-model="form.major"
        name="major"
        label="专业"
        placeholder="请输入专业"
        :rules="[{ required: true, message: '请填写专业' }]"
      />
      <van-field
        v-model="form.grade"
        name="grade"
        label="年级"
        placeholder="请输入年级"
        :rules="[{ required: true, message: '请填写年级' }]"
      />
      <van-field
        v-model="form.remarks"
        name="remarks"
        label="备注"
        type="textarea"
        placeholder="请输入备注信息（选填）"
        rows="2"
        autosize
      />
      <div style="margin: 16px;">
        <van-button round block type="primary" native-type="submit">
          立即报名
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script>
export default {
  name: 'EnrollmentForm',
  data() {
    return {
      form: {
        studentId: '',
        name: '',
        major: '',
        grade: '',
        remarks: ''
      }
    }
  },
  methods: {
    onSubmit(values) {
      console.log('提交报名信息:', values)
      // 触发报名事件，传递表单数据
      this.$emit('submit', this.form)
      
      // 可选：显示成功提示
      this.$notify({
        type: 'success',
        message: '报名成功！'
      })
    }
  }
}
</script>

<style scoped>
.enrollment-form {
  padding: 16px;
  background: white;
  margin: 16px 0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.enrollment-form h3 {
  margin: 0 0 16px 0;
  color: #323233;
  font-size: 18px;
  text-align: center;
}
</style>