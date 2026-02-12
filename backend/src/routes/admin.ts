import { NextFunction, Request, Response } from 'express';
import express from 'express';
import auth from '../middleware/auth';
import admin from '../middleware/admin';
import User from '../models/User';
import { HttpError } from '../utils/HttpError';
import Work from '../models/Work';
import Feedback from '../models/Feedback';
import { validateRequest } from '../middleware/validateRequest';
import { adminUserCreateValidation, adminUserUpdateValidation, idParamValidation, workModerationValidation } from '../middleware/validators';
import { IUser } from '../models/User';

const router = express.Router();
interface AuthRequest extends Request {
  user?: IUser;
}

// @route   GET /admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', [auth, admin], async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err: any) {
    console.error(err.message);
    next(err);
  }
});

// @route   POST /admin/users
// @desc    Create a user/admin
// @access  Admin
router.post('/users', [auth, admin, ...adminUserCreateValidation, validateRequest], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const username = req.body.username.trim();
    const password = req.body.password as string;
    const role = req.body.role === 'admin' ? 'admin' : 'user';

    const existing = await User.findOne({ username });
    if (existing) {
      throw new HttpError(400, 'Username already exists');
    }

    const user = new User({
      username,
      password,
      role,
    });

    await user.save();
    const safeUser = await User.findById(user._id).select('-password');
    res.status(201).json(safeUser);
  } catch (err: any) {
    console.error(err.message);
    next(err);
  }
});

// @route   PUT /admin/users/:id
// @desc    Update user/admin fields
// @access  Admin
router.put('/users/:id', [auth, admin, ...adminUserUpdateValidation, validateRequest], async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      throw new HttpError(401, 'Authentication required');
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      throw new HttpError(404, 'User not found');
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'username')) {
      const username = (req.body.username as string).trim();
      const existing = await User.findOne({ username, _id: { $ne: targetUser._id } });
      if (existing) {
        throw new HttpError(400, 'Username already exists');
      }
      targetUser.username = username;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'password')) {
      targetUser.password = req.body.password;
      targetUser.failedLoginAttempts = 0;
      targetUser.lockUntil = null;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'role')) {
      const nextRole = req.body.role as 'user' | 'admin';
      if (currentUser.id === targetUser.id && nextRole !== 'admin') {
        throw new HttpError(400, 'You cannot remove your own admin role');
      }

      if (targetUser.role === 'admin' && nextRole !== 'admin') {
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount <= 1) {
          throw new HttpError(400, 'At least one admin account is required');
        }
      }

      targetUser.role = nextRole;
    }

    await targetUser.save();
    const safeUser = await User.findById(targetUser._id).select('-password');
    res.json(safeUser);
  } catch (err: any) {
    console.error(err.message);
    next(err);
  }
});

// @route   DELETE /admin/users/:id
// @desc    Delete a user/admin
// @access  Admin
router.delete('/users/:id', [auth, admin, idParamValidation('id'), validateRequest], async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      throw new HttpError(401, 'Authentication required');
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      throw new HttpError(404, 'User not found');
    }

    if (currentUser.id === targetUser.id) {
      throw new HttpError(400, 'You cannot delete your own account');
    }

    if (targetUser.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        throw new HttpError(400, 'At least one admin account is required');
      }
    }

    await targetUser.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (err: any) {
    console.error(err.message);
    next(err);
  }
});

// @route   GET /admin/works
// @desc    Get all works (admin only, published and unpublished)
// @access  Admin
router.get('/works', [auth, admin], async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const works = await Work.find().populate('author', ['_id', 'username']);
    res.json(works);
  } catch (err: any) {
    console.error(err.message);
    next(err);
  }
});

// @route   PUT /admin/works/:id/moderation
// @desc    Approve or reject a work
// @access  Admin
router.put(
  '/works/:id/moderation',
  [auth, admin, ...workModerationValidation, validateRequest],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { moderationStatus } = req.body;
      const isApproved = moderationStatus === 'published';

      const work = await Work.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            moderationStatus,
            isPublished: isApproved,
          },
        },
        { new: true }
      ).populate('author', ['_id', 'username']);

      if (!work) {
        throw new HttpError(404, 'Work not found');
      }

      res.json(work);
    } catch (err: any) {
      console.error(err.message);
      next(err);
    }
  }
);

// @route   GET /admin/feedback
// @desc    Get all feedback
// @access  Admin
router.get('/feedback', [auth, admin], async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const feedback = await Feedback.find().sort({ createdAt: -1 });
        res.json(feedback);
    } catch (err: any) {
        console.error(err.message);
        next(err);
    }
});

export default router;
