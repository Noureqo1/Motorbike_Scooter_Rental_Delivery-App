const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  booking_type: {
    type: DataTypes.ENUM('rental', 'delivery'),
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  pickup_location_lat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  pickup_location_lng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  dropoff_location_lat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  dropoff_location_lng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  total_hours: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'paid', 'refunded'),
    defaultValue: 'pending'
  },
  payment_method: {
    type: DataTypes.ENUM('cash', 'card', 'digital_wallet'),
    allowNull: true
  },
  special_requests: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'bookings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Booking;
