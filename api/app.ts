/**
 * Express API Server
 */

import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/students.js';
import courseRoutes from './routes/courses.js';
import classroomRoutes from './routes/classrooms.js';
import scheduleRoutes from './routes/schedules.js';
import teacherRoutes from './routes/teachers.js';
import salaryRoutes from './routes/salarys.js';
import signinRoutes from './routes/signins.js';
import systemRoutes from './routes/system.js';

// Import middlewares
import { authMiddleware } from './middlewares/auth.js';
import { logMiddleware } from './middlewares/log.js';
import { errorHandler, notFoundHandler } from './middlewares/error.js';

// ESM mode
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/classrooms', classroomRoutes);
app.use('/api/v1/schedules', scheduleRoutes);
app.use('/api/v1/teachers', teacherRoutes);
app.use('/api/v1/salarys', salaryRoutes);
app.use('/api/v1/signins', signinRoutes);
app.use('/api/v1/system', systemRoutes);

// Health check
app.use('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'ok'
  });
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
