const express = require('express');
const router = express.Router();
const controller = require('../controllers/itinerary.controller');

router.post('/trips/:code/generate-itinerary', controller.generateItinerary);

module.exports = router;