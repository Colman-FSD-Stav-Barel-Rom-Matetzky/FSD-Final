import type { FC } from 'react';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/user.service';
import { postService } from '../../services/post.service';
import { PostCard } from '../../components/PostCard/PostCard';
import { Avatar } from '../../components/Avatar/Avatar';
import type { User } from '../../types/user.types';
import type { Post } from '../../types/post.types';
import styles from './ProfilePage.module.css';

export const ProfilePage: FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOwnProfile = currentUser?._id === userId;

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) return;

      setLoading(true);
      try {
        const [userData, userPosts] = await Promise.all([
          userService.getUserProfile(userId),
          postService.getUserPosts(userId),
        ]);

        setProfileUser(userData);
        setEditUsername(userData.username);
        setPosts(userPosts);
      } catch {
        setError('Failed to load profile. They might not exist.');
      } finally {
        setLoading(false);
      }
    };

    void fetchProfileData();
  }, [userId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    if (!userId) return;

    try {
      const formData = new FormData();
      if (editUsername !== profileUser?.username) {
        formData.append('username', editUsername);
      }
      if (imageFile) {
        formData.append('profileImage', imageFile);
      }

      const updatedUser = await userService.updateProfile(userId, formData);
      setProfileUser(updatedUser);
      window.location.reload();
    } catch {
      alert('Failed to update profile');
    }
  };

  if (loading) return <div className={styles.loading}>Loading profile...</div>;
  if (error || !profileUser) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <div className={styles.profileImageContainer}>
          <Avatar
            src={imagePreview || profileUser.profileImage}
            alt={profileUser.username}
            className={styles.profileImage}
            placeholderBg="var(--bs-primary)"
            fontSize="4rem"
          />
          {isEditing && (
            <label className={styles.editImageLabel}>
              Change
              <input
                type="file"
                ref={fileInputRef}
                className={styles.hiddenInput}
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>

        <div className={styles.profileInfo}>
          {isEditing ? (
            <div className={styles.editForm}>
              <div className={styles.formGroup}>
                <label>Username:</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                />
              </div>
              <div className={styles.buttonGroup}>
                <button
                  onClick={handleSaveProfile}
                  className={styles.saveButton}
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditUsername(profileUser.username);
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.usernameDisplay}>
                <h2>{profileUser.username}</h2>
                {isOwnProfile && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className={styles.editButton}
                    title="Edit Profile"
                    aria-label="Edit Profile"
                  >
                    <span
                      className="material-icons-round"
                      style={{ fontSize: '20px' }}
                    >
                      edit
                    </span>
                  </button>
                )}
              </div>
              <div className={styles.email}>{profileUser.email}</div>
            </>
          )}
        </div>
      </div>

      <div className={styles.postsSection}>
        <h3>Posts</h3>
        {posts.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUserId={currentUser!._id}
              onLikeToggled={(postId, updatedLikes) =>
                setPosts((prev) =>
                  prev.map((p) =>
                    p._id === postId ? { ...p, likes: updatedLikes } : p,
                  ),
                )
              }
              onPostUpdated={(updated) =>
                setPosts((prev) =>
                  prev.map((p) => (p._id === updated._id ? updated : p)),
                )
              }
              onPostDeleted={(postId) =>
                setPosts((prev) => prev.filter((p) => p._id !== postId))
              }
            />
          ))
        )}
      </div>
    </div>
  );
};
