import { useState, type FC } from 'react';
import { commentService } from '../../services/comment-service';
import type { Comment } from '../../types/comment.types';
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

  const timeAgo = (dateStr: string): string => {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { request } = commentService.remove(comment._id);
      await request;
      onDeleted(comment._id);
    } catch {
      // Could show inline error, keeping it simple for comments
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.commentItem}>
      {comment.owner.profileImage ? (
        <img
          src={comment.owner.profileImage}
          alt={comment.owner.username}
          className={styles.avatar}
        />
      ) : (
        <div className={styles.avatarPlaceholder}>
          {comment.owner.username.charAt(0).toUpperCase()}
        </div>
      )}
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
