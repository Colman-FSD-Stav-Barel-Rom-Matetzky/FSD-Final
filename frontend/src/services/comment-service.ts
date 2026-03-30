import { apiClient } from '../api/client';
import { CanceledError } from 'axios';
import type { Comment, CommentsResponse } from '../types/comment.types';

const getWithAbort = <T>(url: string) => {
  const abortController = new AbortController();
  const request = apiClient.get<T>(url, {
    signal: abortController.signal,
  });

  return { request, abort: () => abortController.abort() };
};

const postWithAbort = <T>(url: string, data: unknown) => {
  const abortController = new AbortController();
  const request = apiClient.post<T>(url, data, {
    signal: abortController.signal,
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

export const commentService = {
  getByPost: (postId: string, cursor?: string, limit = 10) => {
    const params = new URLSearchParams({
      postId,
      limit: String(limit),
    });
    if (cursor) {
      params.set('lastId', cursor);
    }
    return getWithAbort<CommentsResponse>(`/comments?${params.toString()}`);
  },

  create: (postId: string, content: string) => {
    return postWithAbort<{ data: Comment }>('/comments', {
      post: postId,
      content,
    });
  },

  remove: (commentId: string) => {
    return deleteWithAbort<{ data: Comment }>(`/comments/${commentId}`);
  },
};

export { CanceledError };
