import { api } from './request';

export interface Student {
  id: number;
  name: string;
  phone?: string;
  age?: number;
  grade?: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface StudentListData {
  success: boolean;
  data: {
    list: Student[];
    total: number;
    page: number;
    pageSize: number;
  };
}

export const studentApi = {
  getList: (params?: { page?: number; pageSize?: number; name?: string; phone?: string; status?: string }) =>
    api.get<StudentListData>('/students', { params }),

  getById: (id: number) => api.get<{ success: boolean; data: Student }>(`/students/${id}`),

  create: (data: Partial<Student>) => api.post<{ success: boolean; data: Student }>('/students', data),

  update: (id: number, data: Partial<Student>) => api.put<{ success: boolean; data: Student }>(`/students/${id}`, data),

  delete: (id: number) => api.delete<{ success: boolean }>(`/students/${id}`),

  getSignins: (id: number, params?: { page?: number; pageSize?: number }) =>
    api.get<StudentListData>(`/students/${id}/signins`, { params }),

  assignSchedule: (studentId: number, scheduleId: number) =>
    api.post<{ success: boolean }>(`/students/${studentId}/schedules`, { scheduleId }),
};
