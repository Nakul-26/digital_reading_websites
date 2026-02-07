import { NextFunction } from 'express';
import express from 'express';
import auth from '../middleware/auth';
import admin from '../middleware/admin';
import User from '../models/User';
import { HttpError } from '../utils/HttpError';
import Work from '../models/Work';
import Feedback from '../models/Feedback';

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

// @route   GET /admin/feedback
// @desc    Get all feedback
// @access  Admin
router.get('/feedback', [auth, admin], async (req, res, next: NextFunction) => {
    try {
        const feedback = await Feedback.find().sort({ createdAt: -1 });
        res.json(feedback);
    } catch (err: any) {
        console.error(err.message);
        next(err);
    }
});

export default router;
