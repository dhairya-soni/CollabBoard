import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Axios instance pre-configured with:
 * - Base URL pointing to Express API
 * - JSON content type
 * - Auth token injection from Zustand store
 * - 401 auto-logout
 */
export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Inject Bearer token on every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const store = useAuthStore.getState();
      // Only logout if we were logged in (avoids redirect loops on login page)
      if (store.token) {
        store.logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
