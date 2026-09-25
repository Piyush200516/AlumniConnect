import axios from 'axios';
import type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

const DEFAULT_API_BASE_URL = 'http://localhost:5002/api';

/** Free-tier hosts suspend idle instances, so the first request can take ~50s. */
const REQUEST_TIMEOUT_MS = 60_000;
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 1_500;
const SLOW_REQUEST_THRESHOLD_MS = 4_000;

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

export const SERVER_WAKING_EVENT = 'alumniconnect:server-waking';

const emitServerWaking = (waking: boolean) => {
  window.dispatchEvent(new CustomEvent<boolean>(SERVER_WAKING_EVENT, { detail: waking }));
};

let pendingSlowRequests = 0;

const markSlow = (config: RetryableConfig) => {
  if (config.countedAsSlow) return;
  config.countedAsSlow = true;
  pendingSlowRequests += 1;
  emitServerWaking(true);
};

const trackSlowRequest = (config: RetryableConfig) => {
  config.slowTimer = window.setTimeout(() => markSlow(config), SLOW_REQUEST_THRESHOLD_MS);
};

const clearSlowTimer = (config?: RetryableConfig) => {
  if (config?.slowTimer !== undefined) {
    window.clearTimeout(config.slowTimer);
    config.slowTimer = undefined;
  }
};

const untrackSlowRequest = (config?: RetryableConfig) => {
  if (!config) return;
  clearSlowTimer(config);
  if (config.countedAsSlow) {
    config.countedAsSlow = false;
    pendingSlowRequests = Math.max(0, pendingSlowRequests - 1);
    if (pendingSlowRequests === 0) {
      emitServerWaking(false);
    }
  }
};

interface RetryableConfig extends InternalAxiosRequestConfig {
  retryCount?: number;
  slowTimer?: number;
  countedAsSlow?: boolean;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  trackSlowRequest(config as RetryableConfig);
  return config;
});

const isAuthRequest = (config?: AxiosRequestConfig) =>
  Boolean(config?.url && config.url.includes('/auth/'));

const isRetryable = (error: AxiosError) => {
  const method = (error.config?.method ?? 'get').toLowerCase();
  const status = error.response?.status;

  // Timeouts and network failures happen while a suspended server boots up.
  if (!error.response) {
    return error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK';
  }

  // 502/503/504 are emitted by the platform proxy while the instance restarts.
  const retryableStatuses = [502, 503, 504];
  if (!retryableStatuses.includes(status ?? 0)) {
    return false;
  }

  return ['get', 'head', 'options', 'post'].includes(method);
};

const clearSession = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('role');
};

api.interceptors.response.use(
  (response) => {
    untrackSlowRequest(response.config as RetryableConfig);
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined;

    if (config && isRetryable(error)) {
      const retryCount = config.retryCount ?? 0;
      if (retryCount < MAX_RETRIES) {
        config.retryCount = retryCount + 1;
        clearSlowTimer(config);
        markSlow(config);
        await new Promise((resolve) => setTimeout(resolve, RETRY_BASE_DELAY_MS * 2 ** retryCount));
        return api(config);
      }
    }

    untrackSlowRequest(config);

    if (error.response?.status === 401 && !isAuthRequest(error.config)) {
      clearSession();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

/** Wakes a suspended backend so the first real request is not stuck behind a cold start. */
export const warmUpServer = () =>
  fetch(`${API_ORIGIN}/health`, { method: 'GET', cache: 'no-store' }).catch(() => undefined);

/** Turns an axios failure into a message that is actually useful to the user. */
export const getErrorMessage = (error: unknown, fallback = 'Something went wrong. Please try again.') => {
  if (axios.isAxiosError(error)) {
    const serverMessage = (error.response?.data as { message?: string } | undefined)?.message;
    if (serverMessage) {
      return serverMessage;
    }
    if (error.code === 'ECONNABORTED') {
      return 'The server took too long to respond. It may be waking up — please try again.';
    }
    if (!error.response) {
      return 'Cannot reach the server. Check your connection and try again.';
    }
    if (error.response.status >= 500) {
      return 'The server is temporarily unavailable. Please try again in a moment.';
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

export default api;
