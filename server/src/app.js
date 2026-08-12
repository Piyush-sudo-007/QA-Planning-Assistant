import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

import { initializeDatabase } from './db/schema.js';
import { requestLogger } from './middleware/request-logger.js';
import errorHandler from './middleware/error-handler.js';

import authRoutes from './routes/auth.js';
import healthRoutes from './routes/health.js';
import projectRoutes from './routes/projects.js';
import planRoutes from './routes/plans.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security and utility middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);

// Ensure DB schema is initialized before handling any requests
let dbInitPromise = null;
app.use(async (req, res, next) => {
  if (!dbInitPromise) {
    dbInitPromise = initializeDatabase().catch((err) => {
      console.error('[DB Init Error]', err);
      dbInitPromise = null; // reset on error to allow retry
      throw err;
    });
  }
  try {
    await dbInitPromise;
    next();
  } catch (err) {
    res.status(500).json({ error: `Database initialization failed: ${err.message}` });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', healthRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', planRoutes);

// Serve static frontend files if dist folder exists (for single-deployment or Vercel static output)
const distPath = path.join(__dirname, '../../dist');
app.use(express.static(distPath));

// Fallback to index.html for Client-Side Routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('QA Planning Assistant API is running.');
    }
  });
});

// Global error handler
app.use(errorHandler);

export default app;
