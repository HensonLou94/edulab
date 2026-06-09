import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';

const baseURL = '/api/v1';

const instance: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    // Return the data part only
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default instance;

// API functions - returns Promise<data> directly since interceptor unwraps
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    instance.get<T>(url, config) as Promise<T>,

  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    instance.post<T>(url, data, config) as Promise<T>,

  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    instance.put<T>(url, data, config) as Promise<T>,

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    instance.delete<T>(url, config) as Promise<T>,
};
