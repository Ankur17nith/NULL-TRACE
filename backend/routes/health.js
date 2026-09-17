import express from 'express';
import { isDbConnected } from '../config/db.js';

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'NULL//TRACE API',
    environment: process.env.NODE_ENV || 'production',
    database: isDbConnected() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

export default router;
