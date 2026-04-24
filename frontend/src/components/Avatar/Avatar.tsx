import type { FC } from 'react';
import { ApiConfig } from '../../config/api.config';
import styles from './Avatar.module.css';

type AvatarProps = {
  src?: string;
  alt: string;
  size?: number | string;
  placeholderBg?: string;
  fontSize?: string;
  className?: string;
};

export const Avatar: FC<AvatarProps> = ({
  src,
  alt,
  size,
  placeholderBg = 'var(--bs-secondary)',
  fontSize = '1rem',
  className = '',
}) => {
  const isAbsoluteUrl = (url: string) =>
    url.startsWith('http') ||
    url.startsWith('data:') ||
    url.startsWith('blob:');

  if (src) {
    return (
      <img
        src={isAbsoluteUrl(src) ? src : `${ApiConfig.baseUrl}${src}`}
        alt={alt}
        className={`${styles.avatar} ${className}`.trim()}
        style={size ? { width: size, height: size } : undefined}
      />
    );
  }

  return (
    <div
      className={`${styles.avatarPlaceholder} ${className}`.trim()}
      style={{
        ...(size ? { width: size, height: size } : {}),
        backgroundColor: placeholderBg,
        fontSize,
      }}
    >
      {alt.charAt(0).toUpperCase()}
    </div>
  );
};
