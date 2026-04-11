import { useAuthStore } from '@/stores/authStore';
import axios from 'axios';

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const apiBaseUrl = configuredApiUrl ? `${configuredApiUrl}/api` : '/api';

const isAuthEndpoint = (url?: string) => {
  if (!url) {
    return false;
  }

  return /\/auth\/(login|register|refresh)\/?$/.test(url);
};

export const publicApi = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const requestUrl = original?.url as string | undefined;
    const isAuthRequest = isAuthEndpoint(requestUrl);

    if (error.response?.status === 401 && !isAuthRequest && !original?._retry) {
      original._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const { data } = await api.post('/auth/refresh', {
          refreshToken,
        });

        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          useAuthStore.getState().setAuth(currentUser, data.accessToken, data.refreshToken);
        }

        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  },
);
