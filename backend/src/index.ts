import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import path from 'path';
import multer from 'multer';
import { randomUUID } from 'crypto';
import csrf from 'csurf';

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

// --- Rate Limiter ---
// Apply limiters to specific routes.
// The general 'apiLimiter' applies to all '/api' routes, while more
// specific limiters add extra protection to sensitive endpoints.
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

// --- MongoDB Client ---
const uri = process.env.MONGO_URI;
if (!uri) {
  throw new Error("❌ MONGO_URI is not defined in .env");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectDB() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Connected to MongoDB via MongoClient");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // Exit if cannot connect
  }
}
connectDB();

// --- Middleware ---
const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. server-to-server, health checks).
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

const csrfProtection = csrf({
  cookie: {
    key: '_csrf',
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  },
});
app.use(csrfProtection);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const dbName = process.env.MONGO_DB_NAME;
const mongooseOptions: mongoose.ConnectOptions = {
  serverSelectionTimeoutMS: 20000 // Increase timeout for stability
};
if (dbName) {
  mongooseOptions.dbName = dbName;
}

mongoose.connect(uri, mongooseOptions)
  .then(() => {
    console.log("Connected to MongoDB via Mongoose");
  })
  .catch((err) => {
    console.error("Mongoose connection error:", err);
  });

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`🔷 Incoming request: ${req.method} ${req.url}`);
  console.log("👉 Headers:", req.headers.origin);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("👉 Body:", req.body);
  }
  console.log("👉 Query:", req.query);
  console.log("📝 Params:", req.params);
  console.log("👉 IP:", req.ip);
  console.log("🕒 Time:", new Date().toISOString());
  next();
});


// --- File Upload ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${randomUUID()}${path.extname(file.originalname).toLowerCase()}`);
    },
  });

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    return cb(new HttpError(400, 'Unsupported file type. Only jpeg, png, webp, and gif are allowed.'));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per file
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

app.post('/api/upload', uploadLimiter, (req: Request, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, (err) => {
      handleUploadMiddlewareError(err, next);
      if (err) {
        return;
      }

      if (!req.file) {
        return next(new HttpError(400, 'No file uploaded.'));
      }

      return res.status(200).send({
        message: 'File uploaded successfully',
        filename: req.file.filename,
      });
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

      const filenames = (req.files as Express.Multer.File[]).map(file => file.filename);
      return res.status(200).send({
        message: 'Files uploaded successfully',
        filenames: filenames,
      });
    });
});

// Apply upload limiter only to write-heavy routes; keep read routes unrestricted by upload quotas.
app.post('/api/works', uploadLimiter);
app.post('/api/works/:workId/chapters', uploadLimiter);


// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/works', worksRoutes);
app.use('/api/chapters', chaptersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);

app.get("/", (req, res) => {
  res.send("API is working");
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
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
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
    // Log unexpected errors for debugging
    console.error('Unhandled server error:', err);
  }

  res.status(statusCode).json({ message, data });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);

const gracefulShutdown = (reason: string, err: Error) => {
  console.error(`❌ ${reason}`);
  if (err) console.error(err);

  server.close(async () => {
    try {
      await mongoose.connection.close(false);
      await client.close();
      console.log("🛑 Clean shutdown complete");
    } catch (e) {
      console.error("Shutdown error:", e);
    } finally {
      process.exit(1);
    }
  });
};

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ UNHANDLED PROMISE REJECTION", "Reason:", reason);
});

process.on("uncaughtException", (err, origin) => {
  console.error("❌ UNCAUGHT EXCEPTION", "Error:", err, "Origin:", origin);
});

process.on("SIGTERM", () =>
  gracefulShutdown("SIGTERM RECEIVED", new Error("SIGTERM"))
);

process.on("SIGINT", () =>
  gracefulShutdown("SIGINT RECEIVED", new Error("SIGINT"))
);
