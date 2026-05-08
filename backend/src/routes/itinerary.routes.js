const express = require('express');
const router = express.Router();
const controller = require('../controllers/itinerary.controller');

router.post('/trips/:code/generate-itinerary', controller.generateItinerary);
router.post('/trips/:code/itineraries/recalculate', controller.recalculateItinerary);
router.post('/trips/:code/itineraries', controller.saveItinerary);
router.get('/trips/:code/itineraries', controller.getSavedItinerary);
router.get('/users/:code/itineraries', controller.getItinerariesByUserCode);

module.exports = router;