import express, { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import dotenv from 'dotenv';
import auth from '../middleware/auth';
import { HttpError } from '../utils/HttpError';
import { validateRequest } from '../middleware/validateRequest';
import { loginValidation, registerValidation } from '../middleware/validators';

dotenv.config();

const router = express.Router();

// Register
router.post('/register', registerValidation, validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  const username = req.body.username.trim();
  const password = req.body.password as string;

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
router.post('/login', loginValidation, validateRequest, async (req: Request, res: Response, next: NextFunction) => {
  const username = req.body.username.trim();
  const password = req.body.password as string;

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
