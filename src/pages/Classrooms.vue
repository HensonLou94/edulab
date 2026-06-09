<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { classroomApi, type Classroom } from '@/api/classroom'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const list = ref<Classroom[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)

const searchForm = ref({
  name: ''
})

const dialogVisible = ref(false)
const dialogTitle = ref('新增教室')
const form = ref({
  id: undefined as number | undefined,
  name: '',
  capacity: 30
})

const getList = async () => {
  loading.value = true
  try {
    const res = await classroomApi.getList({
      page: page.value,
      pageSize: pageSize.value,
      ...searchForm.value
    })
    list.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('Failed to load classrooms:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  getList()
}

const handleReset = () => {
  searchForm.value = { name: '' }
  handleSearch()
}

const handlePageChange = (p: number) => {
  page.value = p
  getList()
}

const handleAdd = () => {
  form.value = { id: undefined, name: '', capacity: 30 }
  dialogTitle.value = '新增教室'
  dialogVisible.value = true
}

const handleEdit = (row: Classroom) => {
  form.value = {
    id: row.id,
    name: row.name,
    capacity: row.capacity
  }
  dialogTitle.value = '编辑教室'
  dialogVisible.value = true
}

const handleSave = async () => {
  if (!form.value.name) {
    ElMessage.warning('请输入教室名称')
    return
  }

  loading.value = true
  try {
    if (form.value.id) {
      await classroomApi.update(form.value.id, form.value)
      ElMessage.success('更新成功')
    } else {
      await classroomApi.create(form.value)
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
    await ElMessageBox.confirm('确定要删除该教室吗？', '提示', { type: 'warning' })
    await classroomApi.delete(id)
    ElMessage.success('删除成功')
    getList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
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
          <span>教室列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增教室
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="教室名称">
          <el-input v-model="searchForm.name" placeholder="请输入教室名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="list" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="教室名称" />
        <el-table-column prop="capacity" label="容量" />
        <el-table-column prop="created_at" label="创建时间" />
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="教室名称" required>
          <el-input v-model="form.name" placeholder="请输入教室名称" />
        </el-form-item>
        <el-form-item label="容量">
          <el-input-number v-model="form.capacity" :min="1" />
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
