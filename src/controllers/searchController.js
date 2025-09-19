const models = require('../models');

// Search vehicles by location, type, dates, etc.
const searchVehicles = async (req, res) => {
  try {
    const {
      vehicle_type,
      city,
      latitude,
      longitude,
      radius = 10, // km
      start_date,
      end_date,
      min_price,
      max_price,
      available_only = true
    } = req.query;

    let whereClause = {};

    // Filter by vehicle type
    if (vehicle_type) {
      whereClause.vehicle_type = vehicle_type;
    }

    // Filter by availability
    if (available_only === 'true') {
      whereClause.is_available = true;
    }

    // Filter by price range
    if (min_price || max_price) {
      whereClause.hourly_rate = {};
      if (min_price) whereClause.hourly_rate[models.Sequelize.Op.gte] = min_price;
      if (max_price) whereClause.hourly_rate[models.Sequelize.Op.lte] = max_price;
    }

    // Get vehicles with vendor information
    const vehicles = await models.Vehicle.findAll({
      where: whereClause,
      include: [{
        model: models.Vendor,
        as: 'vendor',
        where: city ? { city: city } : {},
        required: !!city,
        attributes: ['id', 'name', 'city', 'rating', 'latitude', 'longitude']
      }],
      attributes: [
        'id', 'vehicle_type', 'make', 'model', 'year', 'color',
        'hourly_rate', 'daily_rate', 'images', 'location_lat', 'location_lng',
        'condition_status', 'rating'
      ]
    });

    // If location-based search, filter by radius
    let filteredVehicles = vehicles;
    if (latitude && longitude) {
      const userLat = parseFloat(latitude);
      const userLng = parseFloat(longitude);
      const radiusKm = parseFloat(radius);

      filteredVehicles = vehicles.filter(vehicle => {
        if (!vehicle.location_lat || !vehicle.location_lng) return false;

        const distance = calculateDistance(
          userLat, userLng,
          parseFloat(vehicle.location_lat), parseFloat(vehicle.location_lng)
        );

        return distance <= radiusKm;
      });
    }

    // Check availability for date range
    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);

      for (let vehicle of filteredVehicles) {
        const conflictingBookings = await models.Booking.findAll({
          where: {
            vehicle_id: vehicle.id,
            status: { [models.Sequelize.Op.in]: ['confirmed', 'in_progress'] },
            [models.Sequelize.Op.or]: [
              {
                start_date: { [models.Sequelize.Op.lt]: endDate },
                end_date: { [models.Sequelize.Op.gt]: startDate }
              }
            ]
          }
        });

        vehicle.dataValues.is_available_for_dates = conflictingBookings.length === 0;
      }
    }

    res.json({
      success: true,
      data: filteredVehicles,
      count: filteredVehicles.length,
      message: `Found ${filteredVehicles.length} vehicles matching your criteria`
    });

  } catch (error) {
    console.error('Search vehicles error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching vehicles',
      error: error.message
    });
  }
};

// Calculate distance between two points using Haversine formula
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  return distance;
};

// Search drivers by location and availability
const searchDrivers = async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      radius = 5,
      vehicle_type,
      available_only = true
    } = req.query;

    let whereClause = {};

    // Filter by availability
    if (available_only === 'true') {
      whereClause.is_available = true;
    }

    // Filter by license type if vehicle_type specified
    if (vehicle_type) {
      if (vehicle_type === 'motorbike') {
        whereClause.license_type = { [models.Sequelize.Op.in]: ['motorcycle', 'both'] };
      } else if (vehicle_type === 'scooter' || vehicle_type === 'electric_scooter') {
        whereClause.license_type = { [models.Sequelize.Op.in]: ['scooter', 'both'] };
      }
    }

    const drivers = await models.Driver.findAll({
      where: whereClause,
      include: [{
        model: models.User,
        as: 'user',
        attributes: ['first_name', 'last_name', 'phone']
      }, {
        model: models.Vendor,
        as: 'vendor',
        attributes: ['name', 'city']
      }],
      attributes: [
        'id', 'license_type', 'years_of_experience', 'rating',
        'current_location_lat', 'current_location_lng', 'is_available'
      ]
    });

    // Filter by radius if location provided
    let filteredDrivers = drivers;
    if (latitude && longitude) {
      const userLat = parseFloat(latitude);
      const userLng = parseFloat(longitude);
      const radiusKm = parseFloat(radius);

      filteredDrivers = drivers.filter(driver => {
        if (!driver.current_location_lat || !driver.current_location_lng) return false;

        const distance = calculateDistance(
          userLat, userLng,
          parseFloat(driver.current_location_lat), parseFloat(driver.current_location_lng)
        );

        return distance <= radiusKm;
      });
    }

    res.json({
      success: true,
      data: filteredDrivers,
      count: filteredDrivers.length,
      message: `Found ${filteredDrivers.length} drivers in your area`
    });

  } catch (error) {
    console.error('Search drivers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching drivers',
      error: error.message
    });
  }
};

module.exports = {
  searchVehicles,
  searchDrivers
};
