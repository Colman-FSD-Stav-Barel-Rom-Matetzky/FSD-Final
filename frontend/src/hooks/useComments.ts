import { useState, useCallback, useRef, useEffect } from 'react';
import { commentService, CanceledError } from '../services/comment-service';
import type { Comment } from '../types/comment.types';

export const useComments = (postId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cursorRef = useRef<string | null>(null);

  const fetchMore = useCallback(() => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    const { request, abort } = commentService.getByPost(
      postId,
      cursorRef.current ?? undefined,
    );

    request
      .then((res) => {
        setComments((prev) => {
          const existingIds = new Set(prev.map((c) => c._id));
          const newComments = res.data.data.filter((c) => !existingIds.has(c._id));
          return [...prev, ...newComments];
        });
        cursorRef.current = res.data.nextCursor;
        setHasMore(res.data.nextCursor !== null);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!(err instanceof CanceledError)) {
          setError(err instanceof Error ? err.message : 'Failed to load comments');
          setIsLoading(false);
        }
      });

    return abort;
  }, [postId, isLoading]);

  useEffect(() => {
    const abort = fetchMore() ?? (() => {});
    return () => abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addComment = useCallback((comment: Comment) => {
    setComments((prev) => [comment, ...prev]);
  }, []);

  const removeComment = useCallback((commentId: string) => {
    setComments((prev) => prev.filter((c) => c._id !== commentId));
  }, []);

  return {
    comments,
    hasMore,
    fetchMore,
    isLoading,
    error,
    addComment,
    removeComment,
  };
};
