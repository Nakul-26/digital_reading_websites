import express, { NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import dotenv from 'dotenv';
import auth from '../middleware/auth';
import { HttpError } from '../utils/HttpError';

dotenv.config();

const router = express.Router();

// Register
router.post('/register', async (req, res, next: NextFunction) => {
  const { username, password } = req.body;

  try {
    let user = await User.findOne({ username });
    if (user) {
      throw new HttpError(400, 'User already exists');
    }

    user = new User({
      username,
      password,
    });

    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET as string,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) return next(err);
        res.json({ token });
      }
    );
  } catch (err: any) {
    console.error(err.message);
    next(err);
  }
});

// Login
router.post('/login', async (req, res, next: NextFunction) => {
  const { username, password } = req.body;

  try {
    let user = await User.findOne({ username });
    if (!user) {
      throw new HttpError(400, 'Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) {
      throw new HttpError(400, 'Invalid credentials');
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET as string,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) return next(err);
        res.json({ token });
      }
    );
  } catch (err: any) {
    console.error(err.message);
    next(err);
  }
});

// Get logged in user
router.get('/me', auth, async (req: any, res, next: NextFunction) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err: any) {
    console.error(err.message);
    next(err);
  }
});

export default router;
