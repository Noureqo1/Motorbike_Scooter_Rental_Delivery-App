const express = require('express');
const router = express.Router();
const models = require('../models');

// Get driver by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const driver = await models.Driver.findByPk(id, {
      include: [{
        model: models.User,
        as: 'user',
        attributes: ['first_name', 'last_name', 'email', 'phone']
      }, {
        model: models.Vendor,
        as: 'vendor',
        attributes: ['name', 'city']
      }]
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    res.json({
      success: true,
      data: driver
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving driver',
      error: error.message
    });
  }
});

// Get drivers by vendor
router.get('/vendor/:vendor_id', async (req, res) => {
  try {
    const { vendor_id } = req.params;
    const { available_only = true } = req.query;

    let whereClause = { vendor_id };
    if (available_only === 'true') {
      whereClause.is_available = true;
    }

    const drivers = await models.Driver.findAll({
      where: whereClause,
      include: [{
        model: models.User,
        as: 'user',
        attributes: ['first_name', 'last_name', 'phone']
      }]
    });

    res.json({
      success: true,
      data: drivers,
      count: drivers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving drivers',
      error: error.message
    });
  }
});

module.exports = router;
