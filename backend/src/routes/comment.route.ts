import express from 'express';
import { commentController } from '../controllers/comment.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Comment CRUD operations on posts
 */

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Get paginated comments for a post
 *     description: Returns a cursor-paginated list of comments for a specific post, sorted by newest first. Use the nextCursor from the response as the lastId query parameter to fetch the next page.
 *     tags: [Comments]
 *     parameters:
 *       - in: query
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID to fetch comments for
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Maximum number of comments to return
 *       - in: query
 *         name: lastId
 *         required: false
 *         schema:
 *           type: string
 *         description: Cursor for the next page (use nextCursor from previous response)
 *     responses:
 *       200:
 *         description: Paginated comments fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedComments'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         description: Internal server error
 */
router.get('/', commentController.get.bind(commentController));

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a new comment
 *     description: Adds a comment to a specific post. The authenticated user becomes the comment owner.
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - post
 *             properties:
 *               content:
 *                 type: string
 *                 description: Comment text content
 *                 example: 'Great post!'
 *               post:
 *                 type: string
 *                 description: The post ID to comment on
 *                 example: '60d5ec49f1b2c8a1b4e1a123'
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/',
  authMiddleware,
  commentController.post.bind(commentController),
);

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     description: Permanently deletes a comment. Only the comment owner can delete it.
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Resource deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete(
  '/:id',
  authMiddleware,
  commentController.del.bind(commentController),
);

export const commentRoutes = router;
