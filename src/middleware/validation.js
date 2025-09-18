/**
 * Input Validation Middleware
 * Common validation functions for API inputs
 */

/**
 * Validate UUID format
 */
const validateUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validate email format
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (basic international format)
 */
const validatePhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate coordinates (latitude/longitude)
 */
const validateCoordinates = (lat, lng) => {
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);

  return !isNaN(latNum) && !isNaN(lngNum) &&
         latNum >= -90 && latNum <= 90 &&
         lngNum >= -180 && lngNum <= 180;
};

/**
 * Validate date format and range
 */
const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  return start instanceof Date && !isNaN(start) &&
         end instanceof Date && !isNaN(end) &&
         start < end &&
         start >= now; // Start date should be in future
};

/**
 * General validation middleware factory
 */
const validateRequest = (validations) => {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(validations)) {
      const value = req.body[field];

      // Check required fields
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      // Skip validation if field is not required and empty
      if (!rules.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      // Type validation
      if (rules.type) {
        if (rules.type === 'string' && typeof value !== 'string') {
          errors.push(`${field} must be a string`);
        }
        if (rules.type === 'number' && typeof value !== 'number' && isNaN(Number(value))) {
          errors.push(`${field} must be a number`);
        }
        if (rules.type === 'boolean' && typeof value !== 'boolean') {
          errors.push(`${field} must be a boolean`);
        }
      }

      // Custom validation functions
      if (rules.validator) {
        const isValid = rules.validator(value);
        if (!isValid) {
          errors.push(rules.message || `${field} is invalid`);
        }
      }

      // Length validation for strings
      if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }
      if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
        errors.push(`${field} must be at most ${rules.maxLength} characters`);
      }

      // Range validation for numbers
      if (rules.min !== undefined && Number(value) < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`);
      }
      if (rules.max !== undefined && Number(value) > rules.max) {
        errors.push(`${field} must be at most ${rules.max}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    next();
  };
};

/**
 * Pre-built validation schemas
 */
const validationSchemas = {
  userRegistration: {
    email: {
      required: true,
      validator: validateEmail,
      message: 'Please provide a valid email address'
    },
    password: {
      required: true,
      minLength: 6,
      maxLength: 100
    },
    first_name: {
      required: true,
      minLength: 2,
      maxLength: 50
    },
    last_name: {
      required: true,
      minLength: 2,
      maxLength: 50
    },
    phone: {
      required: true,
      validator: validatePhone,
      message: 'Please provide a valid phone number'
    }
  },

  bookingCreation: {
    user_id: {
      required: true,
      validator: validateUUID,
      message: 'Invalid user ID format'
    },
    vehicle_id: {
      required: true,
      validator: validateUUID,
      message: 'Invalid vehicle ID format'
    },
    start_date: { required: true },
    end_date: { required: true }
  }
};

module.exports = {
  validateRequest,
  validateUUID,
  validateEmail,
  validatePhone,
  validateCoordinates,
  validateDateRange,
  validationSchemas
};
