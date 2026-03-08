import type { FC } from 'react';
import { useAuth } from '../../hooks/useAuth';

export const FeedPage: FC = () => {
  const { logout } = useAuth();

  return (
    <div className="container mt-5">
      <h2>Feed Placeholder</h2>
      <button onClick={logout} className="btn btn-danger mt-3">
        Logout
      </button>
    </div>
  );
};
