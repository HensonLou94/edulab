<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { systemApi } from '@/api/system'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const dashboardData = ref({
  totalStudents: 0,
  totalTeachers: 0,
  todayCourses: 0,
  monthlySalaryTotal: 0,
  recentActivities: []
})

onMounted(async () => {
  loading.value = true
  try {
    const res = await systemApi.getDashboard()
    dashboardData.value = res.data
  } catch (error) {
    console.error('Failed to load dashboard:', error)
  } finally {
    loading.value = false
  }
})

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(amount)
}
</script>

<template>
  <div class="dashboard">
    <el-row :gutter="16">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon students">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ dashboardData.totalStudents }}</div>
              <div class="stat-label">学员总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon teachers">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ dashboardData.totalTeachers }}</div>
              <div class="stat-label">教师总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon courses">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ dashboardData.todayCourses }}</div>
              <div class="stat-label">今日课程</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon salary">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatMoney(dashboardData.monthlySalaryTotal) }}</div>
              <div class="stat-label">本月薪资</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <span>快捷操作</span>
          </template>
          <div class="quick-actions">
            <router-link to="/students">
              <el-button type="primary" plain>
                <el-icon><User /></el-icon>
                学员管理
              </el-button>
            </router-link>
            <router-link to="/schedules">
              <el-button type="success" plain>
                <el-icon><Calendar /></el-icon>
                排课管理
              </el-button>
            </router-link>
            <router-link to="/signins">
              <el-button type="warning" plain>
                <el-icon><Edit /></el-icon>
                签到管理
              </el-button>
            </router-link>
            <router-link to="/salarys">
              <el-button type="danger" plain>
                <el-icon><Coin /></el-icon>
                薪资核算
              </el-button>
            </router-link>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <span>最近活动</span>
          </template>
          <el-empty v-if="dashboardData.recentActivities.length === 0" description="暂无最近活动" />
          <el-table v-else :data="dashboardData.recentActivities" style="width: 100%">
            <el-table-column prop="student?.name" label="学员" />
            <el-table-column prop="schedule?.course?.name" label="课程" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="row.status === 'signed' ? 'success' : 'danger'">
                  {{ row.status === 'signed' ? '已签到' : '缺勤' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sign_date" label="签到日期" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 0;
}

.stat-card {
  border-radius: 8px;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
  margin-right: 16px;
}

.stat-icon.students {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.teachers {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.courses {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.salary {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.quick-actions {
  display: flex;
  gap: 12px;
}

.quick-actions a {
  text-decoration: none;
}
</style>
