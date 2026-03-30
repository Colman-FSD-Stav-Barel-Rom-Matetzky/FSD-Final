import { type FC } from 'react';
import { useTheme } from '../hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
  variant?: 'floating' | 'inline';
}

export const ThemeToggle: FC<ThemeToggleProps> = ({
  className = '',
  variant = 'inline',
}) => {
  const { theme, toggleTheme } = useTheme();

  const isFloating = variant === 'floating';

  return (
    <button
      onClick={toggleTheme}
      className={isFloating ? `rounded-circle m-4 ${className}` : className}
      title="Toggle theme"
      style={
        isFloating
          ? {
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
            }
          : {
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '32px',
              padding: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--bs-body-color)',
              transition: 'all 0.2s ease',
            }
      }
    >
      <span
        className="material-icons-round"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {theme === 'light' ? 'dark_mode' : 'light_mode'}
      </span>
    </button>
  );
};
