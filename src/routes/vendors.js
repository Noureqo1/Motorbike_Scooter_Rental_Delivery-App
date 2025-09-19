const express = require('express');
const router = express.Router();
const models = require('../models');

// Get vendor by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await models.Vendor.findByPk(id, {
      include: [{
        model: models.User,
        as: 'admin',
        attributes: ['first_name', 'last_name', 'email']
      }]
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.json({
      success: true,
      data: vendor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving vendor',
      error: error.message
    });
  }
});

// Get all vendors
router.get('/', async (req, res) => {
  try {
    const { city, verified_only = false } = req.query;

    let whereClause = {};
    if (city) whereClause.city = city;
    if (verified_only === 'true') whereClause.is_verified = true;

    const vendors = await models.Vendor.findAll({
      where: whereClause,
      include: [{
        model: models.User,
        as: 'admin',
        attributes: ['first_name', 'last_name', 'email']
      }],
      limit: 50
    });

    res.json({
      success: true,
      data: vendors,
      count: vendors.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving vendors',
      error: error.message
    });
  }
});

module.exports = router;
