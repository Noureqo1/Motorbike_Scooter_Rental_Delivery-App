const { sequelize, connectDB } = require('./config/database');
const models = require('./models');

const initializeDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    // Sync all models with database
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');

    // Create indexes for performance
    await createIndexes();

    console.log('Database initialization completed.');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    // Create custom indexes for better performance
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
      CREATE INDEX IF NOT EXISTS idx_vendors_city ON vendors(city);
      CREATE INDEX IF NOT EXISTS idx_vehicles_vendor_available ON vehicles(vendor_id, is_available);
      CREATE INDEX IF NOT EXISTS idx_vehicles_location ON vehicles USING gist (point(location_lng, location_lat));
      CREATE INDEX IF NOT EXISTS idx_bookings_user_status ON bookings(user_id, status);
      CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_date ON bookings(vehicle_id, start_date);
      CREATE INDEX IF NOT EXISTS idx_bookings_status_date ON bookings(status, start_date);
      CREATE INDEX IF NOT EXISTS idx_deliveries_booking ON deliveries(booking_id);
      CREATE INDEX IF NOT EXISTS idx_deliveries_tracking ON deliveries(tracking_number);
      CREATE INDEX IF NOT EXISTS idx_drivers_vendor_available ON drivers(vendor_id, is_available);
    `);
    console.log('Database indexes created successfully.');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

const dropTables = async () => {
  try {
    await sequelize.drop();
    console.log('All tables dropped successfully.');
  } catch (error) {
    console.error('Error dropping tables:', error);
  }
};

module.exports = {
  initializeDatabase,
  dropTables
};

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase();
}
