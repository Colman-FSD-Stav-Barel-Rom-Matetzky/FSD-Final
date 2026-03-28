import type { User } from './user.types';

export interface Post {
  _id: string;
  content: string;
  author: User;
  images?: string[];
  likes: string[];
  createdAt: string;
  updatedAt: string;
}
