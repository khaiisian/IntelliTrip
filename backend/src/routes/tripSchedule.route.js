const express = require('express');
const router = express.Router();
const controller = require('../controllers/tripSchedule.controller');

router.post('/trip-schedules', controller.createSchedule);
router.get('/trips/:tripId/schedules', controller.getSchedulesByTrip);
router.get('/trip-schedules/:id', controller.getScheduleById);
router.put('/trip-schedules/:id', controller.updateSchedule);
router.delete('/trip-schedules/:id', controller.deleteSchedule);

module.exports = router;