import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User, { IUser } from '../models/User';

dotenv.config();

interface AuthRequest extends Request {
  user?: IUser;
}

export default async function (req: AuthRequest, res: Response, next: NextFunction) {
  // Prefer HttpOnly auth cookie; keep header fallback for backward compatibility.
  const token = req.cookies?.auth_token || req.header('x-auth-token');

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
    // Treat invalid/stale tokens as anonymous access so public routes remain public.
    // Private routes still reject because req.user is undefined.
    if (req.cookies?.auth_token) {
      res.clearCookie('auth_token');
    }
    next();
  }
}
