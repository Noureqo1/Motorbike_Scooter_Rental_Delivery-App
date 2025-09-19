# Motorbike & Scooter Rental & Delivery App

## Database Schema

### Vehicle
| Field            | Type           | Description                                 |
|------------------|----------------|---------------------------------------------|
| id               | INTEGER        | Primary Key, unique vehicle identifier      |
| vendor_id        | INTEGER        | Foreign Key to Vendor table                 |
| vehicle_type     | VARCHAR(255)    | Type of vehicle (e.g., Scooter, Motorbike)  |
| model            | VARCHAR(255)    | Vehicle model name                          |
| plate_number     | VARCHAR(255)    | Vehicle plate number                        |
| availability     | BOOLEAN        | Availability status                         |
| price_per_hour   | DECIMAL(10,2)   | Rental price per hour                       |
| created_at       | TIMESTAMP      | Record creation timestamp                   |
| updated_at       | TIMESTAMP      | Record update timestamp                     |

### Vendor
| Field            | Type           | Description                                 |
|------------------|----------------|---------------------------------------------|
| id               | INTEGER        | Primary Key, unique vendor identifier       |
| name             | VARCHAR(255)    | Vendor name                                 |
| email            | VARCHAR(255)    | Vendor contact email                        |
| phone_number     | VARCHAR(20)     | Vendor contact phone number                 |
| address          | TEXT           | Vendor address                              |
| rating           | DECIMAL(3,2)    | Average rating of vendor                    |
| created_at       | TIMESTAMP      | Record creation timestamp                   |
| updated_at       | TIMESTAMP      | Record update timestamp                     |

### User
| Field            | Type           | Description                                 |
|------------------|----------------|---------------------------------------------|
| id               | INTEGER        | Primary Key, unique user identifier         |
| first_name       | VARCHAR(255)    | User first name                             |
| last_name        | VARCHAR(255)    | User last name                              |
| email            | VARCHAR(255)    | User email                                  |
| phone_number     | VARCHAR(20)     | User phone number                           |
| address          | TEXT           | User address                                |
| payment_method   | VARCHAR(255)    | Payment method (e.g., Credit Card)          |
| created_at       | TIMESTAMP      | Record creation timestamp                   |
| updated_at       | TIMESTAMP      | Record update timestamp                     |

### Booking
| Field            | Type           | Description                                 |
|------------------|----------------|---------------------------------------------|
| id               | INTEGER        | Primary Key, unique booking identifier      |
| user_id          | INTEGER        | Foreign Key to User table                   |
| vehicle_id       | INTEGER        | Foreign Key to Vehicle table                |
| vendor_id        | INTEGER        | Foreign Key to Vendor table                 |
| start_time       | TIMESTAMP      | Booking start time                          |
| end_time         | TIMESTAMP      | Booking end time                            |
| total_price      | DECIMAL(10,2)   | Total rental price                          |
| status           | VARCHAR(50)     | Booking status (e.g., Pending, Confirmed)   |
| created_at       | TIMESTAMP      | Record creation timestamp                   |
| updated_at       | TIMESTAMP      | Record update timestamp                     |

### Delivery
| Field            | Type           | Description                                 |
|------------------|----------------|---------------------------------------------|
| id               | INTEGER        | Primary Key, unique delivery identifier     |
| booking_id       | INTEGER        | Foreign Key to Booking table                |
| pickup_location  | TEXT           | Pickup address                              |
| delivery_location| TEXT           | Delivery address                            |
| status           | VARCHAR(50)     | Delivery status (e.g., Pending, Completed)  |
| delivery_time    | TIMESTAMP      | Scheduled delivery time                     |
| driver_id        | INTEGER        | Foreign Key to Driver table                 |
| created_at       | TIMESTAMP      | Record creation timestamp                   |
| updated_at       | TIMESTAMP      | Record update timestamp                     |

### Driver
| Field            | Type           | Description                                 |
|------------------|----------------|---------------------------------------------|
| id               | INTEGER        | Primary Key, unique driver identifier       |
| name             | VARCHAR(255)    | Driver's full name                          |
| phone_number     | VARCHAR(20)     | Driver's phone number                       |
| vehicle_id       | INTEGER        | Foreign Key to Vehicle table                |
| status           | VARCHAR(50)     | Driver status (e.g., Available, On Duty)    |
| rating           | DECIMAL(3,2)    | Average driver rating                       |
| created_at       | TIMESTAMP      | Record creation timestamp                   |
| updated_at       | TIMESTAMP      | Record update timestamp                     |

---

## Mock API Endpoints

### 1. Search Vehicles

#### Endpoint:
```http
GET /api/vehicles/search
````

#### Query Parameters:

* `vehicle_type` (optional)
* `location` (optional)
* `availability` (optional)

#### Response:

```json
[
  {
    "id": 1,
    "vendor_id": 2,
    "vehicle_type": "Motorbike",
    "model": "Yamaha YZF-R3",
    "price_per_hour": 10.00,
    "availability": true
  },
  ...
]
```

---

### 2. Booking a Vehicle

#### Endpoint:

```http
POST /api/bookings
```

#### Request Body:

```json
{
  "user_id": 1,
  "vehicle_id": 3,
  "start_time": "2025-09-15T09:00:00",
  "end_time": "2025-09-15T12:00:00"
}
```

#### Response:

```json
{
  "booking_id": 101,
  "status": "Confirmed",
  "total_price": 30.00
}
```

---

### 3. Payment for Booking

#### Endpoint:

```http
POST /api/payments
```

#### Request Body:

```json
{
  "booking_id": 101,
  "amount": 30.00,
  "payment_method": "Credit Card"
}
```

#### Response:

```json
{
  "payment_id": 202,
  "status": "Success",
  "transaction_id": "TXN123456"
}
```

---

### 4. Order Tracking (Delivery)

#### Endpoint:

```http
GET /api/deliveries/{delivery_id}/track
```

#### Response:

```json
{
  "delivery_id": 305,
  "status": "In Transit",
  "driver_name": "John Doe",
  "estimated_delivery_time": "2025-09-15T12:30:00"
}
```
