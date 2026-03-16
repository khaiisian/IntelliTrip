const express = require('express');
const router = express.Router();
const expController = require('../controllers/attractionExperience.controller');

router.get('/attractions/:id/experiences', expController.getExperiencesByAttraction);
router.get('/attraction-experiences/:code', expController.getExperienceByCode);
router.post('/attraction-experiences', expController.createExperience);
router.put('/attraction-experiences/:code', expController.updateExperience);
router.delete('/attraction-experiences/:code', expController.deleteExperience);

module.exports = router;
