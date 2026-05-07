const express = require('express');
const router = express.Router();
const controller = require('../controllers/itinerary.controller');

router.post('/trips/:code/generate-itinerary', controller.generateItinerary);
router.post('/trips/:code/save-itinerary', controller.saveItinerary);

module.exports = router;