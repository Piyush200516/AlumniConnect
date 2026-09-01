import axios from 'axios';

const DEFAULT_API_BASE_URL = 'http://localhost:5002/api';

export const normalizeApiBaseUrl = (value?: string) => {
  const rawBaseUrl = value?.trim() || DEFAULT_API_BASE_URL;
  const baseUrl = rawBaseUrl.replace(/\/+$/, '');

  if (/\/api(?:\/v\d+)?$/i.test(baseUrl)) {
    return baseUrl;
  }

  return `${baseUrl}/api`;
};

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);
export const API_ORIGIN = API_BASE_URL.replace(/\/api(?:\/v\d+)?$/i, '');

export const getApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

export default api;
