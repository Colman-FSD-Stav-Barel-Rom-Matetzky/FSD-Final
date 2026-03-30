import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { BaseController } from './base.controller';
import { IComment, Comment } from '../models/comment.model';

export class CommentController extends BaseController<IComment> {
  constructor() {
    super(Comment);
    this.get = this.get.bind(this);
    this.post = this.post.bind(this);
    this.del = this.del.bind(this);
  }

  async get(req: Request, res: Response) {
    try {
      const postId =
        typeof req.query.postId === 'string' ? req.query.postId : undefined;

      if (!postId) {
        res.status(400).json({ error: 'postId is required' });
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(postId)) {
        res.status(400).json({ error: 'Invalid postId' });
        return;
      }

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
        ? { post: postId, _id: { $lt: new mongoose.Types.ObjectId(lastId) } }
        : { post: postId };

      const comments = await Comment.find(filter)
        .sort({ _id: -1 })
        .limit(limit);
      const lastComment = comments[comments.length - 1];

      res.status(200).json({
        data: comments,
        nextCursor: lastComment ? lastComment._id : null,
      });
    } catch (error) {
      res.status(500).json({
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  }

  async post(req: Request, res: Response) {
    const body = req.body as Record<string, unknown>;
    const bodyContent = body.content;
    const bodyPost = body.post;

    const content = typeof bodyContent === 'string' ? bodyContent.trim() : '';
    const postId = typeof bodyPost === 'string' ? bodyPost : undefined;

    if (!content) {
      res.status(400).json({ error: 'Content is required' });
      return;
    }

    if (!postId) {
      res.status(400).json({ error: 'Post ID is required' });
      return;
    }

    const userId = (req.user as { _id?: string } | undefined)?._id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    req.body = {
      content,
      post: postId,
      owner: userId,
    };

    await super.post(req, res);
  }

  async del(req: Request, res: Response) {
    try {
      const comment = await Comment.findById(req.params.id);

      if (!comment) {
        res.status(404).json({ error: 'Comment not found' });
        return;
      }

      const userId = (req.user as { _id?: string } | undefined)?._id;

      if (comment.owner.toString() !== userId?.toString()) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      await comment.deleteOne();

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
}

export const commentController = new CommentController();
