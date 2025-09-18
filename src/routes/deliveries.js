const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');

// Create a delivery request
// POST /api/deliveries
router.post('/', deliveryController.createDelivery);

// Get delivery by ID
// GET /api/deliveries/:id
router.get('/:id', deliveryController.getDelivery);

// Track delivery by tracking number (public endpoint)
// GET /api/deliveries/track/:tracking_number
router.get('/track/:tracking_number', deliveryController.trackDelivery);

// Update delivery status
// PUT /api/deliveries/:id/status
router.put('/:id/status', deliveryController.updateDeliveryStatus);

module.exports = router;
