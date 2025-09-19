const bcrypt = require('bcryptjs');
const models = require('../models');

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = await models.User.bulkCreate([
      {
        email: 'mo.aziz@example.com',
        password_hash: hashedPassword,
        first_name: 'mo',
        last_name: 'aziz',
        phone: '+1234567890',
        user_type: 'customer'
      },
      {
        email: 'so.mesbah@example.com',
        password_hash: hashedPassword,
        first_name: 'so',
        last_name: 'mesbah',
        phone: '+1234567891',
        user_type: 'vendor_admin'
      },
      {
        email: 'driver1@example.com',
        password_hash: hashedPassword,
        first_name: 'Mike',
        last_name: 'Johnson',
        phone: '+1234567892',
        user_type: 'driver'
      }
    ]);

    // Create sample vendor
    const vendor = await models.Vendor.create({
      name: 'CityScoot Rentals',
      description: 'Premium motorbike and scooter rentals in downtown',
      email: 'contact@cityscoot.com',
      phone: '+1234567893',
      address: '123 Main Street, Downtown',
      city: 'New York',
      latitude: 40.7128,
      longitude: -74.0060,
      license_number: 'VEN001',
      is_verified: true,
      rating: 4.5,
      created_by: users[1].id
    });

    // Create sample driver
    const driver = await models.Driver.create({
      user_id: users[2].id,
      vendor_id: vendor.id,
      license_number: 'DRV001',
      license_type: 'both',
      years_of_experience: 3,
      rating: 4.7,
      is_available: true,
      current_location_lat: 40.7128,
      current_location_lng: -74.0060,
      phone_verified: true,
      background_check_status: 'approved'
    });

    // Create sample vehicles
    const vehicles = await models.Vehicle.bulkCreate([
      {
        vendor_id: vendor.id,
        vehicle_type: 'motorbike',
        make: 'Honda',
        model: 'CBR 250R',
        year: 2022,
        license_plate: 'ABC123',
        color: 'Red',
        fuel_type: 'petrol',
        transmission: 'manual',
        seating_capacity: 2,
        hourly_rate: 15.00,
        daily_rate: 80.00,
        description: 'Sporty motorbike perfect for city riding',
        images: ['https://example.com/honda-cbr.jpg'],
        location_lat: 40.7128,
        location_lng: -74.0060,
        is_available: true,
        condition_status: 'excellent',
        mileage: 5000,
        last_service_date: new Date('2024-06-01'),
        insurance_valid_until: new Date('2025-06-01')
      },
      {
        vendor_id: vendor.id,
        vehicle_type: 'scooter',
        make: 'Vespa',
        model: 'Sprint 150',
        year: 2023,
        license_plate: 'XYZ456',
        color: 'Blue',
        fuel_type: 'petrol',
        transmission: 'automatic',
        seating_capacity: 2,
        hourly_rate: 12.00,
        daily_rate: 60.00,
        description: 'Classic scooter for comfortable city commuting',
        images: ['https://example.com/vespa-sprint.jpg'],
        location_lat: 40.7128,
        location_lng: -74.0060,
        is_available: true,
        condition_status: 'excellent',
        mileage: 2000,
        last_service_date: new Date('2024-07-01'),
        insurance_valid_until: new Date('2025-07-01')
      }
    ]);

    // Create sample booking
    const booking = await models.Booking.create({
      user_id: users[0].id,
      vehicle_id: vehicles[0].id,
      driver_id: driver.id,
      booking_type: 'rental',
      start_date: new Date('2024-09-20T10:00:00'),
      end_date: new Date('2024-09-20T14:00:00'),
      pickup_location_lat: 40.7128,
      pickup_location_lng: -74.0060,
      total_hours: 4,
      total_amount: 60.00,
      status: 'confirmed',
      payment_status: 'paid',
      payment_method: 'card',
      special_requests: 'Please include helmet and lock'
    });

    // Create sample delivery
    const delivery = await models.Delivery.create({
      booking_id: booking.id,
      sender_name: 'Alice Johnson',
      sender_phone: '+1234567894',
      sender_address: '456 Oak Street, Downtown',
      recipient_name: 'Bob Wilson',
      recipient_phone: '+1234567895',
      recipient_address: '789 Pine Avenue, Uptown',
      package_description: 'Small electronic device in protective packaging',
      package_weight: 2.5,
      package_dimensions: { length: 30, width: 20, height: 10 },
      delivery_priority: 'standard',
      estimated_delivery_time: new Date('2024-09-20T16:00:00'),
      delivery_status: 'pending',
      delivery_fee: 15.00,
      tips: 5.00
    });

    console.log('Database seeded successfully!');
    console.log('Sample data created:');
    console.log('- 3 Users (1 customer, 1 vendor admin, 1 driver)');
    console.log('- 1 Vendor');
    console.log('- 1 Driver');
    console.log('- 2 Vehicles');
    console.log('- 1 Booking');
    console.log('- 1 Delivery');

  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDatabase;

// Run seeding if this file is executed directly
if (require.main === module) {
  const { sequelize } = require('../config/database');

  sequelize.authenticate()
    .then(() => seedDatabase())
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}
