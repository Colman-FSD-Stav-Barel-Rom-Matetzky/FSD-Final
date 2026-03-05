import type { FC } from 'react';
import { useParams } from 'react-router-dom';

export const CommentsPage: FC = () => {
  const { postId } = useParams<{ postId: string }>();

  return (
    <div className="container mt-5">
      <h2>Comments Placeholder for post: {postId}</h2>
    </div>
  );
};
