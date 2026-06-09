import { defineStore } from 'pinia';
import { authApi, type UserInfo } from '@/api/auth';

interface AuthState {
  token: string | null;
  user: UserInfo | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null'),
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
    isTeacher: (state) => state.user?.role === 'teacher',
  },

  actions: {
    async login(username: string, password: string) {
      const res = await authApi.login({ username, password });
      const data = res as any;
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    },

    async logout() {
      try {
        await authApi.logout();
      } catch (e) {
        // ignore
      }
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },

    async getProfile() {
      const res = await authApi.getProfile();
      return res;
    },
  },
});
