import rateLimit from 'express-rate-limit';

const isProduction = process.env.NODE_ENV === 'production';

const isLocalRequest = (ip?: string) =>
  ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1';

const skipLimiterInLocalDev = (ip?: string) => !isProduction && isLocalRequest(ip);

const parsePositiveInt = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const apiMaxRequests = parsePositiveInt(process.env.API_RATE_LIMIT_MAX, 1000);
const authMaxRequests = parsePositiveInt(process.env.AUTH_RATE_LIMIT_MAX, 10);
const uploadMaxRequests = parsePositiveInt(process.env.UPLOAD_RATE_LIMIT_MAX, 10);

// Rate limiter for login and register routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: authMaxRequests, // Limit each IP to AUTH_RATE_LIMIT_MAX requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many accounts created from this IP, please try again after 15 minutes',
  skip: (req) => skipLimiterInLocalDev(req.ip),
});

// Rate limiter for general API routes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: apiMaxRequests, // Limit each IP to API_RATE_LIMIT_MAX requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  skip: (req) => skipLimiterInLocalDev(req.ip),
});

// Rate limiter for upload routes
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: uploadMaxRequests, // Limit each IP to UPLOAD_RATE_LIMIT_MAX uploads per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many uploads from this IP, please try again after an hour',
    skip: (req) => skipLimiterInLocalDev(req.ip),
});
