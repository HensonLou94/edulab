import { api } from './request';
import type { Student } from './student';
import type { Schedule } from './schedule';

export interface Signin {
  id: number;
  studentId: number;
  scheduleId: number;
  signDate: string;
  status: 'signed' | 'absent';
  student?: Student;
  schedule?: Schedule;
  created_at: string;
}

export const signinApi = {
  create: (data: { studentId: number; scheduleId: number; signDate: string; status?: string }) =>
    api.post<{ success: boolean; data: Signin }>('/signins', data),

  getBySchedule: (scheduleId: number, params?: { date?: string }) =>
    api.get<{ success: boolean; data: Signin[] }>(`/signins/schedule/${scheduleId}`, { params }),

  batchCreate: (data: { scheduleId: number; signDate: string; records: Array<{ studentId: number; status: string }> }) =>
    api.post<{ success: boolean; data: Signin[] }>('/signins/batch', data),
};
