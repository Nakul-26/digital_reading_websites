import express from 'express';
import auth from '../middleware/auth';
import admin from '../middleware/admin';
import User from '../models/User';

const router = express.Router();

// @route   GET /admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', [auth, admin], async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
