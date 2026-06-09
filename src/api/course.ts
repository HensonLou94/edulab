import { api } from './request';

export interface Course {
  id: number;
  name: string;
  subject?: string;
  duration: number;
  price: number;
  created_at: string;
}

export interface CourseListData {
  success: boolean;
  data: {
    list: Course[];
    total: number;
    page: number;
    pageSize: number;
  };
}

export const courseApi = {
  getList: (params?: { page?: number; pageSize?: number; name?: string; subject?: string }) =>
    api.get<CourseListData>('/courses', { params }),

  getById: (id: number) => api.get<{ success: boolean; data: Course }>(`/courses/${id}`),

  create: (data: Partial<Course>) => api.post<{ success: boolean; data: Course }>('/courses', data),

  update: (id: number, data: Partial<Course>) => api.put<{ success: boolean; data: Course }>(`/courses/${id}`, data),

  delete: (id: number) => api.delete<{ success: boolean }>(`/courses/${id}`),
};
