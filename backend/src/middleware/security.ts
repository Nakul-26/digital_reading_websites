import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/HttpError';

const forbiddenKeys = new Set(['__proto__', 'constructor', 'prototype']);

const sanitizeInPlace = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) {
      value[i] = sanitizeInPlace(value[i]);
    }
    return value;
  }

  if (value && typeof value === 'object') {
    const target = value as Record<string, unknown>;
    for (const [key, nestedValue] of Object.entries(target)) {
      if (forbiddenKeys.has(key) || key.startsWith('$') || key.includes('.')) {
        throw new HttpError(400, `Invalid field: ${key}`);
      }
      target[key] = sanitizeInPlace(nestedValue);
    }
    return value;
  }

  if (typeof value === 'string') {
    return value.replace(/\u0000/g, '');
  }

  return value;
};

export const noSqlInjectionSanitizer = (req: Request, _res: Response, next: NextFunction) => {
  try {
    req.body = sanitizeInPlace(req.body);
    sanitizeInPlace(req.query);
    sanitizeInPlace(req.params);
    next();
  } catch (err) {
    next(err);
  }
};

export const securityHeaders = (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'; img-src 'self' data:; connect-src 'self';"
  );
  next();
};
