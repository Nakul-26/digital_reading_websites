import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import path from 'path';
import multer from 'multer';

import authRoutes from './routes/auth';
import worksRoutes from './routes/works';
import chaptersRoutes from './routes/chapters';
import adminRoutes from './routes/admin';
import feedbackRoutes from './routes/feedback';
import { HttpError } from './utils/HttpError';
import { apiLimiter, authLimiter, uploadLimiter } from './middleware/rateLimiters';

dotenv.config();
const app = express();

// --- Rate Limiter ---
// Apply limiters to specific routes.
// The general 'apiLimiter' applies to all '/api' routes, while more
// specific limiters add extra protection to sensitive endpoints.
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/works', uploadLimiter);
app.use('/api/chapters', uploadLimiter);

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
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ["http://localhost:5173"],
  optionsSuccessStatus: 200,
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

mongoose.connect(uri, {
  dbName: 'novel_website', // You might want to change this
  serverSelectionTimeoutMS: 20000 // Increase timeout for stability
})
    .then(() => {
        console.log("✅ Connected to MongoDB via Mongoose");
    })
    .catch((err) => {
        console.error("❌ Mongoose connection error:", err);
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
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });

const upload = multer({ storage });

app.post('/api/upload', uploadLimiter, upload.single('file'), (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.status(200).send({
        message: 'File uploaded successfully',
        filename: req.file.filename,
    });
});

app.post('/api/upload-multiple', uploadLimiter, upload.array('files'), (req: Request, res: Response) => {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).send('No files uploaded.');
    }
    const filenames = (req.files as Express.Multer.File[]).map(file => file.filename);
    res.status(200).send({
        message: 'Files uploaded successfully',
        filenames: filenames,
    });
});


// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/works', worksRoutes);
app.use('/api/chapters', chaptersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);

app.get("/", (req, res) => {
  res.send("API is working");
});

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