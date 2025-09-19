const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Create a new booking
// POST /api/bookings
router.post('/', bookingController.createBooking);

// Get booking by ID
// GET /api/bookings/:id
router.get('/:id', bookingController.getBooking);

// Get user's bookings
// GET /api/bookings/user/:user_id?page=1&limit=10&status=confirmed
router.get('/user/:user_id', bookingController.getUserBookings);

// Update booking status
// PUT /api/bookings/:id/status
router.put('/:id/status', bookingController.updateBookingStatus);

// Process payment for booking
// POST /api/bookings/payment
router.post('/payment', bookingController.processPayment);

module.exports = router;
