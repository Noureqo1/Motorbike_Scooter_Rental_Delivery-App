const express = require('express');
const router = express.Router();
const models = require('../models');

// Get vehicle by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await models.Vehicle.findByPk(id, {
      include: [{
        model: models.Vendor,
        as: 'vendor',
        attributes: ['name', 'city', 'rating']
      }]
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving vehicle',
      error: error.message
    });
  }
});

// Get vehicles by vendor
router.get('/vendor/:vendor_id', async (req, res) => {
  try {
    const { vendor_id } = req.params;
    const { available_only = true } = req.query;

    let whereClause = { vendor_id };
    if (available_only === 'true') {
      whereClause.is_available = true;
    }

    const vehicles = await models.Vehicle.findAll({
      where: whereClause,
      include: [{
        model: models.Vendor,
        as: 'vendor',
        attributes: ['name', 'city']
      }]
    });

    res.json({
      success: true,
      data: vehicles,
      count: vehicles.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving vehicles',
      error: error.message
    });
  }
});

// Get all vehicles (with pagination)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, vehicle_type, city } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    if (vehicle_type) whereClause.vehicle_type = vehicle_type;

    let includeClause = [];
    if (city) {
      includeClause.push({
        model: models.Vendor,
        as: 'vendor',
        where: { city },
        required: true
      });
    } else {
      includeClause.push({
        model: models.Vendor,
        as: 'vendor',
        attributes: ['name', 'city', 'rating']
      });
    }

    const vehicles = await models.Vehicle.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit: parseInt(limit),
      offset: offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: vehicles.rows,
      pagination: {
        total: vehicles.count,
        page: parseInt(page),
        pages: Math.ceil(vehicles.count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving vehicles',
      error: error.message
    });
  }
});

module.exports = router;
