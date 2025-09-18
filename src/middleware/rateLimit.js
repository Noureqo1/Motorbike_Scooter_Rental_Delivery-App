/**
 * Rate Limiting Middleware
 * Protects API from abuse by limiting request frequency
 */

// Simple in-memory store for rate limiting
// In production, use Redis or similar
const rateLimitStore = new Map();

/**
 * Rate Limiting Middleware
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @param {string} message - Error message when limit exceeded
 */
const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000, message = 'Too many requests') => {
  return (req, res, next) => {
    const key = req.ip; // Use IP address as key
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create rate limit data for this key
    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, { requests: [], lastReset: now });
    }

    const userData = rateLimitStore.get(key);

    // Clean old requests outside the window
    userData.requests = userData.requests.filter(timestamp => timestamp > windowStart);

    // Check if limit exceeded
    if (userData.requests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: message,
        retryAfter: Math.ceil((userData.requests[0] + windowMs - now) / 1000)
      });
    }

    // Add current request timestamp
    userData.requests.push(now);

    // Set headers for client information
    res.set({
      'X-RateLimit-Limit': maxRequests,
      'X-RateLimit-Remaining': Math.max(0, maxRequests - userData.requests.length - 1),
      'X-RateLimit-Reset': new Date(now + windowMs).toISOString()
    });

    next();
  };
};

/**
 * Stricter rate limiting for sensitive endpoints
 */
const strictRateLimit = rateLimit(10, 5 * 60 * 1000, 'Too many sensitive requests. Please wait 5 minutes.');

/**
 * Moderate rate limiting for general API endpoints
 */
const moderateRateLimit = rateLimit(50, 15 * 60 * 1000, 'Too many requests. Please slow down.');

/**
 * Lenient rate limiting for public endpoints
 */
const lenientRateLimit = rateLimit(200, 60 * 60 * 1000, 'Rate limit exceeded. Please try again later.');

/**
 * Create custom rate limit for specific use cases
 */
const createCustomRateLimit = (options = {}) => {
  const {
    maxRequests = 100,
    windowMs = 15 * 60 * 1000,
    message = 'Too many requests',
    keyGenerator = (req) => req.ip,
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, { requests: [], lastReset: now });
    }

    const userData = rateLimitStore.get(key);
    userData.requests = userData.requests.filter(timestamp => timestamp > windowStart);

    if (userData.requests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: message,
        retryAfter: Math.ceil((userData.requests[0] + windowMs - now) / 1000)
      });
    }

    // Track the response to potentially skip based on status
    const originalSend = res.send;
    res.send = function(data) {
      const statusCode = res.statusCode;

      // Add timestamp if not skipping
      if (!(skipSuccessfulRequests && statusCode < 400) &&
          !(skipFailedRequests && statusCode >= 400)) {
        userData.requests.push(now);
      }

      originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Clean up old entries periodically
 * Call this function in your server startup
 */
const cleanupRateLimitStore = () => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  for (const [key, data] of rateLimitStore.entries()) {
    // Remove entries older than maxAge
    if (now - data.lastReset > maxAge) {
      rateLimitStore.delete(key);
    }
  }
};

// Clean up every hour
setInterval(cleanupRateLimitStore, 60 * 60 * 1000);

module.exports = {
  rateLimit,
  strictRateLimit,
  moderateRateLimit,
  lenientRateLimit,
  createCustomRateLimit,
  cleanupRateLimitStore
};
