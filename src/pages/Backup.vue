<script setup lang="ts">
import { ref } from 'vue'
import { systemApi } from '@/api/system'
import { ElMessage } from 'element-plus'

const loading = ref(false)

const handleBackup = async () => {
  loading.value = true
  try {
    await systemApi.backup()
    ElMessage.success('备份成功')
  } catch (error: any) {
    ElMessage.error(error.message || '备份失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page-container">
    <el-card shadow="hover">
      <template #header>
        <span>数据备份</span>
      </template>

      <el-alert
        title="数据备份说明"
        type="info"
        :closable="false"
        style="margin-bottom: 16px;"
      >
        <template #default>
          <p>1. 点击"立即备份"按钮，系统将自动备份所有数据</p>
          <p>2. 备份文件将保存在服务器指定目录</p>
          <p>3. 建议定期进行数据备份，以防数据丢失</p>
        </template>
      </el-alert>

      <el-button type="primary" :loading="loading" @click="handleBackup">
        <el-icon><FolderOpened /></el-icon>
        立即备份
      </el-button>
    </el-card>
  </div>
</template>

<style scoped>
.page-container {
  height: 100%;
}
</style>
