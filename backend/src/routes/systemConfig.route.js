const express = require('express');
const router = express.Router();
const controller = require('../controllers/systemConfig.controller');

router.post('/system-configs', controller.createConfig);
router.get('/system-configs', controller.getConfigs);
router.get('/system-configs/:id', controller.getConfigById);
router.get('/admin/metrics', controller.getMetrics);
router.get('/admin/metrics/trips-over-time', controller.getTripsOverTime);
router.get('/admin/metrics/visits-by-category', controller.getVisitsByCategory);
router.get('/admin/metrics/top-attractions', controller.getTopAttractions);
router.get('/admin/metrics/experience-usage', controller.getExperienceUsage);
router.put('/system-configs/:id', controller.updateConfig);
router.delete('/system-configs/:id', controller.deleteConfig);

module.exports = router;