import { Router } from 'express';
import { postController } from '../controllers/post.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { aiRateLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Post management API
 */

/**
 * @swagger
 * /posts/user/{userId}:
 *   get:
 *     summary: Get all posts by a specific user
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: A list of user's posts
 *       500:
 *         description: Internal Server Error
 */
router.get('/user/:userId', postController.getByUserId.bind(postController));

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Created post
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  '/',
  authMiddleware,
  uploadMiddleware.array('images', 5),
  postController.createWithImages.bind(postController),
);

/**
 * @swagger
 * /posts/search:
 *   get:
 *     summary: Semantic search for posts using AI
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Conversational search query
 *     responses:
 *       200:
 *         description: A ranked list of posts
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Too many search requests
 *       500:
 *         description: Internal Server Error
 */
router.get(
  '/search',
  authMiddleware,
  aiRateLimiter,
  postController.searchPosts.bind(postController),
);

// We can map basic CRUD from BaseController
router.get('/', postController.get.bind(postController));
router.get('/:id', postController.getById.bind(postController));
router.put('/:id', authMiddleware, postController.put.bind(postController));
router.delete('/:id', authMiddleware, postController.del.bind(postController));

export default router;
