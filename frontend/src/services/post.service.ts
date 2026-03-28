import { apiClient } from '../api/client';
import type { Post } from '../types/post.types';

export const postService = {
  getUserPosts: async (userId: string) => {
    const { data } = await apiClient.get<{ data: Post[] }>(
      `/posts/user/${userId}`,
    );
    return data.data;
  },

  createPost: async (formData: FormData) => {
    const { data } = await apiClient.post<{ data: Post }>('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.data;
  },
};
