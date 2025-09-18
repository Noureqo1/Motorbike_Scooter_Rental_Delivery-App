// Authentication middleware
const { authenticateToken, authorizeRoles, optionalAuth } = require('./auth');

// Logging middleware
const { requestLogger, responseWrapper, requestId } = require('./logging');

// Validation middleware
const { validateRequest, validationSchemas } = require('./validation');

// Rate limiting middleware
const { moderateRateLimit, strictRateLimit, lenientRateLimit } = require('./rateLimit');

// Error handling middleware
const {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  createError,
  validationError,
  authorizationError,
  authenticationError
} = require('./errorHandler');

module.exports = {
  // Auth
  authenticateToken,
  authorizeRoles,
  optionalAuth,

  // Logging
  requestLogger,
  responseWrapper,
  requestId,

  // Validation
  validateRequest,
  validationSchemas,

  // Rate Limiting
  moderateRateLimit,
  strictRateLimit,
  lenientRateLimit,

  // Error Handling
  errorHandler,
  notFoundHandler,
  asyncHandler,
  createError,
  validationError,
  authorizationError,
  authenticationError
};
