import fs from 'fs/promises';
import path from 'path';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { BaseController } from './base.controller';
import { Post, IPost } from '../models/post.model';
import { Comment } from '../models/comment.model';
import { aiService } from '../services/ai.service';

const resolveImagePath = (imagePath: string) =>
  path.join(process.cwd(), imagePath.replace(/^\/+/, ''));

const getAuthenticatedUserId = (req: Request) =>
  (req.user as { _id?: string } | undefined)?._id;

const deleteImageIfExists = async (imagePath?: string) => {
  if (!imagePath) {
    return;
  }

  try {
    await fs.unlink(resolveImagePath(imagePath));
  } catch (error) {
    const fileError = error as NodeJS.ErrnoException;

    if (fileError.code !== 'ENOENT') {
      throw error;
    }
  }
};

type PostWithCommentCount = IPost & { commentCount: number };

const attachCommentCounts = async (
  posts: IPost | IPost[],
): Promise<PostWithCommentCount | PostWithCommentCount[] | null> => {
  const isArray = Array.isArray(posts);
  const postsArray = isArray ? posts : [posts];

  if (postsArray.length === 0) return isArray ? [] : null;

  const postIds = postsArray.map((p) => p._id);
  const commentCounts = await Comment.aggregate<{
    _id: mongoose.Types.ObjectId;
    count: number;
  }>([
    { $match: { post: { $in: postIds } } },
    { $group: { _id: '$post', count: { $sum: 1 } } },
  ]);

  const countMap = new Map<string, number>(
    commentCounts.map((c) => [c._id.toString(), c.count]),
  );

  const postsWithCounts = postsArray.map((post) => {
    const p = (
      typeof post.toObject === 'function' ? post.toObject() : { ...post }
    ) as PostWithCommentCount;

    p.commentCount = countMap.get(p._id.toString()) || 0;

    return p;
  });

  return isArray ? postsWithCounts : postsWithCounts[0];
};

export class PostController extends BaseController<IPost> {
  constructor() {
    super(Post);
    this.get = this.get.bind(this);
    this.getById = this.getById.bind(this);
    this.post = this.post.bind(this);
    this.put = this.put.bind(this);
    this.del = this.del.bind(this);
    this.toggleLike = this.toggleLike.bind(this);
    this.searchPosts = this.searchPosts.bind(this);
    this.getByUser = this.getByUser.bind(this);
  }

  async getByUser(req: Request, res: Response) {
    try {
      const posts = await Post.find({ owner: req.params.id })
        .populate('owner', 'username profileImage')
        .sort({ _id: -1 });
      const postsWithCounts = await attachCommentCounts(posts);
      res.status(200).json({ data: postsWithCounts });
    } catch (error) {
      res.status(500).json({
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const item = await this.model
        .findById(req.params.id)
        .populate('owner', 'username profileImage');

      if (!item) {
        res.status(404).json({ error: 'Resource not found' });
        return;
      }

      const itemWithCount = await attachCommentCounts(item);
      res.status(200).json({ data: itemWithCount });
    } catch (error) {
      res.status(500).json({
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  }

  async get(req: Request, res: Response) {
    try {
      const limitParam =
        typeof req.query.limit === 'string' ? req.query.limit : '10';
      const parsedLimit = Number.parseInt(limitParam, 10);
      const limit =
        Number.isNaN(parsedLimit) || parsedLimit < 1 ? 10 : parsedLimit;
      const lastId =
        typeof req.query.lastId === 'string' ? req.query.lastId : undefined;

      if (lastId && !mongoose.Types.ObjectId.isValid(lastId)) {
        res.status(400).json({ error: 'Invalid lastId cursor' });
        return;
      }

      const filter = lastId
        ? { _id: { $lt: new mongoose.Types.ObjectId(lastId) } }
        : {};

      const posts = await Post.find(filter)
        .populate('owner', 'username profileImage')
        .sort({ _id: -1 })
        .limit(limit);
      const lastPost = posts[posts.length - 1];

      const postsWithCounts = await attachCommentCounts(posts);

      res.status(200).json({
        data: postsWithCounts,
        nextCursor: lastPost ? lastPost._id : null,
      });
    } catch (error) {
      res.status(500).json({
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  }

  async post(req: Request, res: Response) {
    const uploadedImagePath = req.file
      ? `/uploads/posts/${req.file.filename}`
      : undefined;

    try {
      const userId = getAuthenticatedUserId(req);

      if (!userId) {
        if (uploadedImagePath) {
          await deleteImageIfExists(uploadedImagePath);
        }

        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const body = req.body as Record<string, unknown>;
      const bodyContent = body.content;

      const content = typeof bodyContent === 'string' ? bodyContent.trim() : '';

      if (!content) {
        if (uploadedImagePath) {
          await deleteImageIfExists(uploadedImagePath);
        }

        res.status(400).json({ error: 'Content is required' });
        return;
      }

      const embedding = await aiService.generateEmbedding(content);

      const postPayload = {
        content,
        owner: userId,
        ...(uploadedImagePath ? { image: uploadedImagePath } : {}),
        embedding,
      };

      const createdPost = await Post.create(postPayload);
      const populatedPost = await createdPost.populate(
        'owner',
        'username profileImage',
      );

      const postWithCount = await attachCommentCounts(populatedPost);
      res.status(201).json({ data: postWithCount });
    } catch (error) {
      if (uploadedImagePath) {
        await deleteImageIfExists(uploadedImagePath);
      }

      res.status(500).json({
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  }

  async put(req: Request, res: Response) {
    const uploadedImagePath = req.file
      ? `/uploads/posts/${req.file.filename}`
      : undefined;

    try {
      const post = await Post.findById(req.params.id);

      if (!post) {
        if (uploadedImagePath) {
          await deleteImageIfExists(uploadedImagePath);
        }

        res.status(404).json({ error: 'Resource not found' });
        return;
      }

      if (post.owner.toString() !== getAuthenticatedUserId(req)?.toString()) {
        if (uploadedImagePath) {
          await deleteImageIfExists(uploadedImagePath);
        }

        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      const previousImage = post.image;
      const body = req.body as Record<string, unknown>;

      if (typeof body.content === 'string') {
        post.content = body.content.trim();
      }

      if (uploadedImagePath) {
        post.image = uploadedImagePath;
      }

      post.embedding = await aiService.generateEmbedding(post.content);

      await post.save();
      await post.populate('owner', 'username profileImage');

      if (uploadedImagePath && previousImage && previousImage !== post.image) {
        await deleteImageIfExists(previousImage);
      }

      const postWithCount = await attachCommentCounts(post);
      res.status(200).json({ data: postWithCount });
    } catch (error) {
      if (uploadedImagePath) {
        await deleteImageIfExists(uploadedImagePath);
      }

      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  }

  async del(req: Request, res: Response) {
    try {
      const post = await Post.findById(req.params.id);

      if (!post) {
        res.status(404).json({ error: 'Resource not found' });
        return;
      }

      if (post.owner.toString() !== getAuthenticatedUserId(req)?.toString()) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      if (post.image) {
        await deleteImageIfExists(post.image);
      }

      await post.deleteOne();

      res
        .status(200)
        .json({ data: { message: 'Resource deleted successfully' } });
    } catch (error) {
      res.status(500).json({
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  }

  async toggleLike(req: Request, res: Response) {
    try {
      const post = await this.model.findById(req.params.id);
      if (!post) return res.status(404).json({ error: 'Post not found' });
      const userId = getAuthenticatedUserId(req);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const likeIndex = post.likes.findIndex(
        (id) => id.toString() === userId.toString(),
      );
      if (likeIndex === -1) {
        post.likes.push(new mongoose.Types.ObjectId(userId));
      } else {
        post.likes.splice(likeIndex, 1);
      }
      await post.save();
      res.status(200).json({ data: { likes: post.likes } });
    } catch (error) {
      res.status(500).json({
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  }

  async searchPosts(req: Request, res: Response): Promise<void> {
    try {
      const q = req.query.q as string;
      if (!q) {
        res.status(400).json({ error: 'Query parameter "q" is required' });
        return;
      }

      const queryVector = await aiService.generateEmbedding(q);
      const allPosts = await this.model
        .find()
        .populate('owner', 'username profileImage');

      const rankedPosts = allPosts
        .map((post) => {
          const score = aiService.cosineSimilarity(
            queryVector,
            post.embedding || [],
          );
          return { post, score };
        })
        .filter((rp) => rp.score >= 0.4)
        .sort((a, b) => b.score - a.score)
        .slice(0, 15)
        .map((rp) => rp.post);

      const postsWithCounts = await attachCommentCounts(rankedPosts);
      res.status(200).json({ data: postsWithCounts });
    } catch (_error) {
      res.status(500).json({ error: 'Failed to search posts semantically' });
    }
  }
}

export const postController = new PostController();
