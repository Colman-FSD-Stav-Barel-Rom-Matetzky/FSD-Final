import type { FC } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { GuestRoute } from './components/GuestRoute';
import { LoginPage } from './pages/Login/LoginPage';
import { RegisterPage } from './pages/Register/RegisterPage';
import { FeedPage } from './pages/Feed/FeedPage';
import { ProfilePage } from './pages/Profile/ProfilePage';
import { CommentsPage } from './pages/Comments/CommentsPage';
import { NavBar } from './components/NavBar';
import { ThemeToggle } from './components/ThemeToggle';
import { useAuth } from './hooks/useAuth';

export const App: FC = () => {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      {/* Dynamic style tag to push main content when sidebar is open */}
      <style>{`
        #root {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .main-content-layout {
          flex: 1;
          margin-left: 80px;
          transition: margin-left 0.3s ease;
        }
        body.sidebar-open .main-content-layout {
          margin-left: 280px;
        }
        @media (max-width: 768px) {
          .main-content-layout {
            margin-left: 0;
          }
          body.sidebar-open .main-content-layout {
            margin-left: 0;
          }
        }
      `}</style>

      {user && <NavBar />}
      {!user && (
        <ThemeToggle
          variant="floating"
          className="position-fixed top-0 start-0"
        />
      )}

      <div className={user ? 'main-content-layout' : ''}>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<FeedPage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/posts/:postId/comments" element={<CommentsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};
