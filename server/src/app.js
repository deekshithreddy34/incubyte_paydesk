import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import optionsRoutes from './modules/options/options.routes.js';
import employeeRoutes from './modules/employees/employee.routes.js';
import salaryRoutes from './modules/salaries/salary.routes.js';
import insightRoutes from './modules/insights/insight.routes.js';
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
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((o) => o.trim())
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
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
app.use('/api', insightRoutes);

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

