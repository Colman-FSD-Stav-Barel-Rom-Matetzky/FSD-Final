import type { FC } from 'react';
import { useParams } from 'react-router-dom';

export const ProfilePage: FC = () => {
  const { userId } = useParams<{ userId: string }>();

  return (
    <div className="container mt-5">
      <h2>Profile Placeholder for user: {userId}</h2>
    </div>
  );
};
