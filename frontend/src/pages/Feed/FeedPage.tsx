import { type FC, useState } from 'react';
import { postService } from '../../services/post.service';
import type { Post } from '../../types/post.types';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

export const FeedPage: FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    setError(null);
    try {
      const results = await postService.searchPosts(searchQuery);
      setSearchResults(results);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e?.response?.data?.error || 'Failed to search posts');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setError(null);
  };

  return (
    <div className="container mt-5">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h2>Feed Placeholder</h2>

        {/* Smart Search Bar */}
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
    </div>
  );
};
