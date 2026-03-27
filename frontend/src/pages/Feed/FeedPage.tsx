import { useState, useRef, useCallback, useEffect } from 'react';
import type { FC } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useAuth } from '../../hooks/useAuth';
import { useFeed } from '../../hooks/useFeed';
import { PostCard } from '../../components/PostCard/PostCard';
import { PostModal } from '../../components/PostModal/PostModal';
import type { Post } from '../../types/post.types';
import styles from './FeedPage.module.css';

export const FeedPage: FC = () => {
  const { user } = useAuth();
  const {
    posts,
    hasMore,
    fetchMore,
    error,
    updatePostLikes,
    addPost,
    updatePost,
    removePost,
  } = useFeed();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const createModalKeyRef = useRef(0);

  const openCreateModal = useCallback(() => {
    createModalKeyRef.current += 1;
    setShowCreateModal(true);
  }, []);

  useEffect(() => {
    fetchMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;

  return (
    <div className={styles.feedContainer}>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <button
        className="btn btn-primary w-100 mb-3 py-2 fw-medium"
        onClick={openCreateModal}
      >
        <i className="fas fa-plus me-2"></i>New Post
      </button>

      <InfiniteScroll
        dataLength={posts.length}
        next={fetchMore}
        hasMore={hasMore}
        loader={
          <div className="d-flex justify-content-center my-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        }
        endMessage={
          <p className={styles.endMessage}>🎉 You're all caught up!</p>
        }
      >
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            currentUserId={user._id}
            onLikeToggled={updatePostLikes}
            onPostUpdated={updatePost}
            onPostDeleted={removePost}
          />
        ))}
      </InfiniteScroll>

      <PostModal
        key={createModalKeyRef.current}
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmitted={(post: Post) => {
          addPost(post);
          setShowCreateModal(false);
        }}
      />
    </div>
  );
};
