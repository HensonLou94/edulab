import { api } from './request';
import type { Teacher } from './teacher';

export interface Salary {
  id: number;
  teacherId: number;
  year: number;
  month: number;
  baseSalary: number;
  teachingHours: number;
  teachingFee: number;
  totalSalary: number;
  status: 'pending' | 'paid';
  teacher?: Teacher;
  created_at: string;
}

export interface SalaryListData {
  success: boolean;
  data: {
    list: Salary[];
    total: number;
    page: number;
    pageSize: number;
  };
}

export const salaryApi = {
  getList: (params?: {
    page?: number;
    pageSize?: number;
    year?: number;
    month?: number;
    teacherId?: number;
    status?: string;
  }) => api.get<SalaryListData>('/salarys', { params }),

  getById: (id: number) => api.get<{ success: boolean; data: Salary }>(`/salarys/${id}`),

  calculate: (data: { year: number; month: number; teacherIds?: number[] }) =>
    api.post<{ success: boolean; data: Salary[] }>('/salarys/calculate', data),

  update: (id: number, data: { status?: string }) =>
    api.put<{ success: boolean; data: Salary }>(`/salarys/${id}`, data),

  export: (params?: { year?: number; month?: number }) => {
    return api.get('/salarys/export', { params, responseType: 'blob' });
  },
};
