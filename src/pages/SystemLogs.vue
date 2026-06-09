<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { systemApi, type SystemLog } from '@/api/system'

const loading = ref(false)
const list = ref<SystemLog[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(50)

const searchForm = ref({
  action: ''
})

const getList = async () => {
  loading.value = true
  try {
    const res = await systemApi.getLogs({
      page: page.value,
      pageSize: pageSize.value,
      ...searchForm.value
    })
    list.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('Failed to load logs:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  getList()
}

const handleReset = () => {
  searchForm.value = { action: '' }
  handleSearch()
}

const handlePageChange = (p: number) => {
  page.value = p
  getList()
}

onMounted(() => {
  getList()
})
</script>

<template>
  <div class="page-container">
    <el-card shadow="hover">
      <template #header>
        <span>操作日志</span>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="操作">
          <el-input v-model="searchForm.action" placeholder="请输入操作描述" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="list" v-loading="loading" style="width: 100%">
        <el-table-column prop="user?.username" label="用户" width="120" />
        <el-table-column prop="action" label="操作" />
        <el-table-column prop="detail" label="详情" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP地址" width="150" />
        <el-table-column prop="created_at" label="时间" width="180" />
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
  </div>
</template>

<style scoped>
.page-container {
  height: 100%;
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
