import { useState, type FC } from 'react';
import { commentService } from '../../services/comment-service';
import type { Comment } from '../../types/comment.types';
import { timeAgo } from '../../utils/date.utils';
import { Avatar } from '../Avatar/Avatar';
import styles from './CommentItem.module.css';

type CommentItemProps = {
  comment: Comment;
  currentUserId: string;
  onDeleted: (commentId: string) => void;
};

export const CommentItem: FC<CommentItemProps> = ({
  comment,
  currentUserId,
  onDeleted,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const isOwner = comment.owner._id === currentUserId;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { request } = commentService.remove(comment._id);
      await request;
      onDeleted(comment._id);
    } catch {
      alert('Failed to delete comment');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.commentItem}>
      <Avatar
        src={comment.owner.profileImage}
        alt={comment.owner.username}
        size={32}
        placeholderBg="var(--bs-primary)"
        fontSize="0.8rem"
      />
      <div className={styles.commentBody}>
        <div className={styles.commentHeader}>
          <span className={styles.commentUsername}>
            {comment.owner.username}
          </span>
          <span className={styles.commentTimestamp}>
            {timeAgo(comment.createdAt)}
          </span>
        </div>
        <div className={styles.commentContent}>{comment.content}</div>
      </div>
      {isOwner && (
        <button
          className={styles.deleteBtn}
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label="Delete comment"
        >
          {isDeleting ? (
            <i
              className={`fas fa-circle-notch fa-spin ${styles.deleteSpinner}`}
            ></i>
          ) : (
            <i className="fas fa-trash"></i>
          )}
        </button>
      )}
    </div>
  );
};
