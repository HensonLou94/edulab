<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { scheduleApi, type Schedule } from '@/api/schedule'
import { signinApi, type Signin } from '@/api/signin'
import { studentApi } from '@/api/student'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const loading = ref(false)
const schedules = ref<Schedule[]>([])
const selectedSchedule = ref<Schedule | null>(null)
const signins = ref<Signin[]>([])
const students = ref<any[]>([])

const searchForm = ref({
  startDate: dayjs().format('YYYY-MM-DD'),
  endDate: dayjs().format('YYYY-MM-DD')
})

const signinDialogVisible = ref(false)
const selectedDate = ref(dayjs().format('YYYY-MM-DD'))

const getSchedules = async () => {
  loading.value = true
  try {
    const res = await scheduleApi.getList({
      startDate: searchForm.value.startDate,
      endDate: searchForm.value.endDate
    })
    schedules.value = res.data.list
  } catch (error) {
    console.error('Failed to load schedules:', error)
  } finally {
    loading.value = false
  }
}

const getStudents = async () => {
  const res = await studentApi.getList({ pageSize: 100 })
  students.value = res.data.list
}

const handleSearch = () => {
  getSchedules()
}

const handleSelectSchedule = async (schedule: Schedule) => {
  selectedSchedule.value = schedule
  selectedDate.value = dayjs().format('YYYY-MM-DD')
  await loadSignins()
  signinDialogVisible.value = true
}

const loadSignins = async () => {
  if (!selectedSchedule.value) return
  try {
    const res = await signinApi.getBySchedule(selectedSchedule.value.id, {
      date: selectedDate.value
    })
    signins.value = res.data
  } catch (error) {
    console.error('Failed to load signins:', error)
  }
}

const handleDateChange = async () => {
  await loadSignins()
}

const handleSignin = async (studentId: number, status: string) => {
  if (!selectedSchedule.value) return
  try {
    await signinApi.create({
      studentId,
      scheduleId: selectedSchedule.value.id,
      signDate: selectedDate.value,
      status
    })
    ElMessage.success('签到成功')
    await loadSignins()
  } catch (error: any) {
    ElMessage.error(error.message || '签到失败')
  }
}

const handleBatchSignin = async () => {
  if (!selectedSchedule.value || !students.value.length) return

  const records = students.value.map(s => ({
    studentId: s.id,
    status: 'signed' as const
  }))

  try {
    await signinApi.batchCreate({
      scheduleId: selectedSchedule.value.id,
      signDate: selectedDate.value,
      records
    })
    ElMessage.success('批量签到成功')
    await loadSignins()
  } catch (error: any) {
    ElMessage.error(error.message || '批量签到失败')
  }
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const isSigned = (studentId: number) => {
  return signins.value.some(s => s.studentId === studentId && s.status === 'signed')
}

onMounted(() => {
  getSchedules()
})
</script>

<template>
  <div class="page-container">
    <el-card shadow="hover">
      <template #header>
        <span>签到管理</span>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="开始日期">
          <el-date-picker
            v-model="searchForm.startDate"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker
            v-model="searchForm.endDate"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="schedules" v-loading="loading" style="width: 100%">
        <el-table-column prop="course.name" label="课程" />
        <el-table-column prop="teacher.name" label="教师" />
        <el-table-column prop="classroom.name" label="教室" />
        <el-table-column prop="startTime" label="上课时间">
          <template #default="{ row }">
            {{ formatDate(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleSelectSchedule(row)">签到</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="signinDialogVisible" :title="selectedSchedule?.course?.name + ' - 签到'" width="600px">
      <div class="signin-header">
        <el-date-picker
          v-model="selectedDate"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleDateChange"
        />
        <el-button type="success" @click="handleBatchSignin">批量签到</el-button>
      </div>

      <el-table :data="students" style="width: 100%; margin-top: 16px;">
        <el-table-column prop="name" label="学员姓名" />
        <el-table-column prop="grade" label="年级" />
        <el-table-column label="签到状态" width="120">
          <template #default="{ row }">
            <el-tag :type="isSigned(row.id) ? 'success' : 'info'">
              {{ isSigned(row.id) ? '已签到' : '未签到' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button
              v-if="!isSigned(row.id)"
              type="primary"
              size="small"
              @click="handleSignin(row.id, 'signed')"
            >
              签到
            </el-button>
            <el-button
              v-else
              type="danger"
              size="small"
              @click="handleSignin(row.id, 'absent')"
            >
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<style scoped>
.page-container {
  height: 100%;
}

.search-form {
  margin-bottom: 16px;
}

.signin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
