import { Request, Response } from 'express';
import { Model, UpdateQuery } from 'mongoose';

export class BaseController<T> {
  model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async get(req: Request, res: Response) {
    try {
      const filter = req.query || {};
      const items = await this.model.find(filter);
      res.status(200).json({ data: items });
    } catch (error) {
      res.status(500).json({
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const item = await this.model.findById(req.params.id);
      if (!item) {
        res.status(404).json({ error: 'Resource not found' });
        return;
      }
      res.status(200).json({ data: item });
    } catch (error) {
      res.status(500).json({
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  }

  async post(req: Request, res: Response) {
    try {
      const item = await this.model.create(req.body as Partial<T>);
      res.status(201).json({ data: item });
    } catch (error) {
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  }

  async put(req: Request, res: Response) {
    try {
      const item = await this.model.findByIdAndUpdate(
        req.params.id,
        req.body as UpdateQuery<T>,
        {
          returnDocument: 'after',
          runValidators: true,
        },
      );
      if (!item) {
        res.status(404).json({ error: 'Resource not found' });
        return;
      }
      res.status(200).json({ data: item });
    } catch (error) {
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  }

  async del(req: Request, res: Response) {
    try {
      const item = await this.model.findByIdAndDelete(req.params.id);
      if (!item) {
        res.status(404).json({ error: 'Resource not found' });
        return;
      }
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
