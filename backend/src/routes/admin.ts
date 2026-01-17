import express from 'express';
import auth from '../middleware/auth';
import admin from '../middleware/admin';
import User from '../models/User';
import { HttpError } from '../utils/HttpError';

const router = express.Router();

// @route   GET /admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', [auth, admin], async (req, res, next: NextFunction) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err: any) {
    console.error(err.message);
    next(err);
  }
});

// @route   GET /admin/works
// @desc    Get all works (admin only, published and unpublished)
// @access  Admin
router.get('/works', [auth, admin], async (req, res, next: NextFunction) => {
  try {
    const works = await Work.find().populate('author', ['_id', 'username']);
    res.json(works);
  } catch (err: any) {
    console.error(err.message);
    next(err);
  }
});

export default router;
