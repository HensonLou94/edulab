import { api } from './request';

export interface DashboardData {
  success: boolean;
  data: {
    totalStudents: number;
    totalTeachers: number;
    todayCourses: number;
    monthlySalaryTotal: number;
    recentActivities: any[];
  };
}

export interface SystemLog {
  id: number;
  userId: number;
  action: string;
  detail?: string;
  ip?: string;
  user?: { username: string };
  created_at: string;
}

export interface SystemLogListData {
  success: boolean;
  data: {
    list: SystemLog[];
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface SalaryRule {
  id?: number;
  ruleName?: string;
  ruleType: 'base' | 'hourly' | 'bonus' | 'deduction';
  ruleValue: number;
  isActive: number;
}

export const systemApi = {
  getDashboard: () => api.get<DashboardData>('/system/dashboard'),

  getLogs: (params?: { page?: number; pageSize?: number; action?: string; userId?: number }) =>
    api.get<SystemLogListData>('/system/logs', { params }),

  getSalaryRules: () => api.get<{ success: boolean; data: SalaryRule[] }>('/system/salary-rules'),

  updateSalaryRules: (rules: SalaryRule[]) =>
    api.put<{ success: boolean; data: SalaryRule[] }>('/system/salary-rules', { rules }),

  backup: () => api.post<{ success: boolean }>('/system/backup'),

  exportStudents: () => {
    return api.get('/system/export/students', { responseType: 'blob' });
  },
};
