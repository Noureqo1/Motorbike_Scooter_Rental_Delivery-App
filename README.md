# Motorbike & Scooter Rental & Delivery App - Backend

A comprehensive backend API for a platform connecting users with mobility providers for flexible rentals and deliveries in urban areas.

## Features

- **Vehicle Search**: Find available motorbikes and scooters by location, type, dates, and price
- **Driver Search**: Locate available drivers for delivery services
- **Booking System**: Create and manage rental/delivery bookings
- **Payment Processing**: Mock payment integration for bookings
- **Order Tracking**: Real-time delivery tracking with status updates
- **User Management**: Authentication and user profile management
- **Vendor Management**: Multi-vendor support with verification system

## Tech Stack

- **Node.js** with **Express.js**
- **PostgreSQL** with **Sequelize ORM**
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests
- **Helmet** for security

## Project Structure

```
src/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   ├── searchController.js   # Vehicle and driver search
│   ├── bookingController.js  # Booking management
│   └── deliveryController.js # Delivery and tracking
├── models/
│   ├── User.js              # User model
│   ├── Vendor.js            # Vendor model
│   ├── Driver.js            # Driver model
│   ├── Vehicle.js           # Vehicle model
│   ├── Booking.js           # Booking model
│   ├── Delivery.js          # Delivery model
│   └── index.js             # Model associations
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── search.js            # Search routes
│   ├── bookings.js          # Booking routes
│   ├── deliveries.js        # Delivery routes
│   ├── users.js             # User management routes
│   ├── vendors.js           # Vendor routes
│   ├── vehicles.js          # Vehicle routes
│   └── drivers.js           # Driver routes
├── utils/
│   ├── databaseInit.js      # Database initialization
│   └── seedDatabase.js      # Sample data seeding
├── middleware/              # Custom middleware
└── server.js                # Main server file
```

## Database Schema

### Core Entities

1. **User** - Customers, vendor admins, and drivers
2. **Vendor** - Vehicle rental companies
3. **Driver** - Delivery personnel
4. **Vehicle** - Motorbikes and scooters
5. **Booking** - Rental/delivery reservations
6. **Delivery** - Delivery-specific information

### Key Relationships

- User → Vendor (vendor admin)
- Vendor → Driver (employs)
- Vendor → Vehicle (owns)
- User → Booking (makes)
- Vehicle → Booking (assigned)
- Driver → Booking (assigned)
- Booking → Delivery (has optional delivery)

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Search
- `GET /api/search/vehicles` - Search available vehicles
- `GET /api/search/drivers` - Search available drivers

### Bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get booking details
- `GET /api/bookings/user/:user_id` - Get user's bookings
- `PUT /api/bookings/:id/status` - Update booking status
- `POST /api/bookings/payment` - Process payment

### Deliveries
- `POST /api/deliveries` - Create delivery request
- `GET /api/deliveries/:id` - Get delivery details
- `GET /api/deliveries/track/:tracking_number` - Track delivery (public)
- `PUT /api/deliveries/:id/status` - Update delivery status

### Management
- `GET /api/users` - List users
- `GET /api/vendors` - List vendors
- `GET /api/vehicles` - List vehicles
- `GET /api/drivers` - List drivers

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd motorbike-scooter-rental-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env` file and update database credentials:
   ```env
   PORT=3000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=motorbike_rental_db
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   ```

4. **Database Setup**
   - Create PostgreSQL database
   - Run database initialization:
   ```bash
   node src/utils/databaseInit.js
   ```

5. **Seed Sample Data** (Optional)
   ```bash
   node src/utils/seedDatabase.js
   ```

6. **Start Server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:3000`

## API Usage Examples

### Search Vehicles
```bash
GET /api/search/vehicles?vehicle_type=motorbike&city=New%20York&latitude=40.7128&longitude=-74.0060&radius=10&start_date=2024-09-20T10:00:00&end_date=2024-09-20T14:00:00
```

### Create Booking
```bash
POST /api/bookings
Content-Type: application/json

{
  "user_id": "user-uuid",
  "vehicle_id": "vehicle-uuid",
  "start_date": "2024-09-20T10:00:00Z",
  "end_date": "2024-09-20T14:00:00Z",
  "pickup_location_lat": 40.7128,
  "pickup_location_lng": -74.0060,
  "special_requests": "Please include helmet"
}
```

### Track Delivery
```bash
GET /api/deliveries/track/DEL20240918123045001
```

## Mock Data

The application includes sample data for testing:

- **Users**: 3 users (customer, vendor admin, driver)
- **Vendor**: 1 verified vendor (CityScoot Rentals)
- **Driver**: 1 approved driver
- **Vehicles**: 2 vehicles (Honda motorbike, Vespa scooter)
- **Booking**: 1 confirmed booking
- **Delivery**: 1 pending delivery

## Next Steps

1. **Frontend Integration**: Connect with React/Vue.js frontend
2. **Real Payment Gateway**: Integrate Stripe/PayPal
3. **Real-time Updates**: WebSocket for live tracking
4. **File Upload**: Image upload for vehicles/profiles
5. **Notifications**: Email/SMS notifications
6. **Admin Dashboard**: Vendor management interface
7. **Mobile App**: React Native mobile application

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## License

ISC License
