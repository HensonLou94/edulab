import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('@/pages/Layout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/pages/Dashboard.vue'),
        meta: { title: '数据看板' },
      },
      {
        path: 'students',
        name: 'Students',
        component: () => import('@/pages/Students.vue'),
        meta: { title: '学员管理' },
      },
      {
        path: 'students/:id',
        name: 'StudentDetail',
        component: () => import('@/pages/StudentDetail.vue'),
        meta: { title: '学员详情' },
      },
      {
        path: 'courses',
        name: 'Courses',
        component: () => import('@/pages/Courses.vue'),
        meta: { title: '课程管理' },
      },
      {
        path: 'classrooms',
        name: 'Classrooms',
        component: () => import('@/pages/Classrooms.vue'),
        meta: { title: '教室管理' },
      },
      {
        path: 'schedules',
        name: 'Schedules',
        component: () => import('@/pages/Schedules.vue'),
        meta: { title: '排课管理' },
      },
      {
        path: 'teachers',
        name: 'Teachers',
        component: () => import('@/pages/Teachers.vue'),
        meta: { title: '教师管理' },
      },
      {
        path: 'teachers/:id',
        name: 'TeacherDetail',
        component: () => import('@/pages/TeacherDetail.vue'),
        meta: { title: '教师详情' },
      },
      {
        path: 'salarys',
        name: 'Salarys',
        component: () => import('@/pages/Salarys.vue'),
        meta: { title: '薪资管理' },
      },
      {
        path: 'signins',
        name: 'Signins',
        component: () => import('@/pages/Signins.vue'),
        meta: { title: '签到管理' },
      },
      {
        path: 'system/logs',
        name: 'SystemLogs',
        component: () => import('@/pages/SystemLogs.vue'),
        meta: { title: '操作日志', adminOnly: true },
      },
      {
        path: 'system/backup',
        name: 'Backup',
        component: () => import('@/pages/Backup.vue'),
        meta: { title: '数据备份', adminOnly: true },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth !== false && !authStore.isLoggedIn) {
    next('/login');
    return;
  }

  if (to.path === '/login' && authStore.isLoggedIn) {
    next('/');
    return;
  }

  if (to.meta.adminOnly && !authStore.isAdmin) {
    next('/dashboard');
    return;
  }

  next();
});

export default router;
