const express = require('express');
const router = express.Router();
const controller = require('../controllers/tripPreference.controller');

router.post('/trip-preferences', controller.createPreference);
router.get('/trips/:tripId/preferences', controller.getPreferencesByTrip);
router.get('/trip-preferences/:code', controller.getPreferenceByCode);
router.put('/trip-preferences/:code', controller.updatePreference);
router.delete('/trip-preferences/:code', controller.deletePreference);

module.exports = router;