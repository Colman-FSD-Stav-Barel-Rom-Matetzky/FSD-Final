import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useAuth } from '../../hooks/useAuth';
import { useComments } from '../../hooks/useComments';
import { postService } from '../../services/post-service';
import { commentService } from '../../services/comment-service';
import { PostCard } from '../../components/PostCard/PostCard';
import { CommentItem } from '../../components/CommentItem/CommentItem';
import type { Post } from '../../types/post.types';
import styles from './CommentsPage.module.css';

export const CommentsPage: FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [postLoading, setPostLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const {
    comments,
    hasMore,
    fetchMore,

    error,
    addComment,
    removeComment,
  } = useComments(postId!);

  useEffect(() => {
    if (!postId) return;

    setPostLoading(true);
    const { request, abort } = postService.getById(postId);

    request
      .then((res) => {
        setPost(res.data.data);
        setPostLoading(false);
      })
      .catch(() => {
        setPostLoading(false);
      });

    return () => abort();
  }, [postId]);

  const handlePostComment = async () => {
    if (!newComment.trim() || !postId) return;
    setIsPosting(true);
    try {
      const { request } = commentService.create(postId, newComment.trim());
      const res = await request;
      addComment(res.data.data);
      setNewComment('');
    } catch {
      // Could show inline error if needed
    } finally {
      setIsPosting(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      {/* Sticky header */}
      <div className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <span className="fw-semibold">Comments</span>
      </div>

      <div className={styles.page}>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Original post */}
        {postLoading && (
          <div className="text-center py-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        {post && (
          <PostCard
            post={post}
            currentUserId={user._id}
            onLikeToggled={(_postId, updatedLikes) =>
              setPost((p) => (p ? { ...p, likes: updatedLikes } : p))
            }
            onPostUpdated={(updated) => setPost(updated)}
            onPostDeleted={() => navigate('/')}
          />
        )}

        <hr className="my-2" />

        {/* Comments infinite scroll */}
        <InfiniteScroll
          dataLength={comments.length}
          next={fetchMore}
          hasMore={hasMore}
          loader={
            <div className="text-center py-2">
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          }
          endMessage={
            <p className="text-center text-secondary py-2">
              {comments.length > 0
                ? 'No more comments'
                : 'No comments yet. Be the first!'}
            </p>
          }
        >
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              currentUserId={user._id}
              onDeleted={removeComment}
            />
          ))}
        </InfiniteScroll>
      </div>

      {/* Pinned comment input */}
      <div className={styles.commentInput}>
        <input
          type="text"
          className="form-control"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) =>
            e.key === 'Enter' && !isPosting && handlePostComment()
          }
          disabled={isPosting}
        />
        <button
          className={`${styles.sendBtn} btn btn-primary`}
          onClick={handlePostComment}
          disabled={!newComment.trim() || isPosting}
          aria-label="Send comment"
        >
          {isPosting ? (
            <span className="spinner-border spinner-border-sm"></span>
          ) : (
            <i className="fas fa-paper-plane"></i>
          )}
        </button>
      </div>
    </div>
  );
};
