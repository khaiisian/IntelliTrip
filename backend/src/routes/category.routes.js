const express = require('express');
const router = express.Router();
const controller = require('../controllers/category.controller');

router.post('/categories', controller.createCategory);
router.get('/categories', controller.getCategories);
router.get('/categories/:code', controller.getCategoryByCode);
router.put('/categories/:code', controller.updateCategoryByCode);
router.delete('/categories/:code', controller.deleteCategoryByCode);

module.exports = router;
