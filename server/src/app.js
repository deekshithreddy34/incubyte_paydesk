import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import optionsRoutes from './modules/options/options.routes.js';
import employeeRoutes from './modules/employees/employee.routes.js';
import salaryRoutes from './modules/salaries/salary.routes.js';
import { errorHandler } from './middleware/error-handler.js';

const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'"],
        scriptSrc: ["'self'"],
      },
    },
  })
);

// Body size limit: 10kb
app.use(express.json({ limit: '10kb' }));

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: false,
  })
);

// Infrastructure Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Feature routes
app.use('/api', optionsRoutes);
app.use('/api', employeeRoutes);
app.use('/api', salaryRoutes);

// Catch-all 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'API endpoint not found',
    },
  });
});

// Centralized error handler
app.use(errorHandler);

export default app;

