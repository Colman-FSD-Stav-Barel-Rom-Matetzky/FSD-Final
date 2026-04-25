import { useState, useCallback, useRef, useEffect } from 'react';
import { postService, CanceledError } from '../services/post-service';
import type { Post } from '../types/post.types';

export const useFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cursorRef = useRef<string | null>(null);

  const fetchMore = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    const { request, abort } = postService.getAll(
      cursorRef.current ?? undefined,
    );

    try {
      const response = await request;
      const { data, nextCursor } = response.data;

      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p._id));
        const newPosts = data.filter((p) => !existingIds.has(p._id));
        return [...prev, ...newPosts];
      });

      cursorRef.current = nextCursor;
      setHasMore(nextCursor !== null);
    } catch (err) {
      if (err instanceof CanceledError) return;
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setIsLoading(false);
    }

    return abort;
  }, [isLoading]);

  useEffect(() => {
    return () => { };
  }, []);

  const updatePostLikes = useCallback(
    (postId: string, updatedLikes: string[]) => {
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId ? { ...post, likes: updatedLikes } : post,
        ),
      );
    },
    [],
  );

  const addPost = useCallback((post: Post) => {
    setPosts((prev) => [post, ...prev]);
  }, []);

  const updatePost = useCallback((updatedPost: Post) => {
    setPosts((prev) =>
      prev.map((post) => (post._id === updatedPost._id ? updatedPost : post)),
    );
  }, []);

  const removePost = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((post) => post._id !== postId));
  }, []);

  return {
    posts,
    hasMore,
    fetchMore,
    isLoading,
    error,
    updatePostLikes,
    addPost,
    updatePost,
    removePost,
  };
};
