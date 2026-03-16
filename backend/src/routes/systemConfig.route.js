const express = require('express');
const router = express.Router();
const controller = require('../controllers/systemConfig.controller');

router.post('/system-configs', controller.createConfig);
router.get('/system-configs', controller.getConfigs);
router.get('/system-configs/:id', controller.getConfigById);
router.put('/system-configs/:id', controller.updateConfig);
router.delete('/system-configs/:id', controller.deleteConfig);

module.exports = router;