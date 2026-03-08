import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtConfig } from '../config/jwt.config';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token missing' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JwtConfig.secret) as {
      _id: string;
    };
    req.user = decoded;

    next();
  } catch (_error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
