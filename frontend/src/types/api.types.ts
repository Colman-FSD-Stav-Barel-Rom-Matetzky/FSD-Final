import { type InternalAxiosRequestConfig } from 'axios';

export type QueueCallback = (token: string) => void;

export type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};
