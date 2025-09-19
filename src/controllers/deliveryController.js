const models = require('../models');

// Create a delivery request
const createDelivery = async (req, res) => {
  try {
    const {
      booking_id,
      sender_name,
      sender_phone,
      sender_address,
      recipient_name,
      recipient_phone,
      recipient_address,
      package_description,
      package_weight,
      package_dimensions,
      delivery_priority,
      delivery_fee,
      special_instructions
    } = req.body;

    // Validate required fields
    if (!booking_id || !sender_name || !sender_phone || !sender_address ||
        !recipient_name || !recipient_phone || !recipient_address || !package_description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required delivery fields'
      });
    }

    // Check if booking exists and is eligible for delivery
    const booking = await models.Booking.findByPk(booking_id, {
      include: [{
        model: models.Delivery,
        as: 'delivery'
      }]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.delivery) {
      return res.status(409).json({
        success: false,
        message: 'Delivery already exists for this booking'
      });
    }

    // Calculate estimated delivery time based on priority
    const estimatedDeliveryTime = calculateEstimatedDeliveryTime(delivery_priority);

    // Create delivery
    const delivery = await models.Delivery.create({
      booking_id,
      sender_name,
      sender_phone,
      sender_address,
      recipient_name,
      recipient_phone,
      recipient_address,
      package_description,
      package_weight,
      package_dimensions,
      delivery_priority: delivery_priority || 'standard',
      estimated_delivery_time: estimatedDeliveryTime,
      delivery_fee: delivery_fee || 0,
      delivery_status: 'pending'
    });

    // Update booking to include delivery fee in total
    const updatedTotal = parseFloat(booking.total_amount) + parseFloat(delivery_fee || 0);
    await booking.update({ total_amount: updatedTotal });

    // Fetch delivery with booking details
    const deliveryWithDetails = await models.Delivery.findByPk(delivery.id, {
      include: [{
        model: models.Booking,
        as: 'booking',
        include: [{
          model: models.User,
          as: 'user',
          attributes: ['first_name', 'last_name', 'email', 'phone']
        }, {
          model: models.Vehicle,
          as: 'vehicle',
          include: [{
            model: models.Vendor,
            as: 'vendor',
            attributes: ['name']
          }],
          attributes: ['make', 'model', 'vehicle_type']
        }, {
          model: models.Driver,
          as: 'driver',
          include: [{
            model: models.User,
            as: 'user',
            attributes: ['first_name', 'last_name', 'phone']
          }],
          required: false
        }]
      }]
    });

    res.status(201).json({
      success: true,
      data: deliveryWithDetails,
      message: 'Delivery request created successfully'
    });

  } catch (error) {
    console.error('Create delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating delivery request',
      error: error.message
    });
  }
};

// Get delivery by ID or tracking number
const getDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const { tracking_number } = req.query;

    let whereClause = {};
    if (tracking_number) {
      whereClause.tracking_number = tracking_number;
    } else {
      whereClause.id = id;
    }

    const delivery = await models.Delivery.findOne({
      where: whereClause,
      include: [{
        model: models.Booking,
        as: 'booking',
        include: [{
          model: models.User,
          as: 'user',
          attributes: ['first_name', 'last_name', 'email', 'phone']
        }, {
          model: models.Vehicle,
          as: 'vehicle',
          include: [{
            model: models.Vendor,
            as: 'vendor',
            attributes: ['name', 'city']
          }],
          attributes: ['make', 'model', 'vehicle_type']
        }, {
          model: models.Driver,
          as: 'driver',
          include: [{
            model: models.User,
            as: 'user',
            attributes: ['first_name', 'last_name', 'phone']
          }],
          required: false
        }]
      }]
    });

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    res.json({
      success: true,
      data: delivery
    });

  } catch (error) {
    console.error('Get delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving delivery',
      error: error.message
    });
  }
};

// Track delivery by tracking number (public endpoint)
const trackDelivery = async (req, res) => {
  try {
    const { tracking_number } = req.params;

    const delivery = await models.Delivery.findOne({
      where: { tracking_number },
      include: [{
        model: models.Booking,
        as: 'booking',
        include: [{
          model: models.Driver,
          as: 'driver',
          include: [{
            model: models.User,
            as: 'user',
            attributes: ['first_name', 'last_name', 'phone']
          }],
          required: false,
          attributes: ['current_location_lat', 'current_location_lng']
        }],
        attributes: ['start_date', 'end_date', 'status']
      }],
      attributes: [
        'id', 'tracking_number', 'delivery_status', 'estimated_delivery_time',
        'actual_delivery_time', 'sender_name', 'recipient_name',
        'package_description', 'delivery_priority'
      ]
    });

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    // Generate tracking history (mock data)
    const trackingHistory = generateTrackingHistory(delivery);

    res.json({
      success: true,
      data: {
        delivery: delivery,
        tracking_history: trackingHistory,
        current_status: {
          status: delivery.delivery_status,
          description: getStatusDescription(delivery.delivery_status),
          estimated_delivery: delivery.estimated_delivery_time
        }
      }
    });

  } catch (error) {
    console.error('Track delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking delivery',
      error: error.message
    });
  }
};

// Update delivery status
const updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, driver_location_lat, driver_location_lng, notes } = req.body;

    const delivery = await models.Delivery.findByPk(id);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    const updateData = { delivery_status: status };

    // If delivery is completed, set actual delivery time
    if (status === 'delivered') {
      updateData.actual_delivery_time = new Date();
    }

    await delivery.update(updateData);

    // Update driver's location if provided
    if (driver_location_lat && driver_location_lng && delivery.booking_id) {
      const booking = await models.Booking.findByPk(delivery.booking_id);
      if (booking.driver_id) {
        await models.Driver.update({
          current_location_lat: driver_location_lat,
          current_location_lng: driver_location_lng
        }, {
          where: { id: booking.driver_id }
        });
      }
    }

    res.json({
      success: true,
      data: delivery,
      message: 'Delivery status updated successfully'
    });

  } catch (error) {
    console.error('Update delivery status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating delivery status',
      error: error.message
    });
  }
};

// Helper function to calculate estimated delivery time
const calculateEstimatedDeliveryTime = (priority) => {
  const now = new Date();
  let hoursToAdd = 24; // default 24 hours

  switch (priority) {
    case 'express':
      hoursToAdd = 4;
      break;
    case 'urgent':
      hoursToAdd = 2;
      break;
    case 'standard':
    default:
      hoursToAdd = 24;
      break;
  }

  return new Date(now.getTime() + (hoursToAdd * 60 * 60 * 1000));
};

// Helper function to generate mock tracking history
const generateTrackingHistory = (delivery) => {
  const history = [];
  const createdAt = delivery.created_at || new Date();

  // Always include order placed
  history.push({
    status: 'pending',
    description: 'Order placed',
    timestamp: createdAt,
    location: 'System'
  });

  // Add intermediate statuses based on current status
  const statusFlow = ['pending', 'picked_up', 'in_transit', 'delivered'];
  const currentIndex = statusFlow.indexOf(delivery.delivery_status);

  for (let i = 1; i <= currentIndex; i++) {
    const status = statusFlow[i];
    let timestamp, location, description;

    switch (status) {
      case 'picked_up':
        timestamp = new Date(createdAt.getTime() + (2 * 60 * 60 * 1000)); // 2 hours later
        location = delivery.sender_address?.split(',')[0] || 'Pickup Location';
        description = 'Package picked up from sender';
        break;
      case 'in_transit':
        timestamp = new Date(createdAt.getTime() + (4 * 60 * 60 * 1000)); // 4 hours later
        location = 'In Transit';
        description = 'Package is on the way to recipient';
        break;
      case 'delivered':
        timestamp = delivery.actual_delivery_time || new Date();
        location = delivery.recipient_address?.split(',')[0] || 'Delivery Location';
        description = 'Package delivered successfully';
        break;
    }

    history.push({
      status,
      description,
      timestamp,
      location
    });
  }

  return history.sort((a, b) => b.timestamp - a.timestamp);
};

// Helper function to get status description
const getStatusDescription = (status) => {
  const descriptions = {
    'pending': 'Your delivery request has been received and is being processed',
    'picked_up': 'The package has been picked up from the sender',
    'in_transit': 'The package is on its way to the recipient',
    'delivered': 'The package has been successfully delivered',
    'failed': 'Delivery attempt failed - please contact support'
  };

  return descriptions[status] || 'Status unknown';
};

module.exports = {
  createDelivery,
  getDelivery,
  trackDelivery,
  updateDeliveryStatus
};
