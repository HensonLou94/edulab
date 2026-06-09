<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { salaryApi, type Salary } from '@/api/salary'
import { teacherApi } from '@/api/teacher'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const list = ref<Salary[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const teachers = ref<any[]>([])

const searchForm = ref({
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  teacherId: undefined as number | undefined,
  status: ''
})

const dialogVisible = ref(false)
const calculateForm = ref({
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  teacherIds: [] as number[]
})

const getList = async () => {
  loading.value = true
  try {
    const res = await salaryApi.getList({
      page: page.value,
      pageSize: pageSize.value,
      ...searchForm.value
    })
    list.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('Failed to load salaries:', error)
  } finally {
    loading.value = false
  }
}

const getTeachers = async () => {
  const res = await teacherApi.getList({ pageSize: 100 })
  teachers.value = res.data.list
}

const handleSearch = () => {
  page.value = 1
  getList()
}

const handleReset = () => {
  searchForm.value = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    teacherId: undefined,
    status: ''
  }
  handleSearch()
}

const handlePageChange = (p: number) => {
  page.value = p
  getList()
}

const handleCalculate = async () => {
  if (calculateForm.value.teacherIds.length === 0) {
    ElMessage.warning('请选择教师')
    return
  }

  loading.value = true
  try {
    await salaryApi.calculate({
      year: calculateForm.value.year,
      month: calculateForm.value.month,
      teacherIds: calculateForm.value.teacherIds
    })
    ElMessage.success('核算成功')
    dialogVisible.value = false
    getList()
  } catch (error: any) {
    ElMessage.error(error.message || '核算失败')
  } finally {
    loading.value = false
  }
}

const handleExport = async () => {
  try {
    const res = await salaryApi.export({
      year: searchForm.value.year,
      month: searchForm.value.month
    })
    const blob = new Blob([res as any], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `salary_${searchForm.value.year}_${searchForm.value.month}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

const handleUpdateStatus = async (row: Salary, status: string) => {
  try {
    await salaryApi.update(row.id, { status })
    ElMessage.success('更新成功')
    getList()
  } catch (error: any) {
    ElMessage.error(error.message || '更新失败')
  }
}

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(amount)
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
          <span>薪资管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="dialogVisible = true; getTeachers()">
              <el-icon><Coin /></el-icon>
              薪资核算
            </el-button>
            <el-button @click="handleExport">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </div>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="年份">
          <el-input-number v-model="searchForm.year" :min="2020" :max="2100" />
        </el-form-item>
        <el-form-item label="月份">
          <el-input-number v-model="searchForm.month" :min="1" :max="12" />
        </el-form-item>
        <el-form-item label="教师">
          <el-select v-model="searchForm.teacherId" placeholder="请选择" clearable>
            <el-option v-for="t in teachers" :key="t.id" :label="t.name" :value="t.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="待发放" value="pending" />
            <el-option label="已发放" value="paid" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="list" v-loading="loading" style="width: 100%">
        <el-table-column prop="year" label="年份" width="80" />
        <el-table-column prop="month" label="月份" width="80" />
        <el-table-column prop="teacher.name" label="教师" />
        <el-table-column prop="baseSalary" label="底薪">
          <template #default="{ row }">
            {{ formatMoney(row.baseSalary) }}
          </template>
        </el-table-column>
        <el-table-column prop="teachingHours" label="授课课时" />
        <el-table-column prop="teachingFee" label="课时费">
          <template #default="{ row }">
            {{ formatMoney(row.teachingFee) }}
          </template>
        </el-table-column>
        <el-table-column prop="totalSalary" label="应发工资">
          <template #default="{ row }">
            <b>{{ formatMoney(row.totalSalary) }}</b>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'paid' ? 'success' : 'warning'">
              {{ row.status === 'paid' ? '已发放' : '待发放' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending'"
              type="success"
              link
              @click="handleUpdateStatus(row, 'paid')"
            >
              确认发放
            </el-button>
            <el-tag v-else type="success">已结算</el-tag>
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

    <el-dialog v-model="dialogVisible" title="薪资核算" width="500px">
      <el-form :model="calculateForm" label-width="80px">
        <el-form-item label="年份" required>
          <el-input-number v-model="calculateForm.year" :min="2020" :max="2100" />
        </el-form-item>
        <el-form-item label="月份" required>
          <el-input-number v-model="calculateForm.month" :min="1" :max="12" />
        </el-form-item>
        <el-form-item label="教师" required>
          <el-select v-model="calculateForm.teacherIds" multiple placeholder="请选择教师">
            <el-option v-for="t in teachers" :key="t.id" :label="t.name" :value="t.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCalculate" :loading="loading">核算</el-button>
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

.header-actions {
  display: flex;
  gap: 8px;
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
