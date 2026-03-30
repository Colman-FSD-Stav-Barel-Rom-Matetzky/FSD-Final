import { apiClient } from '../api/client';
import { CanceledError } from 'axios';
import type { FeedResponse, Post } from '../types/post.types';

const getWithAbort = <T>(url: string) => {
  const abortController = new AbortController();
  const request = apiClient.get<T>(url, {
    signal: abortController.signal,
  });

  return { request, abort: () => abortController.abort() };
};

const postWithAbort = <T>(url: string) => {
  const abortController = new AbortController();
  const request = apiClient.post<T>(
    url,
    {},
    {
      signal: abortController.signal,
    },
  );

  return { request, abort: () => abortController.abort() };
};

const postFormDataWithAbort = <T>(url: string, formData: FormData) => {
  const abortController = new AbortController();
  const request = apiClient.post<T>(url, formData, {
    signal: abortController.signal,
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return { request, abort: () => abortController.abort() };
};

const putFormDataWithAbort = <T>(url: string, formData: FormData) => {
  const abortController = new AbortController();
  const request = apiClient.put<T>(url, formData, {
    signal: abortController.signal,
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return { request, abort: () => abortController.abort() };
};

const deleteWithAbort = <T>(url: string) => {
  const abortController = new AbortController();
  const request = apiClient.delete<T>(url, {
    signal: abortController.signal,
  });

  return { request, abort: () => abortController.abort() };
};

export const postService = {
  getAll: (cursor?: string, limit = 10) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) {
      params.set('lastId', cursor);
    }
    return getWithAbort<FeedResponse>(`/posts?${params.toString()}`);
  },

  getById: (postId: string) => {
    return getWithAbort<{ data: Post }>(`/posts/${postId}`);
  },

  toggleLike: (postId: string) => {
    return postWithAbort<{ data: { likes: string[] } }>(
      `/posts/${postId}/like`,
    );
  },

  create: (formData: FormData) => {
    return postFormDataWithAbort<{ data: Post }>('/posts', formData);
  },

  update: (postId: string, formData: FormData) => {
    return putFormDataWithAbort<{ data: Post }>(`/posts/${postId}`, formData);
  },

  remove: (postId: string) => {
    return deleteWithAbort<{ data: { message: string } }>(`/posts/${postId}`);
  },
};

export { CanceledError };
