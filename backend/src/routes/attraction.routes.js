const express = require('express');
const router = express.Router();
const controller = require('../controllers/attraction.controller');

router.post('/attractions', controller.createAttraction);
router.get('/attractions', controller.getAttractions);
router.get('/attractions/:code', controller.getAttractionByCode);
router.put('/attractions/:code', controller.updateAttraction);
router.delete('/attractions/:code', controller.deleteAttraction);

module.exports = router;
