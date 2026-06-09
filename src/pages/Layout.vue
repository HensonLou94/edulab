<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const appStore = useAppStore()

const defaultOpeneds = ['1', '2', '3']

const menuItems = computed(() => {
  const items = [
    {
      index: '1',
      title: '首页',
      icon: 'HomeFilled',
      children: [
        { index: '/dashboard', title: '数据看板', icon: 'DataLine' }
      ]
    },
    {
      index: '2',
      title: '学员管理',
      icon: 'User',
      children: [
        { index: '/students', title: '学员列表', icon: 'User' },
        { index: '/signins', title: '签到管理', icon: 'Edit' }
      ]
    },
    {
      index: '3',
      title: '教学管理',
      icon: 'Reading',
      children: [
        { index: '/courses', title: '课程管理', icon: 'Collection' },
        { index: '/classrooms', title: '教室管理', icon: 'OfficeBuilding' },
        { index: '/schedules', title: '排课管理', icon: 'Calendar' }
      ]
    },
    {
      index: '4',
      title: '人员管理',
      icon: 'UserFilled',
      children: [
        { index: '/teachers', title: '教师管理', icon: 'Coordinate' }
      ]
    },
    {
      index: '5',
      title: '薪资管理',
      icon: 'Money',
      children: [
        { index: '/salarys', title: '薪资核算', icon: 'Coin' }
      ]
    }
  ]

  if (authStore.isAdmin) {
    items.push({
      index: '6',
      title: '系统管理',
      icon: 'Setting',
      children: [
        { index: '/system/logs', title: '操作日志', icon: 'Document' },
        { index: '/system/backup', title: '数据备份', icon: 'Folder' }
      ]
    })
  }

  return items
})

const activeMenu = computed(() => {
  const path = route.path
  for (const item of menuItems.value) {
    if (item.children) {
      for (const child of item.children) {
        if (path.startsWith(child.index)) {
          return item.index
        }
      }
    }
  }
  return '1'
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <el-container class="layout-container">
    <el-aside :width="appStore.sidebarCollapsed ? '64px' : '220px'" class="aside">
      <div class="logo">
        <span v-if="!appStore.sidebarCollapsed">EduLab</span>
        <el-icon v-else><Reading /></el-icon>
      </div>
      <el-menu
        :default-active="activeMenu"
        :default-openeds="defaultOpeneds"
        :collapse="appStore.sidebarCollapsed"
        :collapse-transition="false"
        class="sidebar-menu"
        router
      >
        <template v-for="item in menuItems" :key="item.index">
          <el-sub-menu :index="item.index">
            <template #title>
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item
              v-for="child in item.children"
              :key="child.index"
              :index="child.index"
            >
              <el-icon><component :is="child.icon" /></el-icon>
              <span>{{ child.title }}</span>
            </el-menu-item>
          </el-sub-menu>
        </template>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="appStore.toggleSidebar">
            <Fold v-if="!appStore.sidebarCollapsed" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="route.meta.title">
              {{ route.meta.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleLogout">
            <span class="user-info">
              <el-icon><UserFilled /></el-icon>
              <span>{{ authStore.user?.username }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-container {
  height: 100vh;
}

.aside {
  background: #304156;
  transition: width 0.3s;
  overflow: hidden;
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  background: #263445;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
}

.sidebar-menu {
  border: none;
  background: #304156;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 220px;
}

.sidebar-menu .el-menu-item,
.sidebar-menu .el-sub-menu__title {
  color: #bfcbd9;
}

.sidebar-menu .el-menu-item:hover,
.sidebar-menu .el-sub-menu__title:hover {
  background: #263445;
}

.sidebar-menu .el-menu-item.is-active {
  color: #409eff;
  background: #263445;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 16px;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  margin-right: 16px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 8px;
}

.user-info .el-icon {
  margin-right: 4px;
}

.main {
  background: #f5f7fa;
  padding: 16px;
}
</style>
