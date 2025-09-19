/**
 * Error Handling Middleware
 * Centralized error handling for the application
 */

/**
 * Global Error Handler
 * Handles all errors thrown in the application
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', err);

  // Sequelize Validation Error
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: errors
    });
  }

  // Sequelize Unique Constraint Error
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry found',
      error: 'A record with this information already exists'
    });
  }

  // Sequelize Foreign Key Constraint Error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid reference',
      error: 'The referenced record does not exist'
    });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Custom Application Errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors })
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * 404 Not Found Handler
 * Handles requests to non-existent routes
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
};

/**
 * Async Error Wrapper
 * Wraps async route handlers to catch rejected promises
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Create Custom Error
 * Helper function to create custom errors
 */
const createError = (message, statusCode = 500, errors = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (errors) error.errors = errors;
  return error;
};

/**
 * Validation Error Helper
 * Creates standardized validation errors
 */
const validationError = (errors) => {
  return createError('Validation failed', 400, errors);
};

/**
 * Authorization Error Helper
 * Creates standardized authorization errors
 */
const authorizationError = (message = 'Access denied') => {
  return createError(message, 403);
};

/**
 * Authentication Error Helper
 * Creates standardized authentication errors
 */
const authenticationError = (message = 'Authentication required') => {
  return createError(message, 401);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  createError,
  validationError,
  authorizationError,
  authenticationError
};
