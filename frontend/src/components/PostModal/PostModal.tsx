import { useState, type FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { postService } from '../../services/post-service';
import type { Post } from '../../types/post.types';
import { ApiConfig } from '../../config/api.config';
import styles from './PostModal.module.css';

const postSchema = z.object({
  content: z.string().min(1, 'Content is required'),
});

type PostFormData = z.infer<typeof postSchema>;

type PostModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: (post: Post) => void;
  post?: Post;
};

export const PostModal: FC<PostModalProps> = ({
  isOpen,
  onClose,
  onSubmitted,
  post,
}) => {
  const isEditMode = !!post;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: post?.content ?? '',
    },
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    post?.image ?? null,
  );
  const [serverError, setServerError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);

    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(post?.image ?? null);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
  };

  const onSubmit = async (data: PostFormData) => {
    setServerError(null);

    const formData = new FormData();
    formData.append('content', data.content);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const { request } = isEditMode
        ? postService.update(post!._id, formData)
        : postService.create(formData);

      const response = await request;
      onSubmitted(response.data.data);
      onClose();
    } catch (error: unknown) {
      let message = 'Something went wrong. Please try again.';
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'error' in error.response.data
      ) {
        message = String((error.response.data as { error: string }).error);
      }
      setServerError(message);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {isEditMode ? 'Edit Post' : 'New Post'}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-body">
              {serverError && (
                <div className="alert alert-danger" role="alert">
                  {serverError}
                </div>
              )}

              <div className="mb-3">
                <label className="form-label fw-medium">Content</label>
                <textarea
                  className={`form-control ${errors.content ? 'is-invalid' : ''}`}
                  rows={4}
                  placeholder="What's on your mind?"
                  {...register('content')}
                  disabled={isSubmitting}
                />
                {errors.content && (
                  <div className="invalid-feedback">
                    {errors.content.message}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label fw-medium">Image</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                />
              </div>

              {previewUrl && (
                <div className={styles.imagePreview}>
                  <img
                    src={
                      previewUrl.startsWith('http') || previewUrl.startsWith('blob:')
                        ? previewUrl
                        : `${ApiConfig.baseUrl}${previewUrl}`
                    }
                    alt="Preview"
                  />
                  <button
                    type="button"
                    className={styles.removeImageBtn}
                    onClick={handleRemoveImage}
                    disabled={isSubmitting}
                    aria-label="Remove image"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    {isEditMode ? 'Saving...' : 'Creating...'}
                  </>
                ) : isEditMode ? (
                  'Save Changes'
                ) : (
                  'Create Post'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
