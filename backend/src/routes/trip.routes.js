const express = require('express');
const router = express.Router();
const controller = require('../controllers/trip.controller');

router.post('/trips', controller.createTrip);
router.get('/users/:userId/trips', controller.getTripsByUser);
router.get('/trips/:code', controller.getTripByCode);
router.put('/trips/:code', controller.updateTrip);
router.delete('/trips/:code', controller.deleteTrip);

module.exports = router;
