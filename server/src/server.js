import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './modules/auth/auth.routes.js';
import complaintRoutes from './modules/complaints/complaint.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import incidentRoutes from './modules/incidents/incident.route.js';
import leaderboardRoutes from './modules/leaderboard/leaderboard.routes.js';
import citizenRoutes from './modules/citizen/citizen.routes.js';
import publicRoutes from './modules/public/public.routes.js';
import speechRoutes from './modules/speech/speech.routes.js';
import whatsappRoutes from './modules/whatsapp/whatsapp.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';

import { prisma } from './prisma/client.js';
import {
  errorMiddleware,
  notFoundHandler,
} from './middleware/error.middleware.js';

import { requestLogger } from './middleware/requestLogger.js';
import { initializeRealtime } from './services/realtime.service.js';

const app = express();

const port = process.env.PORT || 5000;

const normalizeOrigin = (origin = '') =>
  origin.trim().replace(/\/+$/, '');

const parseOrigins = (origins = '') =>
  origins
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://grievance-io.vercel.app',
  'https://grievance-ai-ui.web.app',
  ...parseOrigins(process.env.CLIENT_ORIGIN),
  ...parseOrigins(process.env.CLIENT_ORIGINS),
]);

// Security
app.use(helmet());

// CORS
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(normalizeOrigin(origin))) {
        return callback(null, true);
      }

      return callback(
        new Error(`Origin ${origin} is not allowed by CORS`)
      );
    },
    credentials: true,
  })
);

// Body parsers
app.use(
  express.json({
    limit: process.env.JSON_BODY_LIMIT || '25mb',
  })
);

app.use(
  express.urlencoded({
    extended: false,
  })
);

// Logging
app.use(morgan('dev'));
app.use(requestLogger);

// Root Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Grievance AI Backend Running',
  });
});

// Health Check
app.get('/health', async (req, res, next) => {
  try {
    const [userCount, complaintCount] = await Promise.all([
      prisma.user.count(),
      prisma.complaint.count(),
    ]);

    res.json({
      success: true,
      message: 'OK',
      data: {
        database: 'PostgreSQL',
        users: userCount,
        complaints: complaintCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/speech', speechRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/citizen', citizenRoutes);

// 404 Handler
app.use(notFoundHandler);

// Error Handler
app.use(errorMiddleware);

// HTTP Server
const httpServer = http.createServer(app);

// Realtime Initialization
initializeRealtime(httpServer, allowedOrigins);

// Start Server
const server = httpServer.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

// Graceful Shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();

  server.close(() => {
    process.exit(0);
  });
});

export default app;