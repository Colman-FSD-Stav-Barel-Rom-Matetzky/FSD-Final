import { apiClient } from '../api/client';
import type {
  AuthCredentials,
  RegisterCredentials,
  AuthResponse,
  RefreshResponse,
  LogoutResponse,
} from '../types/auth.types';

const postWithAbort = <T>(
  url: string,
  body: AuthCredentials | RegisterCredentials | { refreshToken: string },
) => {
  const abortController = new AbortController();
  const request = apiClient.post<T>(url, body, {
    signal: abortController.signal,
  });

  return { request, abort: () => abortController.abort() };
};

export const register = (credentials: RegisterCredentials) =>
  postWithAbort<AuthResponse>('/auth/register', credentials);

export const login = (credentials: AuthCredentials) =>
  postWithAbort<AuthResponse>('/auth/login', credentials);

export const refresh = (refreshToken: string) =>
  postWithAbort<RefreshResponse>('/auth/refresh', { refreshToken });

export const logout = (refreshToken: string) =>
  postWithAbort<LogoutResponse>('/auth/logout', { refreshToken });
