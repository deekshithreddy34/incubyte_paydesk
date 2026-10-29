export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', fields = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.fields = fields;
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Invalid request', fields = null) {
    super(message, 400, 'BAD_REQUEST', fields);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists', fields = null) {
    super(message, 409, 'CONFLICT', fields);
  }
}

