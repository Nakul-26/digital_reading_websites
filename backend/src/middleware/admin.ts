import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/User';
import { HttpError } from '../utils/HttpError';

interface AuthRequest extends Request {
  user?: IUser;
}

const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    next(new HttpError(403, 'Access denied. Admins only.'));
  }
};

export default admin;
