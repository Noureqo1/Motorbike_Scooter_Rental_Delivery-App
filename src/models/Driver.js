const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Driver = sequelize.define('Driver', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  license_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  license_type: {
    type: DataTypes.ENUM('motorcycle', 'scooter', 'both'),
    allowNull: false
  },
  years_of_experience: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 5
    }
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  current_location_lat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  current_location_lng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  phone_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  background_check_status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'drivers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Driver;
