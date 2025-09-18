const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Search vehicles
// GET /api/search/vehicles?vehicle_type=motorbike&city=New%20York&latitude=40.7128&longitude=-74.0060&radius=10&start_date=2024-09-20T10:00:00&end_date=2024-09-20T14:00:00
router.get('/vehicles', searchController.searchVehicles);

// Search drivers
// GET /api/search/drivers?latitude=40.7128&longitude=-74.0060&radius=5&vehicle_type=motorbike
router.get('/drivers', searchController.searchDrivers);

module.exports = router;
