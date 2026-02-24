import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import path from 'path';
import multer from 'multer';
import { randomUUID } from 'crypto';
import csrf from 'csurf';
import { v2 as cloudinary } from 'cloudinary';

import authRoutes from './routes/auth';
import worksRoutes from './routes/works';
import chaptersRoutes from './routes/chapters';
import adminRoutes from './routes/admin';
import feedbackRoutes from './routes/feedback';
import { HttpError } from './utils/HttpError';
import { apiLimiter, authLimiter, uploadLimiter } from './middleware/rateLimiters';
import { noSqlInjectionSanitizer, securityHeaders } from './middleware/security';

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
app.set('trust proxy', 1);

const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
  throw new Error('Cloudinary environment variables are not fully configured');
}

cloudinary.config({
  cloud_name: cloudinaryCloudName,
  api_key: cloudinaryApiKey,
  api_secret: cloudinaryApiSecret,
});

// --- Rate Limiter ---
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

// --- MongoDB ---
const uri = process.env.MONGO_URI;
if (!uri) {
  throw new Error('MONGO_URI is not defined in environment variables');
}

let databaseConnectionPromise: Promise<void> | null = null;

export const connectDatabase = async (): Promise<void> => {
  if (databaseConnectionPromise) {
    return databaseConnectionPromise;
  }

  const dbName = process.env.MONGO_DB_NAME;
  const mongooseOptions: mongoose.ConnectOptions = {
    serverSelectionTimeoutMS: 20000,
  };
  if (dbName) {
    mongooseOptions.dbName = dbName;
  }

  databaseConnectionPromise = (async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri, mongooseOptions);
      console.log('Connected to MongoDB via Mongoose');
    }
  })().catch((err) => {
    databaseConnectionPromise = null;
    throw err;
  });

  return databaseConnectionPromise;
};

export const closeDatabaseConnections = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close(false);
  }
  databaseConnectionPromise = null;
};

// Initialize connection during cold start in serverless and local server startup.
connectDatabase().catch((err) => {
  console.error('Database initialization error:', err);
});

// --- Middleware ---
const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new HttpError(403, `Origin not allowed by CORS: ${origin}`));
  },
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(securityHeaders);
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());
app.use(noSqlInjectionSanitizer);
app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    await connectDatabase();
    next();
  } catch (err) {
    next(err);
  }
});

const csrfProtection = csrf({
  cookie: {
    key: '_csrf',
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  },
});
app.use(csrfProtection);
// Logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  console.log('Query:', req.query);
  console.log('Params:', req.params);
  console.log('IP:', req.ip);
  console.log('Time:', new Date().toISOString());
  next();
});

// --- File Upload ---
const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    return cb(new HttpError(400, 'Unsupported file type. Only jpeg, png, webp, and gif are allowed.'));
  }

  cb(null, true);
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
  fileFilter,
});

const handleUploadMiddlewareError = (err: unknown, next: NextFunction) => {
  if (!err) {
    return;
  }

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new HttpError(400, 'File too large. Maximum size is 5 MB.'));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(new HttpError(400, 'Too many files. Maximum is 10 files per request.'));
    }
    return next(new HttpError(400, `Upload error: ${err.message}`));
  }

  return next(err as Error);
};

const uploadBufferToCloudinary = (file: Express.Multer.File): Promise<{ secureUrl: string; publicId: string }> =>
  new Promise((resolve, reject) => {
    const fileExtension = path.extname(file.originalname).toLowerCase() || '';
    const publicId = `${Date.now()}-${randomUUID()}${fileExtension}`;
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'novel-website',
        public_id: publicId,
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result?.secure_url || !result.public_id) {
          reject(error || new Error('Cloudinary upload failed'));
          return;
        }

        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(file.buffer);
  });

app.post('/api/upload', uploadLimiter, (req: Request, res: Response, next: NextFunction) => {
  upload.single('file')(req, res, (err) => {
    handleUploadMiddlewareError(err, next);
    if (err) {
      return;
    }

    if (!req.file) {
      return next(new HttpError(400, 'No file uploaded.'));
    }

    uploadBufferToCloudinary(req.file)
      .then((uploadedFile) => res.status(200).send({
        message: 'File uploaded successfully',
        filename: uploadedFile.publicId,
        url: uploadedFile.secureUrl,
      }))
      .catch((uploadError) => next(uploadError));
  });
});

app.post('/api/upload-multiple', uploadLimiter, (req: Request, res: Response, next: NextFunction) => {
  upload.array('files', 10)(req, res, (err) => {
    handleUploadMiddlewareError(err, next);
    if (err) {
      return;
    }

    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return next(new HttpError(400, 'No files uploaded.'));
    }

    Promise.all((req.files as Express.Multer.File[]).map((file) => uploadBufferToCloudinary(file)))
      .then((uploadedFiles) => {
        const filenames = uploadedFiles.map((file) => file.publicId);
        const urls = uploadedFiles.map((file) => file.secureUrl);
        res.status(200).send({
          message: 'Files uploaded successfully',
          filenames,
          urls,
        });
      })
      .catch((uploadError) => next(uploadError));
  });
});

app.post('/api/works', uploadLimiter);
app.post('/api/works/:workId/chapters', uploadLimiter);

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/works', worksRoutes);
app.use('/api/chapters', chaptersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);

app.get('/', (_req, res) => {
  res.send('API is working');
});

app.get('/api/health', (_req: Request, res: Response) => {
  const readyState = mongoose.connection.readyState;
  const status = readyState === 1 ? 'ok' : 'degraded';
  const stateMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(status === 'ok' ? 200 : 503).json({
    status,
    database: stateMap[readyState] || 'unknown',
    timestamp: new Date().toISOString(),
  });
});

if (!isProduction) {
  app.get('/api/debug/ip', (req: Request, res: Response) => {
    res.json({
      ip: req.ip,
      ips: req.ips,
      trustProxy: app.get('trust proxy'),
      headers: {
        'x-forwarded-for': req.headers['x-forwarded-for'] || null,
        'x-real-ip': req.headers['x-real-ip'] || null,
        'cf-connecting-ip': req.headers['cf-connecting-ip'] || null,
      },
    });
  });
}

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = 500;
  let message = 'An unknown error occurred!';
  let data;

  if (err instanceof HttpError) {
    statusCode = err.statusCode;
    message = err.message;
    data = err.data;
  } else if ((err as { code?: string }).code === 'EBADCSRFTOKEN') {
    statusCode = 403;
    message = 'Invalid CSRF token';
  } else {
    console.error('Unhandled server error:', err);
  }

  res.status(statusCode).json({ message, data });
});

export default app;
