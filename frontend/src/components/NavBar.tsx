import { useState, type FC, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ThemeToggle } from './ThemeToggle';
import { Avatar } from './Avatar/Avatar';
import styles from './NavBar.module.css';

export const NavBar: FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      alert('Failed to logout');
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  if (!user) {
    return null;
  }

  const isProfileActive = location.pathname.startsWith('/profile');
  const isFeedActive = location.pathname === '/';

  return (
    <div
      className={`${styles.sideMenu} ${isOpen ? styles.sideMenuOpen : styles.sideMenuCollapsed}`}
    >
      <div className={styles.menuHeader}>
        <button
          onClick={toggleMenu}
          className={styles.hamburgerBtn}
          aria-label="Toggle Menu"
        >
          <span className="material-icons-round">menu</span>
        </button>
        {isOpen && <h2>Threadly</h2>}
      </div>

      <div className={styles.profileSection}>
        <Link
          to={`/profile/${user._id}`}
          className={`${styles.profileLink} ${isProfileActive ? styles.activeProfile : ''}`}
        >
          <Avatar
            src={user.profileImage}
            alt={user.username}
            className={styles.avatar}
            placeholderBg="var(--bs-primary)"
          />
          {isOpen && <h5 className={styles.username}>{user.username}</h5>}
        </Link>
      </div>

      <div className={styles.menuItems}>
        <Link
          to="/"
          className={`${styles.menuItem} ${isFeedActive ? styles.activeMenuItem : ''}`}
        >
          <span className={`material-icons-round ${styles.menuIcon}`}>
            home
          </span>
          {isOpen && <span className={styles.menuText}>Feed</span>}
        </Link>
      </div>

      <div className={styles.bottomSection}>
        <ThemeToggle variant="inline" className={styles.themeToggleBtn} />
        <button
          onClick={handleLogout}
          className={styles.logoutBtn}
          title="Logout"
          aria-label="Logout"
        >
          <span className="material-icons-round">logout</span>
          {isOpen && <span className={styles.menuText}>Logout</span>}
        </button>
      </div>
    </div>
  );
};
