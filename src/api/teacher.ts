import { api } from './request';

export interface Teacher {
  id: number;
  userId?: number;
  name: string;
  phone?: string;
  subjects?: string;
  baseSalary: number;
  hourlyRate: number;
  user?: {
    id: number;
    username: string;
    role: string;
  };
  created_at: string;
}

export interface TeacherStats {
  success: boolean;
  data: {
    teacherId: number;
    teacherName: string;
    totalHoursThisMonth: number;
    totalCourses: number;
    baseSalary: number;
    hourlyRate: number;
  };
}

export interface TeacherListData {
  success: boolean;
  data: {
    list: Teacher[];
    total: number;
    page: number;
    pageSize: number;
  };
}

export const teacherApi = {
  getList: (params?: { page?: number; pageSize?: number; name?: string; subjects?: string }) =>
    api.get<TeacherListData>('/teachers', { params }),

  getById: (id: number) => api.get<{ success: boolean; data: Teacher }>(`/teachers/${id}`),

  getStats: (id: number) => api.get<TeacherStats>(`/teachers/${id}/stats`),

  create: (data: Partial<Teacher> & { username?: string; password?: string }) =>
    api.post<{ success: boolean; data: Teacher }>('/teachers', data),

  update: (id: number, data: Partial<Teacher>) =>
    api.put<{ success: boolean; data: Teacher }>(`/teachers/${id}`, data),

  delete: (id: number) => api.delete<{ success: boolean }>(`/teachers/${id}`),
};
