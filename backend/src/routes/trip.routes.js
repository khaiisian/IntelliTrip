const express = require('express');
const router = express.Router();
const controller = require('../controllers/trip.controller');

router.post('/trips', controller.createTrip);
router.post('/trips/ai-parse-full', controller.parseFullTrip);
router.get('/users/:userId/trips', controller.getTripsByUser);
router.post('/trips/:code/parse-preferences', controller.parseUserPreferences);
router.get('/trips/:code', controller.getTripByCode);
router.put('/trips/:code', controller.updateTrip);
router.delete('/trips/:code', controller.deleteTrip);

module.exports = router;
