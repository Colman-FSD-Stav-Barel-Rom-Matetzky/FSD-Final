import { useState, useRef, useCallback, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { postService } from '../../services/post-service';
import type { Post } from '../../types/post.types';
import { PostModal } from '../PostModal/PostModal';
import { DeleteConfirmModal } from '../DeleteConfirmModal/DeleteConfirmModal';
import { ApiConfig } from '../../config/api.config';
import styles from './PostCard.module.css';

type PostCardProps = {
  post: Post;
  currentUserId: string;
  onLikeToggled: (postId: string, likes: string[]) => void;
  onPostUpdated: (post: Post) => void;
  onPostDeleted: (postId: string) => void;
};

export const PostCard: FC<PostCardProps> = ({
  post,
  currentUserId,
  onLikeToggled,
  onPostUpdated,
  onPostDeleted,
}) => {
  const navigate = useNavigate();
  const isLiked = post.likes.includes(currentUserId);
  const isOwner = post.owner._id === currentUserId;

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const editModalKeyRef = useRef(0);

  const openEditModal = useCallback(() => {
    editModalKeyRef.current += 1;
    setShowEditModal(true);
  }, []);

  const handleLike = async () => {
    const previousLikes = [...post.likes];

    // Optimistic update
    const updatedLikes = isLiked
      ? previousLikes.filter((id) => id !== currentUserId)
      : [...previousLikes, currentUserId];
    onLikeToggled(post._id, updatedLikes);

    try {
      const { request } = postService.toggleLike(post._id);
      const response = await request;
      onLikeToggled(post._id, response.data.data.likes);
    } catch {
      // Revert on failure
      onLikeToggled(post._id, previousLikes);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const { request } = postService.remove(post._id);
      await request;
      onPostDeleted(post._id);
      setShowDeleteModal(false);
    } catch {
      // Let user know — could add inline error, keeping it simple
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSubmitted = (updatedPost: Post) => {
    onPostUpdated(updatedPost);
    setShowEditModal(false);
  };

  const handleCommentClick = () => {
    navigate(`/posts/${post._id}/comments`);
  };

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

  return (
    <>
      <div className="card mb-3">
        <div className="card-body">
          <div className="d-flex align-items-center gap-2 mb-2">
            {post.owner.profileImage ? (
              <img
                src={
                  post.owner.profileImage.startsWith('http')
                    ? post.owner.profileImage
                    : `${ApiConfig.baseUrl}${post.owner.profileImage}`
                }
                alt={post.owner.username}
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {post.owner.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-grow-1">
              <strong style={{ color: 'var(--bs-body-color)' }}>
                {post.owner.username}
              </strong>
              <br />
              <small style={{ color: 'var(--bs-secondary-color)' }}>
                {timeAgo(post.createdAt)}
              </small>
            </div>

            {isOwner && (
              <div className="dropdown">
                <button
                  className="btn btn-sm"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ color: 'var(--bs-secondary-color)' }}
                >
                  <i className="fas fa-ellipsis-h"></i>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <button
                      className="dropdown-item"
                      type="button"
                      onClick={openEditModal}
                    >
                      <i className="fas fa-pen me-2"></i>Edit
                    </button>
                  </li>
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      <i className="fas fa-trash me-2"></i>Delete
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>

          <p
            className="card-text mb-2"
            style={{ color: 'var(--bs-body-color)' }}
          >
            {post.content}
          </p>
        </div>

        {post.image && (
          <img
            src={
              post.image.startsWith('http')
                ? post.image
                : `${ApiConfig.baseUrl}${post.image}`
            }
            alt="Post"
            className={styles.postImage}
          />
        )}

        <div className="card-body d-flex align-items-center gap-3 pt-2 pb-2">
          <button
            className={`${styles.likeBtn} ${isLiked ? styles.liked : ''}`}
            onClick={handleLike}
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            {isLiked ? (
              <i className="fas fa-heart"></i>
            ) : (
              <i className="far fa-heart"></i>
            )}
            <span>{post.likes.length > 0 ? post.likes.length : ''}</span>
          </button>

          <button
            className={styles.commentBtn}
            onClick={handleCommentClick}
            aria-label="Comments"
          >
            <i className="far fa-comment"></i>
            <span>{post.commentCount > 0 ? post.commentCount : ''}</span>
          </button>
        </div>
      </div>

      <PostModal
        key={editModalKeyRef.current}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmitted={handleEditSubmitted}
        post={post}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
};
