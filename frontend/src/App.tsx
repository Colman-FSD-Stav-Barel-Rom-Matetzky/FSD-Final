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
      <style>{`
        :root {
          --sidebar-width: 80px;
        }
        body.sidebar-open {
          --sidebar-width: 280px;
        }
        @media (max-width: 768px) {
          :root, body.sidebar-open {
            --sidebar-width: 0px;
          }
        }
        #root {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .main-content-layout {
          flex: 1;
          margin-left: var(--sidebar-width);
          transition: margin-left 0.3s ease;
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
