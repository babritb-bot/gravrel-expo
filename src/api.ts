import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Real API client, matching the web console's pattern —
// same backend, same auth flow, same token refresh logic.
const BASE_URL = 'https://api.gravrelaetherops.com';

export const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, { refreshToken });
          await AsyncStorage.setItem('accessToken', data.data.accessToken);
          await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
          original.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(original);
        } catch {
          await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        }
      }
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  sendOtp: (phone: string) => api.post('/otp/send', { phone }),
  verifyLogin: (email: string, password: string, phone: string, otp: string) =>
    api.post('/otp/verify-login', { email, password, phone, otp }),
  logoutAll: () => api.post('/auth/logout-all'),
};

export const vmsApi = {
  list: () => api.get('/vms'),
  get: (id: string) => api.get(`/vms/${id}`),
  create: (data: any) => api.post('/vms', data),
  start: (id: string) => api.post(`/vms/${id}/start`),
  stop: (id: string) => api.post(`/vms/${id}/stop`),
  reboot: (id: string) => api.post(`/vms/${id}/reboot`),
  delete: (id: string) => api.delete(`/vms/${id}`),
};

export const databasesApi = {
  list: () => api.get('/databases'),
  get: (id: string) => api.get(`/databases/${id}`),
  create: (data: any) => api.post('/databases', data),
  delete: (id: string) => api.delete(`/databases/${id}`),
};

export const k8sApi = {
  list: () => api.get('/kubernetes'),
  get: (id: string) => api.get(`/kubernetes/${id}`),
  create: (data: any) => api.post('/kubernetes', data),
  delete: (id: string) => api.delete(`/kubernetes/${id}`),
};

export const storageApi = {
  buckets: () => api.get('/storage/buckets'),
  create: (data: any) => api.post('/storage/buckets', data),
  presign: (bucketName: string, data: any) => api.post(`/storage/buckets/${bucketName}/presign`, data),
  delete: (name: string) => api.delete(`/storage/buckets/${name}`),
};

export const bestAnswerApi = {
  ask: (prompt: string, enhance?: boolean) => api.post('/best-answer/ask', { prompt, enhance }),
};
