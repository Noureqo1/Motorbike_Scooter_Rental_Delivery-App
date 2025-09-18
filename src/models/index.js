const User = require('./User');
const Vendor = require('./Vendor');
const Driver = require('./Driver');
const Vehicle = require('./Vehicle');
const Booking = require('./Booking');
const Delivery = require('./Delivery');

// Define associations/relationships

// User relationships
User.hasOne(Vendor, {
  foreignKey: 'created_by',
  as: 'vendor'
});

User.hasMany(Booking, {
  foreignKey: 'user_id',
  as: 'bookings'
});

User.hasOne(Driver, {
  foreignKey: 'user_id',
  as: 'driverProfile'
});

// Vendor relationships
Vendor.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'admin'
});

Vendor.hasMany(Driver, {
  foreignKey: 'vendor_id',
  as: 'drivers'
});

Vendor.hasMany(Vehicle, {
  foreignKey: 'vendor_id',
  as: 'vehicles'
});

// Driver relationships
Driver.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

Driver.belongsTo(Vendor, {
  foreignKey: 'vendor_id',
  as: 'vendor'
});

Driver.hasMany(Booking, {
  foreignKey: 'driver_id',
  as: 'bookings'
});

// Vehicle relationships
Vehicle.belongsTo(Vendor, {
  foreignKey: 'vendor_id',
  as: 'vendor'
});

Vehicle.hasMany(Booking, {
  foreignKey: 'vehicle_id',
  as: 'bookings'
});

// Booking relationships
Booking.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

Booking.belongsTo(Vehicle, {
  foreignKey: 'vehicle_id',
  as: 'vehicle'
});

Booking.belongsTo(Driver, {
  foreignKey: 'driver_id',
  as: 'driver'
});

Booking.hasOne(Delivery, {
  foreignKey: 'booking_id',
  as: 'delivery'
});

// Delivery relationships
Delivery.belongsTo(Booking, {
  foreignKey: 'booking_id',
  as: 'booking'
});

module.exports = {
  User,
  Vendor,
  Driver,
  Vehicle,
  Booking,
  Delivery
};
