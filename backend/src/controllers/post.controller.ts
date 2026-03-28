import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { Post, IPost } from '../models/post.model';
import { aiService } from '../services/ai.service';

export class PostController extends BaseController<IPost> {
  constructor() {
    super(Post);
  }

  async getByUserId(req: Request, res: Response): Promise<void> {
    try {
      const posts = await this.model
        .find({ author: req.params.userId })
        .populate('author', 'username profileImage')
        .sort({ createdAt: -1 });

      res.status(200).json({ data: posts });
    } catch (_error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async createWithImages(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body as Record<string, unknown>;

      const authorId = (req.user as { _id?: string })?._id;

      if (!authorId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const content =
        typeof body.content === 'string' ? body.content : undefined;

      if (!content) {
        res.status(400).json({ error: 'Content is required' });
        return;
      }

      const images: string[] = [];

      const files = req.files as Express.Multer.File[];
      if (files && files.length > 0) {
        for (const file of files) {
          images.push(`/uploads/posts/${file.filename}`);
        }
      }

      const embedding = await aiService.generateEmbedding(content);

      const newPost = await this.model.create({
        content,
        author: authorId,
        images,
        embedding,
      });

      res.status(201).json({ data: newPost });
    } catch (_error) {
      res.status(500).json({ error: 'Internal Server Error' });
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
        .populate('author', 'username profileImage');

      const rankedPosts = allPosts
        .map((post) => {
          const score = aiService.cosineSimilarity(
            queryVector,
            post.embedding || [],
          );
          return { post, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 15)
        .map((rp) => rp.post);

      res.status(200).json({ data: rankedPosts });
    } catch (_error) {
      res.status(500).json({ error: 'Failed to search posts semantically' });
    }
  }
}

export const postController = new PostController();
