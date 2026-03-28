import { apiClient } from '../api/client';
import type { User } from '../types/user.types';

export const userService = {
  getUserProfile: async (userId: string) => {
    const { data } = await apiClient.get<{ data: User }>(`/users/${userId}`);
    return data.data;
  },

  updateProfile: async (userId: string, formData: FormData) => {
    const { data } = await apiClient.put<{ data: User }>(
      `/users/${userId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return data.data;
  },
};
