import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import healthRoutes from './routes/health.js';
import leaderboardRoutes from './routes/leaderboard.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();

// ============================================================
// 1. CORS CONFIGURATION
// ============================================================
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
];

if (process.env.FRONTEND_URL) {
  // Support comma-separated URLs if multiple domains are configured
  const envOrigins = process.env.FRONTEND_URL.split(',').map(o => o.trim().replace(/\/$/, ''));
  allowedOrigins.push(...envOrigins);
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server, or Render health check)
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed === origin) return true;
      // Also permit preview deployments on vercel if origin ends with .vercel.app
      if (allowed.includes('.vercel.app') && origin.endsWith('.vercel.app')) return true;
      return false;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS BLOCKED] Request from unapproved origin: ${origin}`);
      callback(new Error(`CORS policy does not allow access from origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
// Explicitly handle OPTIONS preflight across all routes
app.options('*', cors(corsOptions));

// ============================================================
// 2. PARSERS & MIDDLEWARE
// ============================================================
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logging in development / non-production
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[REQ] ${req.method} ${req.path}`);
    next();
  });
}

// ============================================================
// 3. ROUTES
// ============================================================
// Root info endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'NULL//TRACE Production API',
    status: 'online',
    version: '1.0.0',
    documentation: '/health',
  });
});

// Health check endpoint (No auth required, public for Render monitoring)
app.use(healthRoutes);

// API Endpoints
app.use('/api/leaderboard', leaderboardRoutes);

// ============================================================
// 4. ERROR HANDLING
// ============================================================
app.use(notFoundHandler);
app.use(errorHandler);

// ============================================================
// 5. SERVER INITIALIZATION & LIFECYCLE
// ============================================================
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

const startServer = async () => {
  // Connect to MongoDB Atlas (non-blocking so server can start immediately)
  connectDB().catch(err => {
    console.error('[STARTUP WARNING] MongoDB connection error:', err.message);
  });

  const server = app.listen(PORT, HOST, () => {
    console.log('====================================================');
    console.log(`  NULL//TRACE Production API running`);
    console.log(`  Host:        ${HOST}`);
    console.log(`  Port:        ${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`  Health Check: http://${HOST}:${PORT}/health`);
    console.log(`  Allowed CORS: ${allowedOrigins.join(', ')}`);
    console.log('====================================================');
  });

  // Graceful shutdown handling for Render zero-downtime deploys
  const handleShutdown = (signal) => {
    console.log(`\n[SHUTDOWN] Received ${signal}. Gracefully closing HTTP server...`);
    server.close(() => {
      console.log('[SHUTDOWN] HTTP server closed cleanly. Exiting process.');
      process.exit(0);
    });

    // Force shutdown if cleanup takes too long
    setTimeout(() => {
      console.error('[SHUTDOWN] Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer().catch(err => {
  console.error('[FATAL ERROR] Failed to start server:', err);
  process.exit(1);
});

export default app;
