import express, { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import User from '../models/User';
import dotenv from 'dotenv';
import auth from '../middleware/auth';
import { HttpError } from '../utils/HttpError';
import { validateRequest } from '../middleware/validateRequest';
import { loginValidation, registerValidation } from '../middleware/validators';

dotenv.config();

const router = express.Router();
const JWT_COOKIE_NAME = 'auth_token';
const isProduction = process.env.NODE_ENV === 'production';
const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';
const cookieMaxAgeMs = Number.parseInt(process.env.JWT_COOKIE_MAX_AGE_MS || '604800000', 10);
const configuredMaxFailedAttempts = Number.parseInt(process.env.LOGIN_MAX_FAILED_ATTEMPTS || '15', 10);
const configuredLockoutMinutes = Number.parseInt(process.env.LOGIN_LOCKOUT_MINUTES || '15', 10);
const maxFailedLoginAttempts = Number.isInteger(configuredMaxFailedAttempts) && configuredMaxFailedAttempts > 0
  ? configuredMaxFailedAttempts
  : 15;
const loginLockoutMinutes = Number.isInteger(configuredLockoutMinutes) && configuredLockoutMinutes > 0
  ? configuredLockoutMinutes
  : 15;

if (!jwtSecret) {
  throw new Error('JWT_SECRET is not set');
}

const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: Number.isFinite(cookieMaxAgeMs) && cookieMaxAgeMs > 0 ? cookieMaxAgeMs : 7 * 24 * 60 * 60 * 1000,
};

const signAuthToken = (userId: string): Promise<string> => {
  const payload = { user: { id: userId } };
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: jwtExpiresIn } as SignOptions,
      (err, token) => {
        if (err || !token) {
          reject(err || new Error('Unable to generate auth token'));
          return;
        }
        resolve(token);
      }
    );
  });
};

router.get('/csrf-token', (req: Request, res: Response) => {
  const csrfToken = (req as Request & { csrfToken: () => string }).csrfToken();
  res.json({ csrfToken });
});

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
    const token = await signAuthToken(user.id);
    res.cookie(JWT_COOKIE_NAME, token, authCookieOptions);
    res.json({ message: 'Registered successfully' });
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

    const lockUntilTime = user.lockUntil ? user.lockUntil.getTime() : null;
    if (lockUntilTime && lockUntilTime > Date.now()) {
      throw new HttpError(423, 'Account is temporarily locked. Please try again later.');
    }

    if (lockUntilTime && lockUntilTime <= Date.now()) {
      user.failedLoginAttempts = 0;
      user.lockUntil = null;
      await user.save();
    }

    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= maxFailedLoginAttempts) {
        user.lockUntil = new Date(Date.now() + loginLockoutMinutes * 60 * 1000);
      }
      await user.save();
      throw new HttpError(400, 'Invalid credentials');
    }

    if (user.failedLoginAttempts > 0 || user.lockUntil) {
      user.failedLoginAttempts = 0;
      user.lockUntil = null;
      await user.save();
    }

    const token = await signAuthToken(user.id);
    res.cookie(JWT_COOKIE_NAME, token, authCookieOptions);
    res.json({ message: 'Logged in successfully' });
  } catch (err: any) {
    console.error(err.message);
    next(err);
  }
});

// Get logged in user
router.get('/me', auth, async (req: any, res, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      throw new HttpError(401, 'Unauthorized');
    }
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err: any) {
    if (!(err instanceof HttpError && err.statusCode === 401)) {
      console.error(err.message);
    }
    next(err);
  }
});

router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie(JWT_COOKIE_NAME, {
    path: '/',
    sameSite: 'lax',
    secure: isProduction,
  });
  res.json({ message: 'Logged out successfully' });
});

export default router;
