import fs from 'fs/promises';
import path from 'path';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { BaseController } from './base.controller';
import { IPost, Post } from '../models/post.model';

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

export class PostController extends BaseController<IPost> {
  constructor() {
    super(Post);
    this.get = this.get.bind(this);
    this.getById = this.getById.bind(this);
    this.post = this.post.bind(this);
    this.put = this.put.bind(this);
    this.del = this.del.bind(this);
    this.toggleLike = this.toggleLike.bind(this);
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

      const posts = await Post.find(filter).sort({ _id: -1 }).limit(limit);
      const lastPost = posts[posts.length - 1];

      res.status(200).json({
        data: posts,
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

      const content =
        typeof req.body.content === 'string' ? req.body.content.trim() : '';

      if (!content) {
        if (uploadedImagePath) {
          await deleteImageIfExists(uploadedImagePath);
        }

        res.status(400).json({ error: 'Content is required' });
        return;
      }

      req.body = {
        content,
        owner: userId,
        ...(uploadedImagePath ? { image: uploadedImagePath } : {}),
      };

      await super.post(req, res);
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

      if (typeof req.body.content === 'string') {
        post.content = req.body.content.trim();
      }

      if (uploadedImagePath) {
        post.image = uploadedImagePath;
      }

      await post.save();

      if (uploadedImagePath && previousImage && previousImage !== post.image) {
        await deleteImageIfExists(previousImage);
      }

      res.status(200).json({ data: post });
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
      if (!post) return res.status(404).json({ error: "Post not found" });
      const userId = getAuthenticatedUserId(req);
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      const likeIndex = post.likes.findIndex((id) => id.toString() === userId.toString());
      if (likeIndex === -1) {
        post.likes.push(new mongoose.Types.ObjectId(userId));
      } else {
        post.likes.splice(likeIndex, 1);
      }
      await post.save();
      res.status(200).json({ data: { likes: post.likes } });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    }
  }
}

export const postController = new PostController();
