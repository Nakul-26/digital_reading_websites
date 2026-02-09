import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/HttpError';

const forbiddenKeys = new Set(['__proto__', 'constructor', 'prototype']);

const sanitizeValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (value && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      if (forbiddenKeys.has(key) || key.startsWith('$') || key.includes('.')) {
        throw new HttpError(400, `Invalid field: ${key}`);
      }
      sanitized[key] = sanitizeValue(nestedValue);
    }
    return sanitized;
  }

  if (typeof value === 'string') {
    return value.replace(/\u0000/g, '');
  }

  return value;
};

export const noSqlInjectionSanitizer = (req: Request, _res: Response, next: NextFunction) => {
  try {
    req.body = sanitizeValue(req.body);
    req.query = sanitizeValue(req.query) as Request['query'];
    req.params = sanitizeValue(req.params) as Request['params'];
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
