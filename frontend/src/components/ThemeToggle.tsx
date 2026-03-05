import type { FC } from 'react';
import { useTheme } from '../hooks/useTheme';

export const ThemeToggle: FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="rounded-circle position-fixed top-0 start-0 m-4"
      style={{
        width: '64px',
        height: '64px',
        fontSize: '1.75rem',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        backgroundColor: 'var(--bs-card-bg)',
        color: 'var(--bs-body-color)',
        border: '1px solid var(--bs-border-color-translucent)',
        boxShadow:
          '0 12px 36px rgba(0, 0, 0, 0.6), 0 6px 16px rgba(0, 0, 0, 0.4)',
      }}
      title="Toggle theme"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};
