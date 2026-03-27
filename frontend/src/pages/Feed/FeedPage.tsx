import { useEffect } from 'react';
import type { FC } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useAuth } from '../../hooks/useAuth';
import { useFeed } from '../../hooks/useFeed';
import { PostCard } from '../../components/PostCard/PostCard';
import styles from './FeedPage.module.css';

export const FeedPage: FC = () => {
  const { user } = useAuth();
  const { posts, hasMore, fetchMore, error, updatePostLikes } = useFeed();

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
          />
        ))}
      </InfiniteScroll>
    </div>
  );
};
