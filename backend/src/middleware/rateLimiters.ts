import rateLimit from 'express-rate-limit';

const isProduction = process.env.NODE_ENV === 'production';

const isLocalRequest = (ip?: string) =>
  ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1';

const skipLimiterInLocalDev = (ip?: string) => !isProduction && isLocalRequest(ip);

// Rate limiter for login and register routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many accounts created from this IP, please try again after 15 minutes',
  skip: (req) => skipLimiterInLocalDev(req.ip),
});

// Rate limiter for general API routes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  skip: (req) => skipLimiterInLocalDev(req.ip),
});

// Rate limiter for upload routes
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 uploads per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many uploads from this IP, please try again after an hour',
    skip: (req) => skipLimiterInLocalDev(req.ip),
});
