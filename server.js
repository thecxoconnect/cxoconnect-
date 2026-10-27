import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import passport from 'passport';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { configurePassport } from './config/passport.js';
import apiRoutes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Passport Strategies
configurePassport();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Core Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(':date[iso] :method :url :status :res[content-length] - :response-time ms'));
}

// Passport Initialization
app.use(passport.initialize());

// Serve Static Files (Client Test Harness & Branded UI)
app.use(express.static(path.join(__dirname, 'public')));

// Mount API Routes at /api
app.use('/api', apiRoutes);

// Catch 404 for undefined API routes or pages
app.use('/api', notFoundHandler);

// Fallback route for SPA or verify-otp redirect
app.get('/verify-otp', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Catch-all 404 for any other unmatched routes
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
=====================================================
  CXO Connect / HRSG Backend Server
  Running on: http://localhost:${PORT}
  Environment: ${process.env.NODE_ENV || 'development'}
  API Base: http://localhost:${PORT}/api
  Health Check: http://localhost:${PORT}/api/health
=====================================================
  `);
});

export { app, server };
export default app;
