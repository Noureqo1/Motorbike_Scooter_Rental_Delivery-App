const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const models = require('../models');

// Mock login - in real app, verify password hash
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await models.User.findOne({
      where: { email },
      attributes: ['id', 'email', 'first_name', 'last_name', 'user_type', 'password_hash']
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Mock password verification (in real app, use bcrypt.compare)
    if (password !== user.password_hash) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        user_id: user.id,
        email: user.email,
        user_type: user.user_type
      },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Remove password from response
    const userResponse = { ...user.toJSON() };
    delete userResponse.password_hash;

    res.json({
      success: true,
      data: {
        user: userResponse,
        token: token
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
});

// Mock register
router.post('/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, user_type } = req.body;

    // Check if user already exists
    const existingUser = await models.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = await models.User.create({
      email,
      password_hash: password, // In real app, hash the password
      first_name,
      last_name,
      phone,
      user_type: user_type || 'customer'
    });

    // Generate token
    const token = jwt.sign(
      {
        user_id: user.id,
        email: user.email,
        user_type: user.user_type
      },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Remove password from response
    const userResponse = { ...user.toJSON() };
    delete userResponse.password_hash;

    res.status(201).json({
      success: true,
      data: {
        user: userResponse,
        token: token
      },
      message: 'User registered successfully'
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during registration',
      error: error.message
    });
  }
});

// Verify token middleware (can be used to protect routes)
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Get current user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await models.User.findByPk(req.user.user_id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving profile',
      error: error.message
    });
  }
});

module.exports = {
  router,
  verifyToken
};
