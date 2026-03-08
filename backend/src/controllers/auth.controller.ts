import { Request, Response } from 'express';
import { User, IUser } from '../models/user.model';
import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { AppConfig } from '../config/app.config';
import { JwtConfig } from '../config/jwt.config';

const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ _id: userId }, JwtConfig.secret as Secret, {
    expiresIn: JwtConfig.accessTokenExpiry as SignOptions['expiresIn'],
  });

  const refreshToken = jwt.sign(
    { _id: userId },
    JwtConfig.refreshSecret as Secret,
    {
      expiresIn: JwtConfig.refreshTokenExpiry as SignOptions['expiresIn'],
    },
  );

  return { accessToken, refreshToken };
};

const verifyRefreshTokenAndGetUser = async (
  refreshToken: string | undefined,
) => {
  if (!refreshToken) {
    return { error: 'Refresh token is required', status: 400 };
  }

  let payload: { _id: string };

  try {
    payload = jwt.verify(refreshToken, JwtConfig.refreshSecret as Secret) as {
      _id: string;
    };
  } catch (_err) {
    return { error: 'Invalid refresh token', status: 401 };
  }

  const user = await User.findById(payload._id);

  if (!user) {
    return { error: 'Invalid refresh token', status: 401 };
  }

  return { user };
};

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, email } = req.body as {
      username?: string;
      password?: string;
      email?: string;
    };

    if (!username || !password || !email) {
      res
        .status(400)
        .json({ error: 'Username, password, and email are required' });

      return;
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      res.status(400).json({ error: 'Username or email already taken' });

      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const tokens = generateTokens(user.id);
    user.refreshTokens.push(tokens.refreshToken);

    await user.save();

    res.status(201).json({
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          _id: user.id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
          isGoogleUser: user.isGoogleUser,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body as {
      username?: string;
      password?: string;
    };

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });

      return;
    }

    const user = await User.findOne({ username });

    if (!user || !user.password) {
      res.status(400).json({ error: 'Invalid credentials' });

      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      res.status(400).json({ error: 'Invalid credentials' });

      return;
    }

    const tokens = generateTokens(user.id);
    user.refreshTokens.push(tokens.refreshToken);

    await user.save();

    res.status(200).json({
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          _id: user.id,
          username: user.username,
          profileImage: user.profileImage,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    const verification = await verifyRefreshTokenAndGetUser(refreshToken);

    if ('error' in verification || !verification.user) {
      res
        .status(verification.status || 401)
        .json({ error: verification.error });

      return;
    }

    const { user } = verification;

    if (!user.refreshTokens.includes(refreshToken!)) {
      res.status(401).json({ error: 'Invalid refresh token' });

      return;
    }

    const tokens = generateTokens(user.id);
    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    user.refreshTokens.push(tokens.refreshToken);

    await user.save();

    res.status(200).json({
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          _id: user.id,
          username: user.username,
          profileImage: user.profileImage,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    const verification = await verifyRefreshTokenAndGetUser(refreshToken);

    if ('error' in verification || !verification.user) {
      res
        .status(verification.status || 401)
        .json({ error: verification.error });

      return;
    }

    const { user } = verification;

    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    await user.save();

    res.status(200).json({ data: { message: 'Logged out successfully' } });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;

    if (!user) {
      res.status(401).json({ error: 'Authentication failed' });

      return;
    }

    const tokens = generateTokens(user._id.toString());
    user.refreshTokens.push(tokens.refreshToken);

    await user.save();

    const clientUrl = AppConfig.clientUrl;
    res.redirect(
      `${clientUrl}?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
    );
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
