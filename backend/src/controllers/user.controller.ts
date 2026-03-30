import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { User, IUser } from '../models/user.model';

export class UserController extends BaseController<IUser> {
  constructor() {
    super(User);
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.model
        .findById(req.params.id)
        .select('-password -refreshTokens');
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.status(200).json({ data: user });
    } catch (_error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;

      const requestingUserId = (req.user as { _id?: string })?._id;
      if (requestingUserId !== userId) {
        res
          .status(403)
          .json({ error: 'Forbidden: You can only edit your own profile' });
        return;
      }

      const updateData: Partial<IUser> = {};

      const body = req.body as Record<string, unknown>;

      if (typeof body?.username === 'string') {
        updateData.username = body.username;
      }

      if (req.file) {
        // Construct the file path to be stored and accessible via static route
        updateData.profileImage = `/uploads/profiles/${req.file.filename}`;
      }

      // Ensure fields like password or email are not randomly overwritten here
      delete updateData.password;
      delete updateData.email;
      delete updateData.isGoogleUser;
      delete updateData.refreshTokens;

      const updatedUser = await this.model
        .findByIdAndUpdate(userId, updateData, {
          returnDocument: 'after',
          runValidators: true,
        })
        .select('-password -refreshTokens');

      if (!updatedUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json({ data: updatedUser });
    } catch (error) {
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  }
}

export const userController = new UserController();
