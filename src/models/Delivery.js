const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Delivery = sequelize.define('Delivery', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sender_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sender_phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sender_address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  recipient_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  recipient_phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  recipient_address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  package_description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  package_weight: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  package_dimensions: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'JSON object with length, width, height in cm'
  },
  delivery_priority: {
    type: DataTypes.ENUM('standard', 'express', 'urgent'),
    defaultValue: 'standard'
  },
  estimated_delivery_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  actual_delivery_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  delivery_status: {
    type: DataTypes.ENUM('pending', 'picked_up', 'in_transit', 'delivered', 'failed'),
    defaultValue: 'pending'
  },
  delivery_fee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  tips: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  tracking_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'deliveries',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Generate tracking number before creating
Delivery.beforeCreate(async (delivery) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  delivery.tracking_number = `DEL${timestamp}${random}`;
});

module.exports = Delivery;
