<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { scheduleApi, type Schedule } from '@/api/schedule'
import { courseApi } from '@/api/course'
import { teacherApi } from '@/api/teacher'
import { classroomApi } from '@/api/classroom'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const loading = ref(false)
const list = ref<Schedule[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)

const courses = ref<any[]>([])
const teachers = ref<any[]>([])
const classrooms = ref<any[]>([])

const searchForm = ref({
  courseId: undefined as number | undefined,
  teacherId: undefined as number | undefined,
  classroomId: undefined as number | undefined,
  startDate: '',
  endDate: ''
})

const dialogVisible = ref(false)
const dialogTitle = ref('新增排课')
const form = ref({
  id: undefined as number | undefined,
  courseId: undefined as number | undefined,
  teacherId: undefined as number | undefined,
  classroomId: undefined as number | undefined,
  startTime: '',
  endTime: '',
  weekType: 'all' as const
})

const getList = async () => {
  loading.value = true
  try {
    const res = await scheduleApi.getList({
      page: page.value,
      pageSize: pageSize.value,
      ...searchForm.value
    })
    list.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('Failed to load schedules:', error)
  } finally {
    loading.value = false
  }
}

const getCourses = async () => {
  const res = await courseApi.getList({ pageSize: 100 })
  courses.value = res.data.list
}

const getTeachers = async () => {
  const res = await teacherApi.getList({ pageSize: 100 })
  teachers.value = res.data.list
}

const getClassrooms = async () => {
  const res = await classroomApi.getList({ pageSize: 100 })
  classrooms.value = res.data.list
}

const handleSearch = () => {
  page.value = 1
  getList()
}

const handleReset = () => {
  searchForm.value = {
    courseId: undefined,
    teacherId: undefined,
    classroomId: undefined,
    startDate: '',
    endDate: ''
  }
  handleSearch()
}

const handlePageChange = (p: number) => {
  page.value = p
  getList()
}

const handleAdd = async () => {
  form.value = {
    id: undefined,
    courseId: undefined,
    teacherId: undefined,
    classroomId: undefined,
    startTime: '',
    endTime: '',
    weekType: 'all'
  }
  dialogTitle.value = '新增排课'
  dialogVisible.value = true
  await Promise.all([getCourses(), getTeachers(), getClassrooms()])
}

const handleEdit = async (row: Schedule) => {
  form.value = {
    id: row.id,
    courseId: row.courseId,
    teacherId: row.teacherId,
    classroomId: row.classroomId,
    startTime: dayjs(row.startTime).format('YYYY-MM-DDTHH:mm'),
    endTime: dayjs(row.endTime).format('YYYY-MM-DDTHH:mm'),
    weekType: row.weekType
  }
  dialogTitle.value = '编辑排课'
  dialogVisible.value = true
  await Promise.all([getCourses(), getTeachers(), getClassrooms()])
}

const handleSave = async () => {
  if (!form.value.courseId || !form.value.teacherId || !form.value.classroomId || !form.value.startTime || !form.value.endTime) {
    ElMessage.warning('请填写完整信息')
    return
  }

  loading.value = true
  try {
    const data = {
      ...form.value,
      startTime: new Date(form.value.startTime).toISOString(),
      endTime: new Date(form.value.endTime).toISOString()
    }

    if (form.value.id) {
      await scheduleApi.update(form.value.id, data)
      ElMessage.success('更新成功')
    } else {
      await scheduleApi.create(data)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    getList()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    loading.value = false
  }
}

const handleDelete = async (id: number) => {
  try {
    await scheduleApi.delete(id)
    ElMessage.success('删除成功')
    getList()
  } catch (error: any) {
    ElMessage.error(error.message || '删除失败')
  }
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

onMounted(() => {
  getList()
})
</script>

<template>
  <div class="page-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>排课列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增排课
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="课程">
          <el-select v-model="searchForm.courseId" placeholder="请选择" clearable>
            <el-option v-for="c in courses" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="教师">
          <el-select v-model="searchForm.teacherId" placeholder="请选择" clearable>
            <el-option v-for="t in teachers" :key="t.id" :label="t.name" :value="t.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="searchForm.startDate"
            type="date"
            placeholder="开始日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="list" v-loading="loading" style="width: 100%">
        <el-table-column prop="course.name" label="课程" />
        <el-table-column prop="teacher.name" label="教师" />
        <el-table-column prop="classroom.name" label="教室" />
        <el-table-column prop="startTime" label="开始时间">
          <template #default="{ row }">
            {{ formatDate(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间">
          <template #default="{ row }">
            {{ formatDate(row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="课程" required>
          <el-select v-model="form.courseId" placeholder="请选择">
            <el-option v-for="c in courses" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="教师" required>
          <el-select v-model="form.teacherId" placeholder="请选择">
            <el-option v-for="t in teachers" :key="t.id" :label="t.name" :value="t.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="教室" required>
          <el-select v-model="form.classroomId" placeholder="请选择">
            <el-option v-for="c in classrooms" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" required>
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="选择开始时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DDTHH:mm"
          />
        </el-form-item>
        <el-form-item label="结束时间" required>
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            placeholder="选择结束时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DDTHH:mm"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="loading">保存</el-button>
      </template>
    </el-dialog>
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

.search-form {
  margin-bottom: 16px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
