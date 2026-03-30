import rateLimit from 'express-rate-limit';

export const aiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: {
    error:
      'Too many requests to the AI search service, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
