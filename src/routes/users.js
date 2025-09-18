const express = require('express');
const router = express.Router();
const models = require('../models');

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await models.User.findByPk(id, {
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
      message: 'Error retrieving user',
      error: error.message
    });
  }
});

// Create a new user (mock implementation)
router.post('/', async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, user_type } = req.body;

    const user = await models.User.create({
      email,
      password_hash: password, // In real app, hash the password
      first_name,
      last_name,
      phone,
      user_type: user_type || 'customer'
    });

    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
});

// Get all users (admin endpoint)
router.get('/', async (req, res) => {
  try {
    const users = await models.User.findAll({
      attributes: { exclude: ['password_hash'] },
      limit: 50
    });

    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving users',
      error: error.message
    });
  }
});

module.exports = router;
