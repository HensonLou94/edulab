import { api } from './request';

export interface Classroom {
  id: number;
  name: string;
  capacity: number;
  created_at: string;
}

export interface ClassroomListData {
  success: boolean;
  data: {
    list: Classroom[];
    total: number;
    page: number;
    pageSize: number;
  };
}

export const classroomApi = {
  getList: (params?: { page?: number; pageSize?: number; name?: string }) =>
    api.get<ClassroomListData>('/classrooms', { params }),

  getById: (id: number) => api.get<{ success: boolean; data: Classroom }>(`/classrooms/${id}`),

  create: (data: Partial<Classroom>) => api.post<{ success: boolean; data: Classroom }>('/classrooms', data),

  update: (id: number, data: Partial<Classroom>) => api.put<{ success: boolean; data: Classroom }>(`/classrooms/${id}`, data),

  delete: (id: number) => api.delete<{ success: boolean }>(`/classrooms/${id}`),
};
