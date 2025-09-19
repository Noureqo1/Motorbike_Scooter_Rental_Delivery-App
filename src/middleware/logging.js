/**
 * Request Logging Middleware
 * Logs all incoming requests with method, URL, response time, and user info
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);

  // Log when response is finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const userInfo = req.user ? `User: ${req.user.user_id}` : 'Anonymous';

    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms - ${userInfo}`);
  });

  next();
};

/**
 * API Response Wrapper Middleware
 * Standardizes API responses and adds metadata
 */
const responseWrapper = (req, res, next) => {
  // Store original json method
  const originalJson = res.json;

  // Override json method to add metadata
  res.json = function(data) {
    const response = {
      ...data,
      timestamp: new Date().toISOString(),
      requestId: req.requestId || 'unknown'
    };

    // Call original json method
    return originalJson.call(this, response);
  };

  next();
};

/**
 * Request ID Middleware
 * Adds unique ID to each request for tracking
 */
const requestId = (req, res, next) => {
  req.requestId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

module.exports = {
  requestLogger,
  responseWrapper,
  requestId
};
