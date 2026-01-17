import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User, { IUser } from '../models/User';
import { HttpError } from '../utils/HttpError';

dotenv.config();

interface AuthRequest extends Request {
  user?: IUser;
}

export default async function (req: AuthRequest, res: Response, next: NextFunction) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return next();
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      user: { id: string };
    };
    req.user = await User.findById(decoded.user.id).select('-password');
    next();
  } catch (err) {
    next(new HttpError(401, 'Token is not valid'));
  }
}
