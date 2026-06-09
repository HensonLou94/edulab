import { api } from './request';

export interface LoginData {
  username: string;
  password: string;
}

export interface UserInfo {
  id: number;
  username: string;
  role: 'admin' | 'teacher';
  teacherId?: number;
  teacherName?: string;
}

interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: UserInfo;
  };
}

interface ProfileResponse {
  success: boolean;
  data: UserInfo & { teacher?: any };
}

export const authApi = {
  login: (data: LoginData) => api.post<LoginResponse>('/auth/login', data),

  logout: () => api.post<{ success: boolean }>('/auth/logout'),

  getProfile: () => api.get<ProfileResponse>('/auth/profile'),

  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    api.put<{ success: boolean }>('/auth/password', data),
};
