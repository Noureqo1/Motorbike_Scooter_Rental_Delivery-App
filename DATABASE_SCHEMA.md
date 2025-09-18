# Database Schema Design for Motorbike & Scooter Rental & Delivery App

## Overview
This document outlines the database schema for a platform connecting users with mobility providers for flexible rentals and deliveries in urban areas.

## Entities and Relationships

### 1. User (users table)
- id: Primary Key (UUID)
- email: Unique email address
- password_hash: Hashed password
- first_name: User's first name
- last_name: User's last name
- phone: Phone number
- profile_image_url: Optional profile image
- user_type: Enum (customer, vendor_admin, driver)
- is_active: Boolean (default true)
- created_at: Timestamp
- updated_at: Timestamp

### 2. Vendor (vendors table)
- id: Primary Key (UUID)
- name: Vendor company name
- description: Vendor description
- email: Contact email
- phone: Contact phone
- address: Physical address
- city: City location
- latitude: GPS latitude
- longitude: GPS longitude
- license_number: Business license
- is_verified: Boolean (default false)
- rating: Average rating (decimal 0-5)
- created_by: Foreign Key to users.id (vendor admin)
- created_at: Timestamp
- updated_at: Timestamp

### 3. Driver (drivers table)
- id: Primary Key (UUID)
- user_id: Foreign Key to users.id
- vendor_id: Foreign Key to vendors.id
- license_number: Driver's license number
- license_type: License type (motorcycle, scooter, both)
- years_of_experience: Years of driving experience
- rating: Driver rating (decimal 0-5)
- is_available: Boolean (default true)
- current_location_lat: Current latitude
- current_location_lng: Current longitude
- phone_verified: Boolean (default false)
- background_check_status: Enum (pending, approved, rejected)
- created_at: Timestamp
- updated_at: Timestamp

### 4. Vehicle (vehicles table)
- id: Primary Key (UUID)
- vendor_id: Foreign Key to vendors.id
- vehicle_type: Enum (motorbike, scooter, electric_scooter)
- make: Vehicle manufacturer
- model: Vehicle model
- year: Manufacturing year
- license_plate: License plate number
- color: Vehicle color
- fuel_type: Enum (petrol, electric, hybrid)
- transmission: Enum (manual, automatic)
- seating_capacity: Number of seats
- hourly_rate: Cost per hour
- daily_rate: Cost per day
- description: Vehicle description
- images: Array of image URLs (JSON)
- location_lat: Parking latitude
- location_lng: Parking longitude
- is_available: Boolean (default true)
- condition_status: Enum (excellent, good, fair, poor)
- mileage: Current mileage
- last_service_date: Date of last service
- insurance_valid_until: Insurance expiry date
- created_at: Timestamp
- updated_at: Timestamp

### 5. Booking (bookings table)
- id: Primary Key (UUID)
- user_id: Foreign Key to users.id
- vehicle_id: Foreign Key to vehicles.id
- driver_id: Foreign Key to drivers.id (optional)
- booking_type: Enum (rental, delivery)
- start_date: Booking start date/time
- end_date: Booking end date/time
- pickup_location_lat: Pickup latitude
- pickup_location_lng: Pickup longitude
- dropoff_location_lat: Dropoff latitude (optional)
- dropoff_location_lng: Dropoff longitude (optional)
- total_hours: Total hours booked
- total_amount: Total booking amount
- status: Enum (pending, confirmed, in_progress, completed, cancelled)
- payment_status: Enum (pending, paid, refunded)
- payment_method: Enum (cash, card, digital_wallet)
- special_requests: Text field for special requirements
- created_at: Timestamp
- updated_at: Timestamp

### 6. Delivery (deliveries table)
- id: Primary Key (UUID)
- booking_id: Foreign Key to bookings.id
- sender_name: Sender's name
- sender_phone: Sender's phone
- sender_address: Pickup address
- recipient_name: Recipient's name
- recipient_phone: Recipient's phone
- recipient_address: Delivery address
- package_description: Description of package/item
- package_weight: Package weight in kg
- package_dimensions: Package dimensions (JSON)
- delivery_priority: Enum (standard, express, urgent)
- estimated_delivery_time: Estimated delivery time
- actual_delivery_time: Actual delivery time
- delivery_status: Enum (pending, picked_up, in_transit, delivered, failed)
- delivery_fee: Additional delivery fee
- tips: Driver tip amount
- tracking_number: Unique tracking number
- created_at: Timestamp
- updated_at: Timestamp

## Key Relationships

1. **User → Vendor**: One user can create/manage one vendor (vendor_admin)
2. **Vendor → Driver**: One vendor can have many drivers
3. **Vendor → Vehicle**: One vendor can have many vehicles
4. **User → Booking**: One user can have many bookings
5. **Vehicle → Booking**: One vehicle can have many bookings (but not simultaneously)
6. **Driver → Booking**: One driver can be assigned to many bookings (but not simultaneously)
7. **Booking → Delivery**: One booking can have one delivery request

## Indexes for Performance

- users.email (unique)
- users.phone
- vendors.city
- vehicles.vendor_id + is_available
- vehicles.location_lat + location_lng (spatial index)
- bookings.user_id + status
- bookings.vehicle_id + start_date
- bookings.status + start_date
- deliveries.booking_id
- deliveries.tracking_number (unique)
- drivers.vendor_id + is_available
