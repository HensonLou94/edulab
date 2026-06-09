<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { teacherApi, type Teacher } from '@/api/teacher'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const list = ref<Teacher[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)

const searchForm = ref({
  name: '',
  subjects: ''
})

const dialogVisible = ref(false)
const dialogTitle = ref('新增教师')
const form = ref({
  id: undefined as number | undefined,
  name: '',
  phone: '',
  subjects: '',
  baseSalary: 0,
  hourlyRate: 0,
  username: '',
  password: ''
})

const getList = async () => {
  loading.value = true
  try {
    const res = await teacherApi.getList({
      page: page.value,
      pageSize: pageSize.value,
      ...searchForm.value
    })
    list.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('Failed to load teachers:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  getList()
}

const handleReset = () => {
  searchForm.value = { name: '', subjects: '' }
  handleSearch()
}

const handlePageChange = (p: number) => {
  page.value = p
  getList()
}

const handleAdd = () => {
  form.value = {
    id: undefined,
    name: '',
    phone: '',
    subjects: '',
    baseSalary: 0,
    hourlyRate: 0,
    username: '',
    password: ''
  }
  dialogTitle.value = '新增教师'
  dialogVisible.value = true
}

const handleEdit = (row: Teacher) => {
  form.value = {
    id: row.id,
    name: row.name,
    phone: row.phone || '',
    subjects: row.subjects || '',
    baseSalary: Number(row.baseSalary),
    hourlyRate: Number(row.hourlyRate),
    username: '',
    password: ''
  }
  dialogTitle.value = '编辑教师'
  dialogVisible.value = true
}

const handleSave = async () => {
  if (!form.value.name) {
    ElMessage.warning('请输入教师姓名')
    return
  }

  loading.value = true
  try {
    const data = {
      name: form.value.name,
      phone: form.value.phone,
      subjects: form.value.subjects,
      baseSalary: form.value.baseSalary,
      hourlyRate: form.value.hourlyRate
    }

    if (form.value.id) {
      await teacherApi.update(form.value.id, data)
      ElMessage.success('更新成功')
    } else {
      await teacherApi.create({
        ...data,
        username: form.value.username,
        password: form.value.password
      })
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
    await ElMessageBox.confirm('确定要删除该教师吗？', '提示', { type: 'warning' })
    await teacherApi.delete(id)
    ElMessage.success('删除成功')
    getList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handleView = (id: number) => {
  router.push(`/teachers/${id}`)
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
          <span>教师列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增教师
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="姓名">
          <el-input v-model="searchForm.name" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="科目">
          <el-input v-model="searchForm.subjects" placeholder="请输入科目" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="list" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="phone" label="电话" />
        <el-table-column prop="subjects" label="科目" />
        <el-table-column prop="baseSalary" label="底薪">
          <template #default="{ row }">
            ¥{{ row.baseSalary }}
          </template>
        </el-table-column>
        <el-table-column prop="hourlyRate" label="课时费">
          <template #default="{ row }">
            ¥{{ row.hourlyRate }}/小时
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row.id)">查看</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="姓名" required>
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="form.phone" placeholder="请输入电话" />
        </el-form-item>
        <el-form-item label="科目">
          <el-input v-model="form.subjects" placeholder="请输入科目" />
        </el-form-item>
        <el-form-item label="底薪">
          <el-input-number v-model="form.baseSalary" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="课时费">
          <el-input-number v-model="form.hourlyRate" :min="0" :precision="2" />
        </el-form-item>
        <template v-if="!form.id">
          <el-divider />
          <el-form-item label="账号">
            <el-input v-model="form.username" placeholder="请输入登录账号" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="form.password" type="password" placeholder="请输入登录密码" />
          </el-form-item>
        </template>
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
