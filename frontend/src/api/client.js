import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fabulous-reprieve-production-94b4.up.railway.app/api';
export const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
      const loginPath = `${basePath}/login`;
      if (!window.location.pathname.endsWith('/login')) {
        window.location.href = loginPath;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
