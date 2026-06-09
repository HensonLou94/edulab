<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { teacherApi, type Teacher, type TeacherStats } from '@/api/teacher'
import { scheduleApi } from '@/api/schedule'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const router = useRouter()
const loading = ref(false)
const teacher = ref<Partial<Teacher>>({})
const stats = ref<TeacherStats | null>(null)
const schedules = ref<any[]>([])

const teacherId = parseInt(router.currentRoute.value.params.id as string)

const getTeacher = async () => {
  loading.value = true
  try {
    const res = await teacherApi.getById(teacherId)
    teacher.value = res.data
  } catch (error) {
    ElMessage.error('获取教师信息失败')
  } finally {
    loading.value = false
  }
}

const getStats = async () => {
  try {
    const res = await teacherApi.getStats(teacherId)
    stats.value = res.data
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

const getSchedules = async () => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const res = await scheduleApi.getTeacherSchedule(teacherId, {
      startDate: startOfMonth.toISOString(),
      endDate: now.toISOString()
    })
    schedules.value = res.data
  } catch (error) {
    console.error('Failed to load schedules:', error)
  }
}

onMounted(() => {
  getTeacher()
  getStats()
  getSchedules()
})
</script>

<template>
  <div class="page-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>教师详情</span>
          <el-button @click="router.back()">返回</el-button>
        </div>
      </template>

      <div v-if="!loading">
        <el-descriptions :column="2" border class="teacher-info">
          <el-descriptions-item label="姓名">{{ teacher.name }}</el-descriptions-item>
          <el-descriptions-item label="电话">{{ teacher.phone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="科目">{{ teacher.subjects || '-' }}</el-descriptions-item>
          <el-descriptions-item label="底薪">¥{{ teacher.baseSalary }}</el-descriptions-item>
          <el-descriptions-item label="课时费">¥{{ teacher.hourlyRate }}/小时</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ teacher.created_at }}</el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <el-row :gutter="16" v-if="stats">
          <el-col :span="6">
            <el-statistic title="本月授课课时" :value="stats.totalHoursThisMonth" suffix="小时" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="累计课程数" :value="stats.totalCourses" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="底薪" :value="'¥' + stats.baseSalary" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="课时费单价" :value="'¥' + stats.hourlyRate + '/小时'" />
          </el-col>
        </el-row>

        <el-divider />

        <h4>本月课程</h4>
        <el-empty v-if="schedules.length === 0" description="本月暂无课程" />
        <el-table v-else :data="schedules" style="width: 100%">
          <el-table-column prop="course.name" label="课程" />
          <el-table-column prop="classroom.name" label="教室" />
          <el-table-column prop="startTime" label="开始时间">
            <template #default="{ row }">
              {{ dayjs(row.startTime).format('YYYY-MM-DD HH:mm') }}
            </template>
          </el-table-column>
          <el-table-column prop="endTime" label="结束时间">
            <template #default="{ row }">
              {{ dayjs(row.endTime).format('YYYY-MM-DD HH:mm') }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.page-container {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.teacher-info {
  margin-bottom: 16px;
}
</style>
