import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import { ApiConfig } from '../config/api.config';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearAuth,
} from '../utils/storage.utils';
import type { QueueCallback, RetryableRequestConfig } from '../types/api.types';

const refreshState = {
  isRefreshing: false,
  failedQueue: [] as QueueCallback[],
};

export const apiClient = axios.create({
  baseURL: ApiConfig.baseUrl,
  withCredentials: true,
});

const processQueue = (token: string) => {
  refreshState.failedQueue.forEach((cb) => cb(token));
  refreshState.failedQueue = [];
};

const handleAuthFailure = () => {
  clearAuth();
  refreshState.failedQueue = [];
  window.location.href = '/login';
};

const performTokenRefresh = async (refreshToken: string) => {
  const { data } = await axios.post<{
    data: { accessToken: string; refreshToken: string };
  }>(`${ApiConfig.baseUrl}/auth/refresh`, { refreshToken });

  return data.data;
};

const onRequest = (config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

const onResponseSuccess = (response: AxiosResponse) => response;

const onResponseError = async (error: AxiosError) => {
  const originalRequest = error.config as RetryableRequestConfig;

  if (error.response?.status !== 401 || originalRequest._retry) {
    return Promise.reject(error);
  }

  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    handleAuthFailure();

    return Promise.reject(error);
  }

  if (refreshState.isRefreshing) {
    return new Promise<string>((resolve) => {
      refreshState.failedQueue.push(resolve);
    }).then((token) => {
      originalRequest.headers.Authorization = `Bearer ${token}`;

      return apiClient(originalRequest);
    });
  }

  originalRequest._retry = true;
  refreshState.isRefreshing = true;

  try {
    const { accessToken, refreshToken: newRefreshToken } =
      await performTokenRefresh(refreshToken);

    setTokens(accessToken, newRefreshToken);
    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
    processQueue(accessToken);

    return apiClient(originalRequest);
  } catch (refreshError) {
    handleAuthFailure();
    return Promise.reject(refreshError);
  } finally {
    refreshState.isRefreshing = false;
  }
};

apiClient.interceptors.request.use(onRequest);
apiClient.interceptors.response.use(onResponseSuccess, onResponseError);
