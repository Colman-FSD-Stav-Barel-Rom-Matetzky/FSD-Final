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
        <form
          onSubmit={handleSearch}
          style={{
            display: 'flex',
            gap: '8px',
            position: 'relative',
            width: '300px',
          }}
        >
          <div style={{ position: 'relative', width: '100%' }}>
            <AutoAwesomeRoundedIcon
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#888',
                fontSize: '1.2rem',
              }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Smart Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isSearching}
              style={{
                paddingLeft: '35px',
                paddingRight: '40px',
                borderRadius: '20px',
              }}
            />
            {searchQuery !== '' && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  if (searchResults !== null) {
                    handleClearSearch();
                  }
                }}
                disabled={isSearching}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#888',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <ClearRoundedIcon fontSize="small" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSearching || !searchQuery.trim()}
            style={{
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              padding: '0',
            }}
          >
            {isSearching ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              />
            ) : (
              <SearchRoundedIcon fontSize="small" />
            )}
          </button>
        </form>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {searchResults !== null ? (
        <div className="search-results">
          <h4>Search Results ({searchResults.length})</h4>
          {searchResults.length === 0 ? (
            <p>No posts found matching your search.</p>
          ) : (
            <ul className="list-group">
              {searchResults.map((post) => (
                <li key={post._id} className="list-group-item">
                  <p>{post.content}</p>
                  <small className="text-muted">
                    Author:{' '}
                    {typeof post.author === 'object' &&
                    post.author !== null &&
                    'username' in post.author
                      ? String(post.author.username)
                      : String(post.author)}
                  </small>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="normal-feed">
          <p>Normal feed posts will appear here...</p>
        </div>
      )}
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
