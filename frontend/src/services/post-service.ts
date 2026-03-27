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

export const postService = {
  getAll: (cursor?: string, limit = 10) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) {
      params.set('lastId', cursor);
    }
    return getWithAbort<FeedResponse>(`/posts?${params.toString()}`);
  },

  toggleLike: (postId: string) => {
    return postWithAbort<Post>(`/posts/${postId}/like`);
  },
};

export { CanceledError };
