import { api } from './request';
import type { Course } from './course';
import type { Teacher } from './teacher';
import type { Classroom } from './classroom';

export interface Schedule {
  id: number;
  courseId: number;
  teacherId: number;
  classroomId: number;
  startTime: string;
  endTime: string;
  weekType: 'single' | 'all' | 'half_month' | 'month';
  course?: Course;
  teacher?: Teacher;
  classroom?: Classroom;
  students?: any[];
  created_at: string;
}

export interface ScheduleListData {
  success: boolean;
  data: {
    list: Schedule[];
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface ConflictCheckResult {
  success: boolean;
  data: {
    hasConflict: boolean;
    conflicts: Array<{
      id: number;
      classroom?: string;
      teacher?: string;
      startTime: string;
      endTime: string;
    }>;
  };
}

export const scheduleApi = {
  getList: (params?: {
    page?: number;
    pageSize?: number;
    courseId?: number;
    teacherId?: number;
    classroomId?: number;
    startDate?: string;
    endDate?: string;
  }) => api.get<ScheduleListData>('/schedules', { params }),

  getById: (id: number) => api.get<{ success: boolean; data: Schedule }>(`/schedules/${id}`),

  getTeacherSchedule: (teacherId: number, params?: { startDate?: string; endDate?: string }) =>
    api.get<{ success: boolean; data: Schedule[] }>(`/schedules/teacher/${teacherId}`, { params }),

  getStudentSchedule: (studentId: number, params?: { startDate?: string; endDate?: string }) =>
    api.get<{ success: boolean; data: Schedule[] }>(`/schedules/student/${studentId}`, { params }),

  checkConflict: (data: {
    classroomId: number;
    teacherId: number;
    startTime: string;
    endTime: string;
    excludeScheduleId?: number;
  }) => api.post<ConflictCheckResult>('/schedules/check-conflict', data),

  create: (data: Partial<Schedule> & { studentIds?: number[] }) =>
    api.post<{ success: boolean; data: Schedule }>('/schedules', data),

  update: (id: number, data: Partial<Schedule> & { studentIds?: number[] }) =>
    api.put<{ success: boolean; data: Schedule }>(`/schedules/${id}`, data),

  delete: (id: number) => api.delete<{ success: boolean }>(`/schedules/${id}`),
};
