import { useState, useCallback, useEffect } from 'react';
import type { FC } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useAuth } from '../../hooks/useAuth';
import { useFeed } from '../../hooks/useFeed';
import { PostCard } from '../../components/PostCard/PostCard';
import { PostModal } from '../../components/PostModal/PostModal';
import { postService as altPostService } from '../../services/post.service';
import type { Post } from '../../types/post.types';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PostAddRoundedIcon from '@mui/icons-material/PostAddRounded';
import styles from './FeedPage.module.css';

export const FeedPage: FC = () => {
  const { user } = useAuth();
  const {
    posts,
    hasMore,
    fetchMore,
    error: feedError,
    updatePostLikes,
    addPost,
    updatePost,
    removePost,
  } = useFeed();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalKey, setModalKey] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Post[] | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleLikeToggled = useCallback(
    (postId: string, likes: string[]) => {
      updatePostLikes(postId, likes);
      setSearchResults((prev) =>
        prev ? prev.map((p) => (p._id === postId ? { ...p, likes } : p)) : prev,
      );
    },
    [updatePostLikes],
  );

  const handlePostUpdated = useCallback(
    (updatedPost: Post) => {
      updatePost(updatedPost);
      setSearchResults((prev) =>
        prev
          ? prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
          : prev,
      );
    },
    [updatePost],
  );

  const handlePostDeleted = useCallback(
    (postId: string) => {
      removePost(postId);
      setSearchResults((prev) =>
        prev ? prev.filter((p) => p._id !== postId) : prev,
      );
    },
    [removePost],
  );

  const openCreateModal = useCallback(() => {
    setModalKey((prev) => prev + 1);
    setShowCreateModal(true);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    try {
      const results = await altPostService.searchPosts(searchQuery);
      setSearchResults(results);
    } catch (err) {
      setSearchError('Search failed');
      alert('Search failed');
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchResults(null);
    setSearchQuery('');
    setSearchError(null);
  };

  useEffect(() => {
    fetchMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;

  const error = feedError || searchError;

  return (
    <div className={styles.feedContainer}>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <button
        className={styles.fab}
        onClick={openCreateModal}
        title="Create New Post"
      >
        <PostAddRoundedIcon fontSize="large" />
        <span className={styles.fabText}>Add Post</span>
      </button>
      <InfiniteScroll
        dataLength={
          searchResults !== null ? searchResults.length : posts.length
        }
        next={fetchMore}
        hasMore={searchResults !== null ? false : hasMore}
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
            width: '100%',
            marginBottom: '1.5rem',
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
              placeholder="Search Posts..."
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

        {searchResults !== null && (
          <div className="mb-3">
            <h4 className="h5 text-muted">
              Search Results ({searchResults.length})
            </h4>
            {searchResults.length === 0 && (
              <p>No posts found matching your search.</p>
            )}
          </div>
        )}

        {(searchResults !== null ? searchResults : posts).map((post) => (
          <PostCard
            key={post._id}
            post={post}
            currentUserId={user._id}
            onLikeToggled={handleLikeToggled}
            onPostUpdated={handlePostUpdated}
            onPostDeleted={handlePostDeleted}
          />
        ))}
      </InfiniteScroll>

      <PostModal
        key={modalKey}
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
