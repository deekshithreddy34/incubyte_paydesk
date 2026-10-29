import { AppError } from '../lib/errors.js';

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  // Handle known application errors
  if (err instanceof AppError) {
    const response = {
      error: {
        code: err.code,
        message: err.message,
        ...(err.fields && { fields: err.fields }),
      },
    };
    return res.status(err.statusCode).json(response);
  }

  // Always log unexpected internal errors
  console.error('Unhandled internal error:', err);

  // Handle JSON syntax parse error from express.json()
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: {
        code: 'MALFORMED_JSON',
        message: 'Malformed JSON payload in request body',
      },
    });
  }

  // Handle Prisma unique constraint violation (P2002)
  if (err.code === 'P2002') {
    const target = err.meta?.target || [];
    return res.status(409).json({
      error: {
        code: 'CONFLICT',
        message: `Resource already exists with conflicting unique field: ${Array.isArray(target) ? target.join(', ') : target}`,
      },
    });
  }

  // Handle Prisma record not found (P2025)
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'Requested record was not found',
      },
    });
  }

  // Generic 500 fallback - do not leak stack traces or internal queries
  const isDev = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';
  if (isDev) {
    console.error('Unhandled internal error:', err);
  }

  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred',
    },
  });
}

