<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { studentApi, type Student } from '@/api/student'
import { scheduleApi, type Schedule } from '@/api/schedule'
import { signinApi, type Signin } from '@/api/signin'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(false)
const student = ref<Partial<Student>>({})
const schedules = ref<Schedule[]>([])
const signins = ref<Signin[]>([])
const activeTab = ref('info')

const isEdit = computed(() => route.path === '/students/new')
const studentId = computed(() => parseInt(route.params.id as string))

const form = ref({
  name: '',
  phone: '',
  age: undefined as number | undefined,
  grade: '',
  status: 'active' as const
})

const getStudent = async () => {
  if (!studentId.value) return
  loading.value = true
  try {
    const res = await studentApi.getById(studentId.value)
    student.value = res.data
    form.value = {
      name: res.data.name,
      phone: res.data.phone || '',
      age: res.data.age,
      grade: res.data.grade || '',
      status: res.data.status
    }
  } catch (error) {
    ElMessage.error('获取学员信息失败')
  } finally {
    loading.value = false
  }
}

const getSchedules = async () => {
  if (!studentId.value) return
  try {
    const res = await scheduleApi.getStudentSchedule(studentId.value)
    schedules.value = res.data
  } catch (error) {
    console.error('Failed to load schedules:', error)
  }
}

const getSignins = async () => {
  if (!studentId.value) return
  try {
    const res = await studentApi.getSignins(studentId.value)
    signins.value = res.data.list
  } catch (error) {
    console.error('Failed to load signins:', error)
  }
}

const handleSave = async () => {
  if (!form.value.name) {
    ElMessage.warning('请输入学员姓名')
    return
  }

  loading.value = true
  try {
    if (isEdit.value) {
      await studentApi.create(form.value)
      ElMessage.success('创建成功')
    } else {
      await studentApi.update(studentId.value, form.value)
      ElMessage.success('保存成功')
    }
    router.push('/students')
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!isEdit.value) {
    getStudent()
    getSchedules()
    getSignins()
  }
})
</script>

<template>
  <div class="page-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '新增学员' : '学员详情' }}</span>
          <el-button @click="router.back()">返回</el-button>
        </div>
      </template>

      <el-form v-if="isEdit || !loading" :model="form" label-width="100px" class="student-form">
        <el-form-item label="姓名" required>
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="form.phone" placeholder="请输入电话" />
        </el-form-item>
        <el-form-item label="年龄">
          <el-input-number v-model="form.age" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="年级">
          <el-input v-model="form.grade" placeholder="请输入年级" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status">
            <el-option label="在读" value="active" />
            <el-option label="休学" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave" :loading="loading">
            {{ isEdit ? '创建' : '保存' }}
          </el-button>
          <el-button @click="router.back()">取消</el-button>
        </el-form-item>
      </el-form>

      <el-tabs v-else v-model="activeTab">
        <el-tab-pane label="基本信息" name="info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="姓名">{{ student.name }}</el-descriptions-item>
            <el-descriptions-item label="电话">{{ student.phone || '-' }}</el-descriptions-item>
            <el-descriptions-item label="年龄">{{ student.age || '-' }}</el-descriptions-item>
            <el-descriptions-item label="年级">{{ student.grade || '-' }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="student.status === 'active' ? 'success' : 'info'">
                {{ student.status === 'active' ? '在读' : '休学' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ student.created_at }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="已报课程" name="schedule">
          <el-empty v-if="schedules.length === 0" description="暂无课程" />
          <el-table v-else :data="schedules" style="width: 100%">
            <el-table-column prop="course.name" label="课程" />
            <el-table-column prop="teacher.name" label="教师" />
            <el-table-column prop="classroom.name" label="教室" />
            <el-table-column prop="startTime" label="上课时间" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="签到记录" name="signin">
          <el-empty v-if="signins.length === 0" description="暂无签到记录" />
          <el-table v-else :data="signins" style="width: 100%">
            <el-table-column prop="schedule?.course?.name" label="课程" />
            <el-table-column prop="sign_date" label="日期" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="row.status === 'signed' ? 'success' : 'danger'">
                  {{ row.status === 'signed' ? '已签到' : '缺勤' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
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

.student-form {
  max-width: 500px;
}
</style>
