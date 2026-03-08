import { useState, type FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { isAxiosError } from 'axios';
import styles from './RegisterPage.module.css';

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username cannot exceed 20 characters'),
    email: z.email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);

    try {
      const credentials = {
        username: data.username,
        email: data.email,
        password: data.password,
      };

      await registerUser(credentials);
      navigate('/');
    } catch (error: unknown) {
      let message = 'Failed to register. Please try again.';

      if (isAxiosError(error) && error.response?.data?.error) {
        message = error.response.data.error;
      }

      setServerError(message);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={`card ${styles.registerCard} p-4`}>
        <div className="card-body">
          <h2 className="text-center mb-4 text-primary fw-bold">SocialApp</h2>
          <h5 className="text-center mb-4 text-muted">Create an account</h5>

          {serverError && (
            <div className="alert alert-danger" role="alert">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label className="form-label fw-medium">Email</label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder="Enter your email"
                {...register('email')}
                disabled={isSubmitting}
              />
              {errors.email && (
                <div className={styles.errorText}>{errors.email.message}</div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label fw-medium">Username</label>
              <input
                type="text"
                className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                placeholder="Choose a username"
                {...register('username')}
                disabled={isSubmitting}
              />
              {errors.username && (
                <div className={styles.errorText}>
                  {errors.username.message}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label fw-medium">Password</label>
              <input
                type="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Create a password (min 6 chars)"
                {...register('password')}
                disabled={isSubmitting}
              />
              {errors.password && (
                <div className={styles.errorText}>
                  {errors.password.message}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="form-label fw-medium">Confirm Password</label>
              <input
                type="password"
                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                placeholder="Confirm your password"
                {...register('confirmPassword')}
                disabled={isSubmitting}
              />
              {errors.confirmPassword && (
                <div className={styles.errorText}>
                  {errors.confirmPassword.message}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Creating account...
                </>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="text-muted">Already have an account? </span>
            <Link to="/login" className="text-decoration-none fw-medium">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
