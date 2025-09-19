const models = require('../models');

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const {
      user_id,
      vehicle_id,
      driver_id,
      booking_type,
      start_date,
      end_date,
      pickup_location_lat,
      pickup_location_lng,
      dropoff_location_lat,
      dropoff_location_lng,
      special_requests
    } = req.body;

    // Validate required fields
    if (!user_id || !vehicle_id || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: user_id, vehicle_id, start_date, end_date'
      });
    }

    // Check if vehicle is available for the requested dates
    const conflictingBookings = await models.Booking.findAll({
      where: {
        vehicle_id: vehicle_id,
        status: { [models.Sequelize.Op.in]: ['confirmed', 'in_progress'] },
        [models.Sequelize.Op.or]: [
          {
            start_date: { [models.Sequelize.Op.lt]: new Date(end_date) },
            end_date: { [models.Sequelize.Op.gt]: new Date(start_date) }
          }
        ]
      }
    });

    if (conflictingBookings.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Vehicle is not available for the selected dates'
      });
    }

    // Get vehicle details for pricing
    const vehicle = await models.Vehicle.findByPk(vehicle_id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Calculate total hours and amount
    const startDateTime = new Date(start_date);
    const endDateTime = new Date(end_date);
    const totalHours = (endDateTime - startDateTime) / (1000 * 60 * 60);
    const totalAmount = totalHours * parseFloat(vehicle.hourly_rate);

    // Create booking
    const booking = await models.Booking.create({
      user_id,
      vehicle_id,
      driver_id,
      booking_type: booking_type || 'rental',
      start_date: startDateTime,
      end_date: endDateTime,
      pickup_location_lat,
      pickup_location_lng,
      dropoff_location_lat,
      dropoff_location_lng,
      total_hours: totalHours,
      total_amount: totalAmount,
      status: 'pending',
      payment_status: 'pending',
      special_requests
    });

    // Fetch booking with related data
    const bookingWithDetails = await models.Booking.findByPk(booking.id, {
      include: [
        {
          model: models.User,
          as: 'user',
          attributes: ['first_name', 'last_name', 'email', 'phone']
        },
        {
          model: models.Vehicle,
          as: 'vehicle',
          include: [{
            model: models.Vendor,
            as: 'vendor',
            attributes: ['name', 'city']
          }],
          attributes: ['make', 'model', 'vehicle_type', 'hourly_rate']
        },
        {
          model: models.Driver,
          as: 'driver',
          include: [{
            model: models.User,
            as: 'user',
            attributes: ['first_name', 'last_name', 'phone']
          }],
          required: false
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: bookingWithDetails,
      message: 'Booking created successfully'
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
};

// Get booking by ID
const getBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await models.Booking.findByPk(id, {
      include: [
        {
          model: models.User,
          as: 'user',
          attributes: ['first_name', 'last_name', 'email', 'phone']
        },
        {
          model: models.Vehicle,
          as: 'vehicle',
          include: [{
            model: models.Vendor,
            as: 'vendor',
            attributes: ['name', 'city']
          }]
        },
        {
          model: models.Driver,
          as: 'driver',
          include: [{
            model: models.User,
            as: 'user',
            attributes: ['first_name', 'last_name', 'phone']
          }],
          required: false
        },
        {
          model: models.Delivery,
          as: 'delivery',
          required: false
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving booking',
      error: error.message
    });
  }
};

// Get user's bookings
const getUserBookings = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = { user_id };

    if (status) {
      whereClause.status = status;
    }

    const bookings = await models.Booking.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: models.Vehicle,
          as: 'vehicle',
          include: [{
            model: models.Vendor,
            as: 'vendor',
            attributes: ['name', 'city']
          }],
          attributes: ['make', 'model', 'vehicle_type', 'images']
        },
        {
          model: models.Driver,
          as: 'driver',
          include: [{
            model: models.User,
            as: 'user',
            attributes: ['first_name', 'last_name']
          }],
          required: false
        }
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: bookings.rows,
      pagination: {
        total: bookings.count,
        page: parseInt(page),
        pages: Math.ceil(bookings.count / limit),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user bookings',
      error: error.message
    });
  }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;

    const booking = await models.Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Update status fields
    const updateData = {};
    if (status) updateData.status = status;
    if (payment_status) updateData.payment_status = payment_status;

    await booking.update(updateData);

    res.json({
      success: true,
      data: booking,
      message: 'Booking updated successfully'
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating booking status',
      error: error.message
    });
  }
};

// Mock payment processing
const processPayment = async (req, res) => {
  try {
    const { booking_id, payment_method, amount } = req.body;

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // In a real application, you would integrate with a payment gateway
    // For now, we'll simulate a successful payment

    const booking = await models.Booking.findByPk(booking_id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Update booking payment status
    await booking.update({
      payment_status: 'paid',
      payment_method: payment_method,
      status: 'confirmed'
    });

    // Generate mock transaction details
    const transaction = {
      id: `txn_${Date.now()}`,
      booking_id: booking_id,
      amount: amount,
      payment_method: payment_method,
      status: 'completed',
      transaction_date: new Date(),
      gateway_response: {
        transaction_id: `gw_${Date.now()}`,
        status: 'approved',
        message: 'Payment processed successfully'
      }
    };

    res.json({
      success: true,
      data: {
        booking: booking,
        transaction: transaction
      },
      message: 'Payment processed successfully'
    });

  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment',
      error: error.message
    });
  }
};

module.exports = {
  createBooking,
  getBooking,
  getUserBookings,
  updateBookingStatus,
  processPayment
};
